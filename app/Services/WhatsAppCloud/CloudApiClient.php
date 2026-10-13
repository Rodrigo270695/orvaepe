<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Models\WaChannel;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Envío de plantillas por la WhatsApp Cloud API (Graph API de Meta).
 */
final class CloudApiClient
{
    /**
     * Códigos de Meta por límite de velocidad: se reintentan con backoff.
     *
     * @see https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
     */
    private const RATE_LIMIT_CODES = [4, 80007, 130429, 131048, 131056];

    /**
     * @param  list<string>  $variables
     * @return string wamid (messages[0].id)
     */
    public function sendTemplate(
        WaChannel $channel,
        string $telefono,
        string $plantilla,
        array $variables,
        string $idioma,
    ): string {
        $token = (string) $channel->access_token;
        $phoneNumberId = (string) $channel->phone_number_id;

        if ($token === '' || $phoneNumberId === '') {
            throw new WhatsAppCloudException('Canal sin access_token o phone_number_id.', 'channel_config', 422);
        }

        $template = [
            'name' => $plantilla,
            'language' => ['code' => $idioma],
        ];

        if ($variables !== []) {
            $template['components'] = [[
                'type' => 'body',
                'parameters' => array_map(
                    fn (string $value): array => ['type' => 'text', 'text' => $value],
                    $variables,
                ),
            ]];
        }

        $url = config('whatsapp_cloud.graph_url').'/'.config('whatsapp_cloud.graph_version').'/'.$phoneNumberId.'/messages';

        try {
            $response = Http::timeout((int) config('whatsapp_cloud.send_timeout_seconds', 15))
                ->withToken($token)
                ->acceptJson()
                ->post($url, [
                    'messaging_product' => 'whatsapp',
                    'to' => $telefono,
                    'type' => 'template',
                    'template' => $template,
                ]);
        } catch (ConnectionException) {
            throw new WhatsAppCloudException('No se pudo conectar con la Cloud API.', 'network', 502, true);
        }

        if (! $response->successful()) {
            $code = (int) $response->json('error.code', 0);
            $details = (string) $response->json('error.error_data.details', '');

            throw new WhatsAppCloudException(
                $details !== '' ? $details : (string) $response->json('error.message', 'Cloud API HTTP '.$response->status()),
                $code !== 0 ? (string) $code : (string) $response->status(),
                502,
                $response->serverError() || $response->status() === 429 || in_array($code, self::RATE_LIMIT_CODES, true),
            );
        }

        $wamid = (string) $response->json('messages.0.id', '');
        if ($wamid === '') {
            throw new WhatsAppCloudException('La Cloud API no devolvió el id del mensaje.', 'no_message_id');
        }

        return $wamid;
    }
}
