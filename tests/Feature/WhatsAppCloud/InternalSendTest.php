<?php

use App\Jobs\WhatsAppCloud\ForwardEventToProduct;
use App\Jobs\WhatsAppCloud\SendOutboundMessage;
use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Models\WaOptin;
use App\Services\WhatsAppCloud\OutboundDeliverer;
use App\Services\WhatsAppCloud\WhatsAppCloudException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

const VET_KEY = 'vet-key-0123456789abcdef0123456789';

beforeEach(function () {
    config([
        'whatsapp_cloud.products.vetsaas.internal_api_key' => VET_KEY,
        'whatsapp_cloud.products.tallersaas.internal_api_key' => 'taller-key-0123456789abcdef012345',
    ]);

    $this->channel = WaChannel::query()->create([
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-demo',
        'provider' => 'cloud',
        'phone_number_id' => '111222333',
        'access_token' => 'EAAG-secret-token',
    ]);

    WaOptin::query()->create([
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-demo',
        'telefono' => '51976709811',
        'fecha' => now(),
        'origen' => 'recepcion',
    ]);
});

function sendBody(array $overrides = []): array
{
    return array_merge([
        'tenant_id' => 'clinica-demo',
        'telefono' => '+51 976 709 811',
        'plantilla' => 'recordatorio_vacuna',
        'variables' => ['Ana', 'Rocky', 'vacuna antirrábica', '14/10/2026', '4:00 pm', 'Clínica Demo'],
        'reminder_id' => 'rem-1',
    ], $overrides);
}

function queuedMessage(): WaMessage
{
    return WaMessage::query()->create([
        'wa_channel_id' => test()->channel->id,
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-demo',
        'reminder_id' => 'rem-1',
        'telefono' => '51976709811',
        'direccion' => 'out',
        'categoria' => 'utility',
        'plantilla' => 'recordatorio_vacuna',
        'estado' => 'queued',
    ]);
}

test('clave inválida o ausente responde 401', function () {
    $this->postJson('/internal/whatsapp/send', sendBody())->assertUnauthorized();
    $this->postJson('/internal/whatsapp/send', sendBody(), ['X-Internal-Key' => 'otra'])->assertUnauthorized();
});

test('sin opt-in responde 422 y no encola', function () {
    Queue::fake();

    $this->postJson('/internal/whatsapp/send', sendBody(['telefono' => '987654321']), ['X-Internal-Key' => VET_KEY])
        ->assertStatus(422)
        ->assertJson(['error_code' => 'no_optin']);

    Queue::assertNothingPushed();
    expect(WaMessage::query()->count())->toBe(0);
});

test('el producto se deduce de la clave: TallerSaaS no ve el opt-in de VetSaaS', function () {
    $this->postJson('/internal/whatsapp/send', sendBody(), ['X-Internal-Key' => 'taller-key-0123456789abcdef012345'])
        ->assertStatus(422)
        ->assertJson(['error_code' => 'no_optin']);
});

test('valida la cantidad de variables de la plantilla', function () {
    $this->postJson('/internal/whatsapp/send', sendBody(['variables' => ['Ana', 'Rocky']]), ['X-Internal-Key' => VET_KEY])
        ->assertStatus(422);
});

test('encola el envío con el teléfono normalizado', function () {
    Queue::fake();

    $this->postJson('/internal/whatsapp/send', sendBody(), ['X-Internal-Key' => VET_KEY])
        ->assertStatus(202)
        ->assertJson(['ok' => true, 'estado' => 'queued', 'telefono' => '51976709811']);

    Queue::assertPushed(SendOutboundMessage::class, fn (SendOutboundMessage $job) => $job->channelId === $this->channel->id
        && $job->variables[2] === 'vacuna antirrábica');
});

test('envía por Cloud API y guarda estado sent con el wamid', function () {
    Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.NEW1']]])]);
    Queue::fake([ForwardEventToProduct::class]);
    $message = queuedMessage();

    app(OutboundDeliverer::class)->deliver($message->id, sendBody()['variables']);

    Http::assertSent(fn ($request) => $request->url() === 'https://graph.facebook.com/v25.0/111222333/messages'
        && $request->hasHeader('Authorization', 'Bearer EAAG-secret-token')
        && $request['to'] === '51976709811'
        && $request['template']['name'] === 'recordatorio_vacuna'
        && $request['template']['language']['code'] === 'es_PE'
        && count($request['template']['components'][0]['parameters']) === 6
        && $request['template']['components'][0]['parameters'][5]['text'] === 'Clínica Demo');

    $message->refresh();
    expect($message->estado)->toBe('sent');
    expect($message->provider_msg_id)->toBe('wamid.NEW1');
    expect($message->categoria)->toBe('utility');
    expect(DB::table('wa_channels')->value('access_token'))->not->toBe('EAAG-secret-token');

    Queue::assertPushed(ForwardEventToProduct::class, fn ($job) => $job->event['evento'] === 'message.sent');
});

