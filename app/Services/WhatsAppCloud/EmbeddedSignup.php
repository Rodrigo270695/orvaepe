<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Models\WaChannel;
use App\Models\WaTemplate;

/**
 * Conecta el número propio de una clínica (Embedded Signup de Meta):
 * canjea el code por el token de la clínica, suscribe la app a su WABA, registra el número,
 * guarda el canal (pendiente) y crea las plantillas en su WABA. El canal se activa cuando
 * Meta aprueba una plantilla; mientras tanto el producto sigue enviando por OpenWA.
 */
final class EmbeddedSignup
{
    public function __construct(
        private readonly GraphApi $graph,
        private readonly TemplateProvisioner $templates,
    ) {}

    /**
     * Lo que necesita el botón "Conectar WhatsApp" del producto (nada secreto).
     *
     * @return array{enabled: bool, app_id: string|null, config_id: string|null, graph_version: string}
     */
    public function publicConfig(): array
    {
        $enabled = $this->isReady();

        return [
            'enabled' => $enabled,
            'app_id' => $enabled ? (string) config('whatsapp_cloud.embedded_signup.app_id') : null,
            'config_id' => $enabled ? (string) config('whatsapp_cloud.embedded_signup.config_id') : null,
            'graph_version' => (string) config('whatsapp_cloud.graph_version'),
        ];
    }

    /**
     * @param  bool  $coexistencia  número que sigue usando la app WhatsApp Business: no se registra.
     * @return array{channel: WaChannel, plantillas: list<WaTemplate>, errores: list<array{nombre: string, error_code: string, message: string}>}
     */
    public function connect(
        string $producto,
        string $tenantId,
        string $code,
        string $wabaId,
        string $phoneNumberId,
        bool $coexistencia = false,
    ): array {
        if (! $this->isReady()) {
            throw new WhatsAppCloudException('Embedded Signup no está activado.', 'embedded_signup_disabled', 409);
        }

        $taken = WaChannel::query()
            ->where('phone_number_id', $phoneNumberId)
            ->where(fn ($q) => $q->where('producto', '!=', $producto)->orWhere('tenant_id', '!=', $tenantId))
            ->exists();

        if ($taken) {
            throw new WhatsAppCloudException('Ese número ya está conectado a otro tenant.', 'phone_in_use', 409);
        }

        $token = $this->exchangeCode($code);

        $this->graph->post("{$wabaId}/subscribed_apps", $token);

        $pin = null;
        if (! $coexistencia) {
            $pin = (string) random_int(100000, 999999);
            $this->graph->post("{$phoneNumberId}/register", $token, [
                'messaging_product' => 'whatsapp',
                'pin' => $pin,
            ]);
        }

        $phone = $this->graph->get($phoneNumberId, $token, ['fields' => 'display_phone_number,verified_name']);

        $channel = WaChannel::query()->updateOrCreate(
            ['producto' => $producto, 'tenant_id' => $tenantId],
            [
                'provider' => WaChannel::PROVIDER_CLOUD,
                'phone_number_id' => $phoneNumberId,
                'waba_id' => $wabaId,
                'display_phone_number' => isset($phone['display_phone_number']) ? (string) $phone['display_phone_number'] : null,
                'verified_name' => isset($phone['verified_name']) ? (string) $phone['verified_name'] : null,
                'access_token' => $token,
                'registration_pin' => $pin,
                'estado' => WaChannel::ESTADO_PENDIENTE,
            ],
        );

        $result = $this->templates->provisionAll($channel);

        $approved = collect($result['plantillas'])->contains(fn (WaTemplate $t): bool => $t->estado === WaTemplate::ESTADO_APROBADA);
        if ($approved) {
            $channel->forceFill(['estado' => WaChannel::ESTADO_ACTIVO])->save();
        }

        return ['channel' => $channel, 'plantillas' => $result['plantillas'], 'errores' => $result['errores']];
    }

    private function isReady(): bool
    {
        return (bool) config('whatsapp_cloud.embedded_signup.enabled')
            && (string) config('whatsapp_cloud.embedded_signup.app_id') !== ''
            && (string) config('whatsapp_cloud.app_secret') !== '';
    }

    private function exchangeCode(string $code): string
    {
        $response = $this->graph->get('oauth/access_token', null, [
            'client_id' => (string) config('whatsapp_cloud.embedded_signup.app_id'),
            'client_secret' => (string) config('whatsapp_cloud.app_secret'),
            'code' => $code,
        ]);

        $token = (string) ($response['access_token'] ?? '');
        if ($token === '') {
            throw new WhatsAppCloudException('Meta no devolvió el token de la clínica.', 'token_exchange', 502);
        }

        return $token;
    }
}
