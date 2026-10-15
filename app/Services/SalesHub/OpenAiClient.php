<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class OpenAiClient
{
    private const BASE_URL = 'https://api.openai.com/v1';

    public function isConfigured(): bool
    {
        return trim((string) config('saleshub.openai.api_key')) !== '';
    }

    /**
     * @param  list<array{role: string, content: string}>  $messages
     */
    public function chat(array $messages): string
    {
        $response = $this->send(fn (PendingRequest $http) => $http->timeout(45)->post(self::BASE_URL.'/chat/completions', [
            'model' => (string) config('saleshub.openai.model'),
            'messages' => $messages,
            'max_tokens' => (int) config('saleshub.openai.max_tokens'),
            'temperature' => (float) config('saleshub.openai.temperature'),
        ]), 'chat');

        $content = trim((string) $response->json('choices.0.message.content'));
        if ($content === '') {
            throw new RuntimeException('OpenAI devolvió una respuesta vacía.');
        }

        return $content;
    }

    public function transcribe(string $audio, string $filename): string
    {
        $response = $this->send(fn (PendingRequest $http) => $http->timeout(60)
            ->attach('file', $audio, $filename)
            ->post(self::BASE_URL.'/audio/transcriptions', [
                'model' => (string) config('saleshub.openai.whisper_model'),
                'language' => 'es',
            ]), 'whisper');

        $text = trim((string) $response->json('text'));
        if ($text === '') {
            throw new RuntimeException('La transcripción vino vacía.');
        }

        return $text;
    }

    /**
     * @return string audio ogg/opus
     */
    public function speech(string $text): string
    {
        $response = $this->send(fn (PendingRequest $http) => $http->timeout(45)->post(self::BASE_URL.'/audio/speech', [
            'model' => (string) config('saleshub.openai.tts_model'),
            'voice' => (string) config('saleshub.openai.tts_voice'),
            'input' => $text,
            'response_format' => 'opus',
        ]), 'tts');

        $audio = $response->body();
        if (strlen($audio) < 100) {
            throw new RuntimeException('OpenAI devolvió un audio vacío.');
        }

        return $audio;
    }

    /**
     * @param  callable(PendingRequest): Response  $call
     */
    private function send(callable $call, string $what): Response
    {
        $key = trim((string) config('saleshub.openai.api_key'));
        if ($key === '') {
            throw new RuntimeException('OPENAI_API_KEY no está configurada en ORVAE.');
        }

        try {
            $response = $call(Http::withToken($key)->acceptJson());
        } catch (ConnectionException $e) {
            throw new RuntimeException("OpenAI ({$what}) no respondió.", 0, $e);
        }

        if (! $response->successful()) {
            throw new RuntimeException("OpenAI ({$what}) respondió HTTP {$response->status()}.");
        }

        return $response;
    }
}
