<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Centro de Ventas (bot IA sobre las líneas OpenWA de ORVAE)
    |--------------------------------------------------------------------------
    |
    | Interruptor general. Además, cada línea tiene su propio "bot_activo"
    | (php artisan saleshub:bot). Con el bot apagado los mensajes igual se
    | guardan para verlos en el panel.
    |
    */
    'enabled' => (bool) env('SALESHUB_BOT_ENABLED', false),

    /*
    | Secreto con el que OpenWA firma el webhook de cada línea (HMAC-SHA256 del body).
    */
    'webhook_secret' => env('SALESHUB_WEBHOOK_SECRET'),

    'queue' => env('SALESHUB_QUEUE', 'default'),

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('SALESHUB_OPENAI_MODEL', 'gpt-4o-mini'),
        'max_tokens' => (int) env('SALESHUB_MAX_TOKENS', 450),
        'temperature' => (float) env('SALESHUB_TEMPERATURE', 0.6),
        'whisper_model' => env('SALESHUB_WHISPER_MODEL', 'whisper-1'),
        'tts_model' => env('SALESHUB_TTS_MODEL', 'tts-1'),
        'tts_voice' => env('SALESHUB_TTS_VOICE', 'nova'),
    ],

    'audio' => [
        'transcribe' => (bool) env('SALESHUB_AUDIO_ENABLED', true),
        // Responder con nota de voz cuando el cliente mandó audio (requiere `php artisan storage:link`).
        'voice_reply' => (bool) env('SALESHUB_VOICE_REPLY', false),
    ],

    // Segundos de silencio del cliente antes de responder (agrupa mensajes seguidos).
    'debounce_seconds' => (int) env('SALESHUB_DEBOUNCE_SECONDS', 5),

    'history_messages' => (int) env('SALESHUB_HISTORY_MESSAGES', 20),

    // Una pausa automática (respondió un humano o se pidió asesor) se levanta sola tras estas horas.
    'auto_pause_hours' => (int) env('SALESHUB_AUTO_PAUSE_HOURS', 12),

    /*
    | Una conversación nueva solo activa al bot si menciona un SaaS (palabras clave
    | que publica cada uno) o alguna de estas intenciones de compra.
    */
    'intent_keywords' => [
        'informacion', 'info', 'precio', 'precios', 'costo', 'cuanto cuesta', 'cuanto vale',
        'cotizacion', 'cotizar', 'planes', 'plan', 'demo', 'prueba gratis', 'sistema', 'software',
        'me interesa', 'quiero saber', 'como funciona', 'contratar', 'suscripcion',
    ],

];
