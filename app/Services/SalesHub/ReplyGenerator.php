<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use App\Models\SalesHubConversation;
use App\Models\SalesHubMessage;
use App\Services\OpenWaLines\OpenWaLineManager;
use App\Services\WhatsApp\OrvaeWhatsAppSender;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

final class ReplyGenerator
{
    public function __construct(
        private readonly ProductResolver $products,
        private readonly PromptBuilder $prompts,
        private readonly OpenAiClient $openAi,
        private readonly OpenWaLineManager $lines,
        private readonly OrvaeWhatsAppSender $alerts,
    ) {}

    public static function botEnabledFor(SalesHubConversation $conversation): bool
    {
        return (bool) config('saleshub.enabled')
            && $conversation->line?->bot_activo === true
            && $conversation->bot_activo;
    }

    public function reply(SalesHubConversation $conversation, bool $preferVoice = false): void
    {
        $conversation->refresh();

        if (! self::botEnabledFor($conversation)) {
            return;
        }

        $history = $conversation->messages()->latest('id')->limit(max(4, (int) config('saleshub.history_messages', 20)))->get()->reverse()->values();
        if ($history->isEmpty() || $history->last()->direccion !== SalesHubMessage::IN) {
            return;
        }

        $catalog = $this->products->knowledgeFor($conversation->line);
        if ($catalog === []) {
            Log::warning('saleshub.no_knowledge', ['line' => $conversation->openwa_line_id]);

            return;
        }

        $producto = isset($catalog[$conversation->producto]) ? $conversation->producto : null;
        if ($producto === null && count($catalog) === 1) {
            $producto = (string) array_key_first($catalog);
        }

        $messages = [['role' => 'system', 'content' => $this->prompts->build($catalog, $producto)]];
        foreach ($history as $message) {
            $messages[] = [
                'role' => $message->direccion === SalesHubMessage::IN ? 'user' : 'assistant',
                'content' => $message->body,
            ];
        }

        try {
            $raw = $this->openAi->chat($messages);
        } catch (Throwable $e) {
            Log::warning('saleshub.openai_failed', ['conversation' => $conversation->id, 'error' => $e->getMessage()]);

            return;
        }

        if (preg_match('/<<<PRODUCTO\s+([a-z0-9_-]+)\s*>>>/i', $raw, $match) === 1 && isset($catalog[strtolower($match[1])])) {
            $producto = strtolower($match[1]);
        }
        $handoff = str_contains($raw, PromptBuilder::MARK_ASESOR);

        $bubbles = $this->bubbles($raw);
        if ($bubbles === []) {
            return;
        }

        $conversation->forceFill(['producto' => $producto])->save();

        try {
            $this->send($conversation, $bubbles, $preferVoice, $producto);
        } catch (Throwable $e) {
            Log::warning('saleshub.send_failed', ['conversation' => $conversation->id, 'error' => $e->getMessage()]);

            return;
        }

        if ($handoff) {
            $conversation->pause(SalesHubConversation::PAUSA_AUTO, 'pidió asesor');
            $this->notifyAdmin($conversation, $catalog[$producto]['nombre'] ?? null);
        }
    }

    /**
     * @return list<string>
     */
    public function bubbles(string $raw): array
    {
        $text = preg_replace('/<<<[^>]*>>>/', '', $raw) ?? $raw;
        $text = preg_replace('/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/', '$2', $text) ?? $text;
        $text = self::toWhatsAppFormat($text);

        $parts = array_values(array_filter(array_map('trim', preg_split('/\s*\|\|\|\s*/u', $text) ?: [])));

        return array_slice($parts, 0, 3);
    }

    /**
     * Markdown → formato nativo de WhatsApp: *negrita*, _cursiva_ y viñetas «•».
     */
    public static function toWhatsAppFormat(string $text): string
    {
        $text = preg_replace_callback(
            '/^[ \t]*#{1,6}[ \t]*(.+?)[ \t]*#*[ \t]*$/m',
            fn (array $m): string => '*'.trim(str_replace('*', '', $m[1])).'*',
            $text,
        ) ?? $text;
        $text = preg_replace('/\*\*(.+?)\*\*/s', '*$1*', $text) ?? $text;
        $text = preg_replace('/__(.+?)__/s', '_$1_', $text) ?? $text;
        $text = preg_replace('/^([ \t]*)[-*+][ \t]+/m', '$1• ', $text) ?? $text;

        return preg_replace('/\n{3,}/', "\n\n", $text) ?? $text;
    }

    /**
     * @param  list<string>  $bubbles
     */
    private function send(SalesHubConversation $conversation, array $bubbles, bool $preferVoice, ?string $producto): void
    {
        $line = $conversation->line;
        $full = implode("\n\n", $bubbles);
        $tipo = 'texto';

        if ($preferVoice && config('saleshub.audio.voice_reply') && ! preg_match('/https?:\/\//', $full) && $this->sendVoice($conversation, $full)) {
            $tipo = 'audio';
            $bubbles = [$full];
        } else {
            foreach ($bubbles as $bubble) {
                $this->lines->sendText($line, $conversation->wa_chat_id, $bubble);
            }
        }

        foreach ($bubbles as $bubble) {
            $conversation->messages()->create([
                'direccion' => SalesHubMessage::OUT,
                'autor' => SalesHubMessage::AUTOR_BOT,
                'tipo' => $tipo,
                'body' => $bubble,
                'producto' => $producto,
            ]);
        }

        $conversation->forceFill([
            'bot_engaged_at' => $conversation->bot_engaged_at ?? now(),
            'last_outbound_at' => now(),
        ])->save();
    }

    private function sendVoice(SalesHubConversation $conversation, string $text): bool
    {
        $path = 'saleshub/voice_'.Str::uuid().'.ogg';

        try {
            $clean = trim(preg_replace('/[\x{1F000}-\x{1FFFF}\x{2600}-\x{27BF}]/u', '', $text) ?? $text);
            Storage::disk('public')->put($path, $this->openAi->speech($clean));
            $url = Storage::disk('public')->url($path);
            $url = str_starts_with($url, 'http') ? $url : rtrim((string) config('app.url'), '/').$url;

            $this->lines->sendVoice($conversation->line, $conversation->wa_chat_id, $url);

            return true;
        } catch (Throwable $e) {
            Log::warning('saleshub.voice_failed', ['conversation' => $conversation->id, 'error' => $e->getMessage()]);

            return false;
        } finally {
            Storage::disk('public')->delete($path);
        }
    }

    private function notifyAdmin(SalesHubConversation $conversation, ?string $productoNombre): void
    {
        $admin = trim((string) config('openwa_lines.admin_notification_number'));
        if ($admin === '') {
            return;
        }

        $contacto = trim(($conversation->nombre ?? '').' '.($conversation->phone ? '+'.$conversation->phone : ''));
        $mensaje = "🔔 Centro de Ventas: {$contacto} pidió hablar con un asesor"
            .($productoNombre ? " ({$productoNombre})" : '')
            .'. El bot quedó en pausa en esa conversación.';

        try {
            $this->alerts->sendText($admin, $mensaje);
        } catch (Throwable $e) {
            Log::warning('saleshub.admin_alert_failed', ['conversation' => $conversation->id, 'error' => $e->getMessage()]);
        }
    }
}
