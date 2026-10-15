<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Models\WaChannel;
use App\Models\WaTemplate;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Embedded Signup (fase siguiente): cuando una clínica conecta su número, crea las plantillas
 * de config whatsapp_cloud.templates en su WABA (POST /{waba_id}/message_templates) y guarda
 * su estado en wa_templates. Meta avisa la aprobación por message_template_status_update.
 * Apagado mientras WHATSAPP_EMBEDDED_SIGNUP_ENABLED=false.
 */
final class TemplateProvisioner
{
    /**
     * @return list<WaTemplate>
     */
    public function provisionAll(WaChannel $channel): array
    {
        $templates = [];

        foreach (array_keys((array) config('whatsapp_cloud.templates', [])) as $nombre) {
            $templates[] = $this->provision($channel, (string) $nombre);
        }

        return $templates;
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
        $url = config('whatsapp_cloud.graph_url').'/'.config('whatsapp_cloud.graph_version').'/'.$wabaId.'/message_templates';

        try {
            $response = Http::timeout((int) config('whatsapp_cloud.send_timeout_seconds', 15))
                ->withToken($token)
                ->acceptJson()
                ->post($url, [
                    'name' => $nombre,
                    'language' => $idioma,
                    'category' => strtoupper($categoria),
                    'components' => [[
                        'type' => 'BODY',
                        'text' => (string) $definition['cuerpo'],
                        'example' => ['body_text' => [array_values((array) ($definition['ejemplos'] ?? []))]],
                    ]],
                ]);
        } catch (ConnectionException) {
            throw new WhatsAppCloudException('No se pudo conectar con la Cloud API.', 'network', 502, true);
        }

        if (! $response->successful()) {
            $code = (int) $response->json('error.code', 0);

            throw new WhatsAppCloudException(
                (string) ($response->json('error.error_user_msg') ?: $response->json('error.message', 'Cloud API HTTP '.$response->status())),
                $code !== 0 ? (string) $code : (string) $response->status(),
                502,
                $response->serverError() || $response->status() === 429,
            );
        }

        return WaTemplate::query()->updateOrCreate(
            [
                'producto' => $channel->producto,
                'tenant_id' => $channel->tenant_id,
                'nombre' => $nombre,
                'idioma' => $idioma,
            ],
            [
                'waba_id' => $wabaId,
                'meta_template_id' => (string) $response->json('id'),
                'tipo' => (string) $definition['tipo'],
                'estado' => WaTemplate::estadoFromMeta((string) $response->json('status', 'PENDING')) ?? WaTemplate::ESTADO_PENDIENTE,
                'categoria' => $categoria,
                'num_variables' => (int) $definition['variables'],
                'cuerpo' => (string) $definition['cuerpo'],
                'motivo' => null,
            ],
        );
    }
}
