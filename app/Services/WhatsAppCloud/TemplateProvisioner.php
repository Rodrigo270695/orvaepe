<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Models\WaChannel;
use App\Models\WaTemplate;

/**
 * Crea las plantillas de config whatsapp_cloud.templates en la WABA de una clínica
 * (POST /{waba_id}/message_templates) y guarda su estado en wa_templates.
 * Meta avisa la aprobación por message_template_status_update.
 * Apagado mientras WHATSAPP_EMBEDDED_SIGNUP_ENABLED=false.
 */
final class TemplateProvisioner
{
    public function __construct(
        private readonly GraphApi $graph,
    ) {}

    /**
     * @return array{plantillas: list<WaTemplate>, errores: list<array{nombre: string, error_code: string, message: string}>}
     */
    public function provisionAll(WaChannel $channel): array
    {
        $plantillas = [];
        $errores = [];

        foreach (array_keys((array) config('whatsapp_cloud.templates', [])) as $nombre) {
            try {
                $plantillas[] = $this->provision($channel, (string) $nombre);
            } catch (WhatsAppCloudException $e) {
                $errores[] = ['nombre' => (string) $nombre, 'error_code' => $e->errorCode, 'message' => $e->getMessage()];
            }
        }

        return ['plantillas' => $plantillas, 'errores' => $errores];
    }

    public function provision(WaChannel $channel, string $nombre): WaTemplate
    {
        if (! (bool) config('whatsapp_cloud.embedded_signup.enabled')) {
            throw new WhatsAppCloudException('Embedded Signup no está activado.', 'embedded_signup_disabled', 409);
        }

        $definition = config("whatsapp_cloud.templates.{$nombre}");
        if (! is_array($definition)) {
            throw new WhatsAppCloudException("Plantilla desconocida: {$nombre}.", 'template_not_found', 422);
        }

        $wabaId = (string) $channel->waba_id;
        $token = (string) $channel->access_token;

        if ($channel->provider !== WaChannel::PROVIDER_CLOUD || $wabaId === '' || $token === '') {
            throw new WhatsAppCloudException('El canal debe ser Cloud API con waba_id y token.', 'channel_config', 422);
        }

        $idioma = (string) config('whatsapp_cloud.template_language', 'es_PE');
        $categoria = (string) ($definition['categoria'] ?? 'utility');

        $created = $this->existing($wabaId, $token, $nombre, $idioma)
            ?? $this->graph->post("{$wabaId}/message_templates", $token, [
                'name' => $nombre,
                'language' => $idioma,
                'category' => strtoupper($categoria),
                'components' => [[
                    'type' => 'BODY',
                    'text' => (string) $definition['cuerpo'],
                    'example' => ['body_text' => [array_values((array) ($definition['ejemplos'] ?? []))]],
                ]],
            ]);

        return WaTemplate::query()->updateOrCreate(
            [
                'producto' => $channel->producto,
                'tenant_id' => $channel->tenant_id,
                'nombre' => $nombre,
                'idioma' => $idioma,
            ],
            [
                'waba_id' => $wabaId,
                'meta_template_id' => (string) ($created['id'] ?? ''),
                'tipo' => (string) $definition['tipo'],
                'estado' => WaTemplate::estadoFromMeta((string) ($created['status'] ?? 'PENDING')) ?? WaTemplate::ESTADO_PENDIENTE,
                'categoria' => $categoria,
                'num_variables' => (int) $definition['variables'],
                'cuerpo' => (string) $definition['cuerpo'],
                'motivo' => null,
            ],
        );
    }

    /**
     * Si la clínica se reconecta, la plantilla ya existe en su WABA y Meta rechaza crearla otra vez.
     *
     * @return array{id?: string, status?: string}|null
     */
    private function existing(string $wabaId, string $token, string $nombre, string $idioma): ?array
    {
        $found = $this->graph->get("{$wabaId}/message_templates", $token, [
            'name' => $nombre,
            'fields' => 'id,name,language,status',
        ]);

        foreach ((array) ($found['data'] ?? []) as $template) {
            if (($template['name'] ?? null) === $nombre && ($template['language'] ?? null) === $idioma) {
                return ['id' => (string) ($template['id'] ?? ''), 'status' => (string) ($template['status'] ?? 'PENDING')];
            }
        }

        return null;
    }
}
