<?php

use App\Jobs\SalesHub\GenerateReply;
use App\Models\OpenWaLine;
use App\Models\SalesHubConversation;
use App\Models\SalesHubMessage;
use App\Services\OpenWaLines\OpenWaLineManager;
use App\Services\SalesHub\ReplyDebouncer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();

    config([
        'saleshub.enabled' => true,
        'saleshub.webhook_secret' => 'wh-secret',
        'saleshub.openai.api_key' => 'sk-test',
        'saleshub.debounce_seconds' => 0,
        'openwa_lines.enabled' => true,
        'openwa_lines.api_key' => 'wa-key',
        'openwa_lines.api_url' => 'https://wa.test',
        'openwa_lines.admin_notification_number' => '976709811',
        'services.vetsaas.enabled' => true,
        'services.vetsaas.provision_url' => 'https://vetsaas.test/api/internal/saas/provision',
        'services.vetsaas.hmac_secret' => 'vet-secret',
        'services.vetsaas.knowledge_url' => null,
        'services.tallersaas.enabled' => true,
        'services.tallersaas.provision_url' => 'https://tallersaas.test/api/internal/saas/provision',
        'services.tallersaas.hmac_secret' => 'taller-secret',
        'services.tallersaas.knowledge_url' => null,
        'services.aulavirtual.enabled' => false,
        'services.sendsaas.enabled' => false,
    ]);

    $this->line = OpenWaLine::query()->create([
        'nombre' => 'VENTAS ORVAE',
        'session_name' => 'ventas',
        'openwa_session_id' => 'sess-1',
        'status' => OpenWaLine::STATUS_READY,
        'productos' => ['vetsaas', 'tallersaas'],
        'bot_activo' => true,
    ]);
});

function fakeSaasAndWhatsApp(string $aiReply = 'Hola 👋 ¿Cómo manejas hoy tu taller?'): void
{
    Http::fake([
        'vetsaas.test/*' => Http::response([
            'nombre' => 'VetSaaS',
            'resumen' => 'Sistema para clínicas veterinarias.',
            'palabras_clave' => ['veterinaria', 'mascotas'],
            'planes' => [['codigo' => 'pro', 'nombre' => 'Pro', 'precio_mensual' => 249, 'incluye' => ['5 usuarios']]],
            'secciones' => [['tipo' => 'faq', 'titulo' => '¿SUNAT?', 'contenido' => 'Sí.']],
            'demo' => ['url' => 'https://demo.vetsaas.test', 'usuario' => 'demo@vetsaas.pe', 'password' => 'demo1234'],
        ]),
        'tallersaas.test/*' => Http::response([
            'nombre' => 'TallerSaaS',
            'resumen' => 'Sistema para talleres mecánicos.',
            'palabras_clave' => ['taller mecánico', 'car wash'],
            'planes' => [['codigo' => 'basico', 'nombre' => 'Básico', 'precio_mensual' => 49.9, 'incluye' => ['1 sede']]],
            'secciones' => [['tipo' => 'modulo', 'titulo' => 'Car wash', 'contenido' => 'Ticket de lavado.']],
            'demo' => ['url' => 'https://demo.tallersaas.test', 'usuario' => 'demo@tallersaas.pe', 'password' => 'demo1234'],
        ]),
        'api.openai.com/*' => Http::response(['choices' => [['message' => ['content' => $aiReply]]]]),
        'wa.test/*' => Http::response(['id' => 'sent-1']),
    ]);
}

/**
 * @param  array<string, mixed>  $data
 */
function openWaWebhook(OpenWaLine $line, array $data, string $secret = 'wh-secret', string $event = 'message.received'): TestResponse
{
    $body = (string) json_encode(['event' => $event, 'sessionId' => 'sess-1', 'data' => $data]);

    return test()->call('POST', "/api/webhooks/openwa-lines/{$line->id}", [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_WEBHOOK_SIGNATURE' => 'sha256='.hash_hmac('sha256', $body, $secret),
    ], $body);
}

function incoming(string $body, string $id = 'msg-1', string $from = '51987654321@c.us'): array
{
    return ['id' => $id, 'from' => $from, 'fromMe' => false, 'type' => 'chat', 'body' => $body, 'sender' => ['pushname' => 'Juan Taller']];
}

function sentTexts(): array
{
    return collect(Http::recorded())
        ->map(fn (array $pair) => $pair[0])
        ->filter(fn (Request $r) => str_contains($r->url(), '/messages/send-text'))
        ->map(fn (Request $r) => $r->data())
        ->values()
        ->all();
}

test('rechaza webhooks sin la firma de OpenWA y exige el secreto configurado', function () {
    openWaWebhook($this->line, incoming('hola'), 'otro')->assertUnauthorized();

    config(['saleshub.webhook_secret' => null]);
    openWaWebhook($this->line, incoming('hola'))->assertStatus(503);

    expect(SalesHubConversation::count())->toBe(0);
});

