<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use App\Jobs\SalesHub\GenerateReply;
use App\Models\OpenWaLine;
use App\Models\SalesHubConversation;
use App\Models\SalesHubMessage;
use App\Services\OpenWaLines\OpenWaLineManager;
use App\Services\OpenWaLines\OpenWaLinesClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Guarda cada mensaje de una línea de ventas y decide si el bot debe responder.
 */
final class InboundHandler
{
    private const NOISE_EVENTS = ['message.sent', 'message.ack', 'message.delivered', 'message.read', 'onack', 'presence', 'typing'];

    public function __construct(
        private readonly OutgoingEcho $echo,
        private readonly ProductResolver $products,
        private readonly ReplyDebouncer $debouncer,
        private readonly OpenAiClient $openAi,
        private readonly OpenWaLinesClient $client,
        private readonly OpenWaLineManager $lines,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return string resultado corto para la respuesta del webhook
     */
    public function handle(OpenWaLine $line, array $payload): string
    {
        $data = is_array($payload['data'] ?? null) ? $payload['data'] : $payload;

        if (! $this->isInboundChat((string) ($payload['event'] ?? $payload['type'] ?? ''))) {
            return 'ignored:event';
        }

        $fromMe = (bool) ($data['fromMe'] ?? $data['from_me'] ?? false);
        $chatId = (string) ($fromMe ? ($data['to'] ?? $data['chatId'] ?? '') : ($data['from'] ?? $data['chatId'] ?? ''));

        if ($chatId === '' || str_ends_with($chatId, '@g.us') || str_contains($chatId, 'broadcast') || str_ends_with($chatId, '@newsletter')) {
            return 'ignored:chat';
        }

        $messageId = is_scalar($data['id'] ?? null) ? (string) $data['id'] : '';
        if ($messageId !== '' && ! Cache::add('saleshub:msg:'.md5($line->id.'|'.$messageId), 1, 600)) {
            return 'ignored:duplicate';
        }

        $type = (string) ($data['type'] ?? 'chat');
        $body = trim((string) ($data['body'] ?? $data['content'] ?? $data['text'] ?? ''));
        $isAudio = in_array($type, ['ptt', 'audio'], true);

        return $fromMe
            ? $this->handleOutgoing($line, $chatId, $body, $isAudio, $messageId)
            : $this->handleIncoming($line, $chatId, $data, $body, $type, $isAudio, $messageId);
    }

    private function handleOutgoing(OpenWaLine $line, string $chatId, string $body, bool $isAudio, string $messageId): string
    {
        if ($this->echo->isEcho($line->id, $chatId, $body)) {
            return 'ignored:echo';
        }

        $conversation = SalesHubConversation::query()
            ->where('openwa_line_id', $line->id)
            ->where('wa_chat_id', $chatId)
            ->first();

        if ($conversation === null) {
            return 'ignored:outgoing';
        }

        $conversation->messages()->create([
            'direccion' => SalesHubMessage::OUT,
            'autor' => SalesHubMessage::AUTOR_HUMANO,
            'tipo' => $isAudio ? 'audio' : 'texto',
            'body' => $body !== '' ? $body : '[audio]',
            'producto' => $conversation->producto,
            'wa_message_id' => $messageId ?: null,
        ]);
        $conversation->forceFill(['last_outbound_at' => now(), 'no_leidos' => 0])->save();

        if ($conversation->bot_activo) {
            $conversation->pause(SalesHubConversation::PAUSA_AUTO, 'respondió un humano');

            return 'paused:human';
        }

        return 'stored:human';
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function handleIncoming(OpenWaLine $line, string $chatId, array $data, string $body, string $type, bool $isAudio, string $messageId): string
    {
        $conversation = SalesHubConversation::query()->firstOrCreate(
            ['openwa_line_id' => $line->id, 'wa_chat_id' => $chatId],
            ['phone' => $this->resolvePhone($line, $chatId, $data), 'nombre' => $this->resolveName($data)],
        );

        if ($conversation->nombre === null && ($name = $this->resolveName($data)) !== null) {
            $conversation->nombre = $name;
        }

        $text = $body;
        if ($text === '' && $isAudio) {
            $text = $this->transcribe($data, $conversation);
        }

        $conversation->messages()->create([
            'direccion' => SalesHubMessage::IN,
            'autor' => SalesHubMessage::AUTOR_CLIENTE,
            'tipo' => $isAudio ? 'audio' : ($text === '' ? $type : 'texto'),
            'body' => $text !== '' ? $text : ($isAudio ? '[audio]' : "[{$type}]"),
            'producto' => $conversation->producto,
            'wa_message_id' => $messageId ?: null,
        ]);
        $conversation->forceFill([
            'last_inbound_at' => now(),
            'no_leidos' => $conversation->no_leidos + 1,
        ])->save();

        if (! (bool) config('saleshub.enabled') || ! $line->bot_activo) {
            return 'stored:bot_off';
        }

        $conversation->resumeIfAutoPauseExpired();
        if (! $conversation->bot_activo) {
            return 'stored:paused';
        }

        if ($text === '') {
            if ($isAudio && $conversation->bot_engaged_at !== null) {
                $this->safeSend($line, $chatId, 'Recibí tu audio pero no lo pude escuchar bien 🙈 ¿Me lo escribes, porfa?');
            }

            return 'stored:no_text';
        }

        $detected = $this->products->detect($line, $text);
        if ($detected !== null && $detected !== $conversation->producto) {
            $conversation->forceFill(['producto' => $detected])->save();
        }

        if ($conversation->bot_engaged_at === null && $conversation->producto === null && ! $this->products->hasIntent($text)) {
            return 'stored:no_trigger';
        }

        $generation = $this->debouncer->bump($conversation->id);

        GenerateReply::dispatch($conversation->id, $generation, $isAudio)
            ->onQueue((string) config('saleshub.queue', 'default'))
            ->delay(now()->addSeconds(max(0, (int) config('saleshub.debounce_seconds', 5))));

        return 'queued';
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function transcribe(array $data, SalesHubConversation $conversation): string
    {
        $media = is_array($data['media'] ?? null) ? $data['media'] : [];
        $audio = base64_decode((string) ($media['data'] ?? ''), true);

        if (! config('saleshub.audio.transcribe') || ! $this->openAi->isConfigured() || $audio === false || strlen($audio) < 100) {
            return '';
        }

        $mime = (string) ($media['mimetype'] ?? 'audio/ogg');
        $ext = str_contains($mime, 'mp4') ? 'mp4' : (str_contains($mime, 'webm') ? 'webm' : (str_contains($mime, 'mpeg') ? 'mp3' : 'ogg'));

        try {
            return $this->openAi->transcribe($audio, "audio.{$ext}");
        } catch (Throwable $e) {
            Log::warning('saleshub.transcribe_failed', ['conversation' => $conversation->id, 'error' => $e->getMessage()]);

            return '';
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function resolvePhone(OpenWaLine $line, string $chatId, array $data): ?string
    {
        if (str_ends_with($chatId, '@c.us')) {
            return $this->digits($chatId);
        }

        foreach (['chatId', 'author', 'participant'] as $key) {
            $alt = (string) ($data[$key] ?? '');
            if (str_ends_with($alt, '@c.us')) {
                return $this->digits($alt);
            }
        }

        if (! str_ends_with($chatId, '@lid') || ! $line->openwa_session_id) {
            return null;
        }

        try {
            $contact = $this->client->getContact($line->openwa_session_id, $chatId);
        } catch (Throwable) {
            return null;
        }

        foreach (['id', 'jid', 'number', 'phone'] as $key) {
            $value = (string) ($contact[$key] ?? '');
            if (str_ends_with($value, '@c.us') || preg_match('/^\+?\d{9,15}$/', $value) === 1) {
                return $this->digits($value);
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function resolveName(array $data): ?string
    {
        $sender = is_array($data['sender'] ?? null) ? $data['sender'] : [];
        $contact = is_array($data['contact'] ?? null) ? $data['contact'] : [];

        foreach ([$sender['pushname'] ?? null, $sender['pushName'] ?? null, $sender['name'] ?? null, $contact['pushName'] ?? null, $contact['name'] ?? null, $data['pushName'] ?? null, $data['notifyName'] ?? null] as $name) {
            if (is_string($name) && trim($name) !== '') {
                return mb_substr(trim($name), 0, 120);
            }
        }

        return null;
    }

    private function digits(string $id): ?string
    {
        $digits = preg_replace('/\D/', '', explode('@', $id)[0]) ?? '';

        return $digits !== '' ? mb_substr($digits, 0, 30) : null;
    }

    private function isInboundChat(string $event): bool
    {
        $event = strtolower(trim($event));

        if ($event === '' || in_array($event, self::NOISE_EVENTS, true)) {
            return false;
        }

        return in_array($event, ['message.received', 'message', 'onmessage', 'chat', 'message.any'], true)
            || (str_contains($event, 'message') && str_contains($event, 'receiv'));
    }

    private function safeSend(OpenWaLine $line, string $chatId, string $text): void
    {
        try {
            $this->lines->sendText($line, $chatId, $text);
        } catch (Throwable $e) {
            Log::warning('saleshub.send_failed', ['line' => $line->id, 'error' => $e->getMessage()]);
        }
    }
}