test('error definitivo de Meta: guarda el error, no reintenta y avisa al producto', function () {
    Http::fake(['graph.facebook.com/*' => Http::response(['error' => [
        'message' => '(#132001) Template name does not exist in the translation',
        'code' => 132001,
        'error_data' => ['details' => 'template name (recordatorio_vacuna) does not exist in es_PE'],
    ]], 400)]);
    Queue::fake([ForwardEventToProduct::class]);
    $message = queuedMessage();

    app(OutboundDeliverer::class)->deliver($message->id, sendBody()['variables']);

    $message->refresh();
    expect($message->estado)->toBe('failed');
    expect($message->error_code)->toBe('132001');
    expect($message->error_msg)->toBe('template name (recordatorio_vacuna) does not exist in es_PE');

    Queue::assertPushed(ForwardEventToProduct::class, fn ($job) => $job->event['estado'] === 'failed'
        && $job->event['error']['code'] === '132001');
});

test('error temporal (5xx o rate limit) se relanza para reintentar', function (int $status, array $body) {
    Http::fake(['graph.facebook.com/*' => Http::response($body, $status)]);
    $message = queuedMessage();

    expect(fn () => app(OutboundDeliverer::class)->deliver($message->id, sendBody()['variables']))
        ->toThrow(WhatsAppCloudException::class);

    expect($message->refresh()->estado)->toBe('queued');
})->with([
    'servidor 500' => [500, ['error' => ['message' => 'Service unavailable', 'code' => 2]]],
    'rate limit 130429' => [400, ['error' => ['message' => 'Rate limit hit', 'code' => 130429]]],
]);

test('al agotar los reintentos el mensaje queda failed', function () {
    Queue::fake([ForwardEventToProduct::class]);
    $message = queuedMessage();
    $message->forceFill(['error_code' => '130429', 'error_msg' => 'Rate limit hit'])->save();

    (new SendOutboundMessage($message->id, $this->channel->id, []))->failed(null);

    expect($message->refresh()->estado)->toBe('failed');
    expect($message->error_code)->toBe('130429');
});

test('canal openwa usa el cliente OpenWA existente con el texto armado', function () {
    $this->channel->forceFill(['provider' => 'openwa', 'openwa_session_id' => 'sess-clinica'])->save();
    Queue::fake();

    $this->postJson('/internal/whatsapp/send', sendBody(), ['X-Internal-Key' => VET_KEY])->assertStatus(202);
    $message = WaMessage::query()->firstOrFail();
    expect($message->texto)->toBe('Hola Ana, te recordamos que Rocky tiene vacuna antirrábica el 14/10/2026 a las 4:00 pm en Clínica Demo. Responde CONFIRMO o REPROGRAMAR.');

    config(['openwa.api_url' => 'https://wa.test', 'openwa.api_key' => 'openwa-test-key']);
    Http::fake(['wa.test/api/sessions/sess-clinica/messages/send-text' => Http::response(['messageId' => 'true_51976709811@c.us_ABC'])]);

    app(OutboundDeliverer::class)->deliver($message->id, sendBody()['variables']);

    Http::assertSent(fn ($request) => $request['chatId'] === '51976709811@c.us' && $request['text'] === $message->texto);
    expect($message->refresh()->estado)->toBe('sent');
    expect($message->provider_msg_id)->toBe('true_51976709811@c.us_ABC');
});

test('registra opt-in con teléfono normalizado', function () {
    $this->postJson('/internal/whatsapp/optins', [
        'tenant_id' => 'clinica-demo',
        'telefono' => '987 654 321',
        'origen' => 'formulario_web',
    ], ['X-Internal-Key' => VET_KEY])->assertOk()->assertJson(['telefono' => '51987654321']);

    expect(WaOptin::query()->where('telefono', '51987654321')->where('producto', 'vetsaas')->exists())->toBeTrue();
});
