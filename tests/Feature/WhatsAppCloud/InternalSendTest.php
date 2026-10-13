<?php

use App\Models\WaChannel;
use App\Models\WaMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'whatsapp_cloud.products.vetsaas.internal_api_key' => 'vet-key-0123456789abcdef0123456789',
        'whatsapp_cloud.products.tallersaas.internal_api_key' => 'taller-key-0123456789abcdef012345',
    ]);

    WaChannel::query()->create([
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-demo',
        'provider' => 'cloud',
        'phone_number_id' => '111222333',
        'access_token' => 'EAAG-secret-token',
    ]);
});

function sendBody(array $overrides = []): array
{
    return array_merge([
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-demo',
        'telefono' => '987 654 321',
        'plantilla' => 'recordatorio_cita',
        'variables' => ['Ana', 'Rocky', '14/10 4:00 pm'],
        'reminder_id' => 'rem-1',
        'categoria' => 'recordatorio',
    ], $overrides);
}

test('sin API key responde 401', function () {
    $this->postJson('/internal/whatsapp/send', sendBody())->assertUnauthorized();
});

test('la API key de otro producto responde 403', function () {
    $this->postJson('/internal/whatsapp/send', sendBody(), ['X-Internal-Api-Key' => 'taller-key-0123456789abcdef012345'])
        ->assertForbidden();
});

test('envía la plantilla por Cloud API, registra el mensaje y no expone el token', function () {
    Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.NEW1']]])]);

    $response = $this->postJson('/internal/whatsapp/send', sendBody(), ['X-Internal-Api-Key' => 'vet-key-0123456789abcdef0123456789']);

    $response->assertOk()
        ->assertJson(['ok' => true, 'provider' => 'cloud', 'provider_msg_id' => 'wamid.NEW1', 'estado' => 'accepted']);
    expect($response->getContent())->not->toContain('EAAG-secret-token');

    Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer EAAG-secret-token')
        && str_ends_with($request->url(), '/111222333/messages')
        && $request['to'] === '51987654321'
        && $request['template']['name'] === 'recordatorio_cita'
        && $request['template']['components'][0]['parameters'][1]['text'] === 'Rocky');

    $message = WaMessage::query()->where('provider_msg_id', 'wamid.NEW1')->firstOrFail();
    expect($message->direccion)->toBe('out');
    expect($message->reminder_id)->toBe('rem-1');

    expect(DB::table('wa_channels')->value('access_token'))->not->toBe('EAAG-secret-token');
});

test('si Meta rechaza el envío, guarda el error y responde 502', function () {
    Http::fake(['graph.facebook.com/*' => Http::response(['error' => ['message' => 'Template not found', 'code' => 132001]], 400)]);

    $this->postJson('/internal/whatsapp/send', sendBody(), ['X-Internal-Api-Key' => 'vet-key-0123456789abcdef0123456789'])
        ->assertStatus(502)
        ->assertJson(['ok' => false, 'error_code' => '132001']);

    $message = WaMessage::query()->firstOrFail();
    expect($message->estado)->toBe('failed');
    expect($message->error_msg)->toBe('Template not found');
});

test('tenant sin canal responde 404', function () {
    $this->postJson('/internal/whatsapp/send', sendBody(['tenant_id' => 'no-existe']), ['X-Internal-Api-Key' => 'vet-key-0123456789abcdef0123456789'])
        ->assertNotFound();
});
