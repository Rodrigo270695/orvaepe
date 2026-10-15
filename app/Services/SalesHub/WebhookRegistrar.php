<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use App\Models\OpenWaLine;
use App\Services\OpenWaLines\OpenWaLineManager;
use App\Services\OpenWaLines\OpenWaLinesClient;
use App\Services\OpenWaLines\OpenWaLinesException;

/**
 * Deja registrado en OpenWA el webhook de mensajes de una línea apuntando a ORVAE.
 */
final class WebhookRegistrar
{
    private const EVENTS = ['message.received'];

    public function __construct(
        private readonly OpenWaLinesClient $client,
        private readonly OpenWaLineManager $lines,
    ) {}

    public function url(OpenWaLine $line): string
    {
        return rtrim((string) config('app.url'), '/').'/api/webhooks/openwa-lines/'.$line->id;
    }

    /**
     * @return 'creado'|'actualizado'
     */
    public function ensure(OpenWaLine $line): string
    {
        $secret = (string) config('saleshub.webhook_secret');
        if ($secret === '') {
            throw new OpenWaLinesException('Falta SALESHUB_WEBHOOK_SECRET en el .env de ORVAE.');
        }

        if (! $line->openwa_session_id) {
            $this->lines->sync($line);
        }

        $url = $this->url($line);
        $existing = collect($this->client->listWebhooks($line->openwa_session_id))
            ->first(fn (array $webhook): bool => ($webhook['url'] ?? null) === $url);

        if (is_array($existing) && filled($existing['id'] ?? null)) {
            $this->client->updateWebhook($line->openwa_session_id, (string) $existing['id'], [
                'url' => $url,
                'events' => self::EVENTS,
                'secret' => $secret,
                'active' => true,
            ]);
            $line->forceFill(['webhook_id' => (string) $existing['id']])->save();

            return 'actualizado';
        }

        $created = $this->client->registerWebhook($line->openwa_session_id, $url, $secret, self::EVENTS);
        $line->forceFill(['webhook_id' => isset($created['id']) ? (string) $created['id'] : null])->save();

        return 'creado';
    }
}
