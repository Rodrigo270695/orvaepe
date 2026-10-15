<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud\Providers;

use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Services\WhatsAppCloud\CloudApiClient;

final class CloudApiProvider implements WhatsAppProvider
{
    public function __construct(
        private readonly CloudApiClient $client,
    ) {}

    public function sendTemplate(WaChannel $channel, WaMessage $message, array $variables): ?string
    {
        return $this->client->sendTemplate(
            $channel,
            $message->telefono,
            (string) $message->plantilla,
            $variables,
            (string) ($message->idioma ?: config('whatsapp_cloud.template_language', 'es_PE')),
        );
    }

    public function parseWebhook(array $payload): array
    {
        $events = [];

        foreach ((array) data_get($payload, 'entry', []) as $entry) {
            $wabaId = (string) data_get($entry, 'id', '');

            foreach ((array) data_get($entry, 'changes', []) as $change) {
                $value = (array) data_get($change, 'value', []);

                $events = [...$events, ...match (data_get($change, 'field')) {
                    'messages' => $this->messageEvents($value),
                    'message_template_status_update' => $this->templateEvents($wabaId, $value),
                    default => [],
                }];
            }
        }

        return $events;
    }

    /**
     * @param  array<string, mixed>  $value
     * @return list<ProviderEvent>
     */
    private function messageEvents(array $value): array
    {
        $phoneNumberId = (string) data_get($value, 'metadata.phone_number_id', '');
        if ($phoneNumberId === '') {
            return [];
        }

        $events = [];

        foreach ((array) ($value['statuses'] ?? []) as $status) {
            if (! is_array($status) || ($status['id'] ?? '') === '') {
                continue;
            }

            $error = (array) data_get($status, 'errors.0', []);
            $errorMsg = (string) (data_get($error, 'error_data.details') ?: ($error['message'] ?? $error['title'] ?? ''));

            $events[] = ProviderEvent::status(
                $phoneNumberId,
                (string) $status['id'],
                strtolower((string) ($status['status'] ?? '')),
                $this->timestamp($status['timestamp'] ?? null),
                isset($error['code']) ? (string) $error['code'] : null,
                $errorMsg !== '' ? $errorMsg : null,
            );
        }

        foreach ((array) ($value['messages'] ?? []) as $message) {
            if (! is_array($message) || ($message['id'] ?? '') === '') {
                continue;
            }

            $contextId = (string) data_get($message, 'context.id', '');

            $events[] = ProviderEvent::message(
                $phoneNumberId,
                (string) $message['id'],
                (string) ($message['from'] ?? ''),
                (string) ($message['type'] ?? 'unknown'),
                $this->text($message),
                $contextId !== '' ? $contextId : null,
                $this->timestamp($message['timestamp'] ?? null),
            );
        }

        return $events;
    }

    /**
     * @param  array<string, mixed>  $value
     * @return list<ProviderEvent>
     */
    private function templateEvents(string $wabaId, array $value): array
    {
        $templateId = (string) ($value['message_template_id'] ?? '');
        $event = (string) ($value['event'] ?? '');

        if ($templateId === '' || $event === '') {
            return [];
        }

        $reason = $value['reason'] ?? null;

        return [ProviderEvent::templateStatus(
            $wabaId,
            $templateId,
            strtoupper($event),
            isset($value['message_template_name']) ? (string) $value['message_template_name'] : null,
            isset($value['message_template_language']) ? (string) $value['message_template_language'] : null,
            is_string($reason) && $reason !== '' && strtoupper($reason) !== 'NONE' ? $reason : null,
        )];
    }

    /**
     * @param  array<string, mixed>  $message
     */
    private function text(array $message): ?string
    {
        $text = data_get($message, 'text.body')
            ?? data_get($message, 'button.text')
            ?? data_get($message, 'interactive.button_reply.title')
            ?? data_get($message, 'interactive.list_reply.title');

        return is_string($text) && $text !== '' ? $text : null;
    }

    private function timestamp(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }
}