test('un cliente que pregunta por su taller recibe respuesta de TallerSaaS en burbujas limpias', function () {
    fakeSaasAndWhatsApp('Buena, Juan 👋 Mira el **módulo** de órdenes: [demo](https://demo.tallersaas.test) ||| ¿Cuántos autos atiendes al día?');

    openWaWebhook($this->line, incoming('Hola, tengo un taller mecánico y quiero info'))
        ->assertOk()
        ->assertJsonPath('result', 'queued');

    $conversation = SalesHubConversation::sole();
    expect($conversation->producto)->toBe('tallersaas')
        ->and($conversation->nombre)->toBe('Juan Taller')
        ->and($conversation->phone)->toBe('51987654321')
        ->and($conversation->bot_engaged_at)->not->toBeNull();

    expect(sentTexts())->toBe([
        ['chatId' => '51987654321@c.us', 'text' => 'Buena, Juan 👋 Mira el *módulo* de órdenes: https://demo.tallersaas.test'],
        ['chatId' => '51987654321@c.us', 'text' => '¿Cuántos autos atiendes al día?'],
    ]);

    expect($conversation->messages()->where('autor', SalesHubMessage::AUTOR_BOT)->count())->toBe(2);

    Http::assertSent(function (Request $request) {
        if (! str_contains($request->url(), 'openai.com')) {
            return false;
        }
        $system = $request->data()['messages'][0]['content'];

        return str_contains($system, 'TallerSaaS') && str_contains($system, 'S/49.90/mes') && str_contains($system, 'demo@tallersaas.pe');
    });
});

test('sin bot activo en la línea solo guarda la conversación', function () {
    Queue::fake();
    $this->line->update(['bot_activo' => false]);

    openWaWebhook($this->line, incoming('Quiero el precio del sistema para mi veterinaria'))
        ->assertJsonPath('result', 'stored:bot_off');

    expect(SalesHubMessage::count())->toBe(1);
    Queue::assertNothingPushed();
});

test('un chat nuevo sin interés comercial no activa al bot', function () {
    Queue::fake();

    openWaWebhook($this->line, incoming('Hola amigo, ¿vamos al partido?'))
        ->assertJsonPath('result', 'stored:no_trigger');

    Queue::assertNothingPushed();
});

test('ignora grupos, mensajes repetidos y eventos que no son mensajes', function () {
    Queue::fake();

    openWaWebhook($this->line, incoming('info del sistema', 'g1', '120363000@g.us'))->assertJsonPath('result', 'ignored:chat');
    openWaWebhook($this->line, incoming('info del sistema', 'dup'))->assertJsonPath('result', 'queued');
    openWaWebhook($this->line, incoming('info del sistema', 'dup'))->assertJsonPath('result', 'ignored:duplicate');
    openWaWebhook($this->line, incoming('info', 'ack'), event: 'message.ack')->assertJsonPath('result', 'ignored:event');

    Queue::assertPushed(GenerateReply::class, 1);
});

test('si respondes tú desde el teléfono el bot se pausa; sus propios envíos no lo pausan', function () {
    fakeSaasAndWhatsApp();
    openWaWebhook($this->line, incoming('Info de su sistema para mi taller mecánico'));
    $conversation = SalesHubConversation::sole();

    openWaWebhook($this->line, ['id' => 'echo-1', 'to' => '51987654321@c.us', 'fromMe' => true, 'type' => 'chat', 'body' => 'Hola 👋 ¿Cómo manejas hoy tu taller?'])
        ->assertJsonPath('result', 'ignored:echo');
    expect($conversation->fresh()->bot_activo)->toBeTrue();

    openWaWebhook($this->line, ['id' => 'human-1', 'to' => '51987654321@c.us', 'fromMe' => true, 'type' => 'chat', 'body' => 'Hola Juan, soy Rodrigo'])
        ->assertJsonPath('result', 'paused:human');

    $conversation->refresh();
    expect($conversation->bot_activo)->toBeFalse()
        ->and($conversation->pausa)->toBe(SalesHubConversation::PAUSA_AUTO)
        ->and($conversation->messages()->where('autor', SalesHubMessage::AUTOR_HUMANO)->value('body'))->toBe('Hola Juan, soy Rodrigo');

    openWaWebhook($this->line, incoming('¿y el precio?', 'msg-2'))->assertJsonPath('result', 'stored:paused');

    $this->travel(13)->hours();
    openWaWebhook($this->line, incoming('¿sigues ahí?', 'msg-3'))->assertJsonPath('result', 'queued');
});

test('cuando pide un asesor el bot se pausa y avisa al admin', function () {
    fakeSaasAndWhatsApp('Listo, un asesor te escribe en breve 😊 <<<ASESOR>>>');

    openWaWebhook($this->line, incoming('Quiero hablar con una persona sobre el precio de VetSaaS'));

    $conversation = SalesHubConversation::sole();
    expect($conversation->bot_activo)->toBeFalse()
        ->and($conversation->pausa_motivo)->toBe('pidió asesor');

    $texts = sentTexts();
    expect($texts[0]['text'])->toBe('Listo, un asesor te escribe en breve 😊')
        ->and($texts[1]['chatId'])->toBe('51976709811@c.us')
        ->and($texts[1]['text'])->toContain('Juan Taller', 'VetSaaS');
});

test('si no se sabe el SaaS orienta al cliente y la IA fija el producto', function () {
    fakeSaasAndWhatsApp('Para clínicas tenemos VetSaaS 🐾 <<<PRODUCTO vetsaas>>>');

    openWaWebhook($this->line, incoming('Hola, quiero información de sus sistemas'));

    expect(SalesHubConversation::sole()->producto)->toBe('vetsaas');

    Http::assertSent(function (Request $request) {
        if (! str_contains($request->url(), 'openai.com')) {
            return false;
        }
        $system = $request->data()['messages'][0]['content'];

        return str_contains($system, 'Todavía no sabes') && str_contains($system, 'clave: vetsaas') && str_contains($system, 'clave: tallersaas');
    });
});

test('varios mensajes seguidos generan una sola respuesta', function () {
    fakeSaasAndWhatsApp();
    $conversation = SalesHubConversation::query()->create([
        'openwa_line_id' => $this->line->id,
        'wa_chat_id' => '51987654321@c.us',
        'producto' => 'tallersaas',
    ]);
    $conversation->messages()->create(['direccion' => 'in', 'autor' => 'cliente', 'body' => 'hola']);

    $debouncer = app(ReplyDebouncer::class);
    $first = $debouncer->bump($conversation->id);
    $debouncer->bump($conversation->id);

    dispatch_sync(new GenerateReply($conversation->id, $first));

    Http::assertNotSent(fn (Request $r) => str_contains($r->url(), 'openai.com'));
});

test('transcribe las notas de voz y responde sobre lo que dijo el cliente', function () {
    Queue::fake();
    Http::fake([
        'api.openai.com/v1/audio/transcriptions' => Http::response(['text' => 'Tengo un car wash y quiero saber el precio']),
        'tallersaas.test/*' => Http::response(['nombre' => 'TallerSaaS', 'resumen' => 'Talleres.', 'palabras_clave' => ['car wash']]),
        'vetsaas.test/*' => Http::response(['nombre' => 'VetSaaS', 'resumen' => 'Vets.', 'palabras_clave' => ['veterinaria']]),
    ]);

    openWaWebhook($this->line, [
        'id' => 'ptt-1',
        'from' => '51987654321@c.us',
        'fromMe' => false,
        'type' => 'ptt',
        'body' => '',
        'media' => ['mimetype' => 'audio/ogg; codecs=opus', 'data' => base64_encode(str_repeat('a', 500))],
    ])->assertJsonPath('result', 'queued');

    $message = SalesHubMessage::sole();
    expect($message->tipo)->toBe('audio')
        ->and($message->body)->toBe('Tengo un car wash y quiero saber el precio')
        ->and(SalesHubConversation::sole()->producto)->toBe('tallersaas');

    Queue::assertPushed(GenerateReply::class, fn (GenerateReply $job) => $job->preferVoice);
});

test('registra el webhook de la línea en OpenWA y lo reutiliza si ya existe', function () {
    config(['app.url' => 'https://orvae.test']);
    $url = "https://orvae.test/api/webhooks/openwa-lines/{$this->line->id}";

    Http::fake([
        'wa.test/api/sessions/sess-1/webhooks' => Http::sequence()
            ->push([], 200)
            ->push(['id' => 'wh-1'], 201)
            ->push([['id' => 'wh-1', 'url' => $url]], 200),
        'wa.test/api/sessions/sess-1/webhooks/wh-1' => Http::response(['id' => 'wh-1']),
    ]);

    $this->artisan('saleshub:bot', ['linea' => 'ventas', 'estado' => 'on'])->assertSuccessful();
    $this->artisan('saleshub:webhooks')->assertSuccessful();

    expect($this->line->fresh()->webhook_id)->toBe('wh-1');

    Http::assertSent(fn (Request $r) => $r->method() === 'POST'
        && str_ends_with($r->url(), '/webhooks')
        && $r['url'] === $url
        && $r['secret'] === 'wh-secret'
        && $r['events'] === ['message.received']);
    Http::assertSent(fn (Request $r) => $r->method() === 'PUT' && str_ends_with($r->url(), '/webhooks/wh-1'));
});

test('los avisos que ORVAE manda por la línea no pausan conversaciones', function () {
    fakeSaasAndWhatsApp();
    openWaWebhook($this->line, incoming('Precio del sistema para mi taller mecánico'));

    app(OpenWaLineManager::class)->sendText($this->line, '51987654321@c.us', 'Tu pedido ORV-123 fue pagado');

    openWaWebhook($this->line, ['id' => 'n1', 'to' => '51987654321@c.us', 'fromMe' => true, 'body' => 'Tu pedido ORV-123 fue pagado'])
        ->assertJsonPath('result', 'ignored:echo');
});
