<?php

use App\Jobs\WhatsAppCloud\ForwardEventToProduct;
use App\Models\WaChannel;
use App\Models\WaTemplate;
use App\Services\WhatsAppCloud\WebhookProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

const ES_KEY = 'vet-key-0123456789abcdef0123456789';

beforeEach(function () {
    config([
        'whatsapp_cloud.products.vetsaas.internal_api_key' => ES_KEY,
        'whatsapp_cloud.app_secret' => 'app-secret-test',
        'whatsapp_cloud.embedded_signup.enabled' => true,
        'whatsapp_cloud.embedded_signup.app_id' => '178522',
        'whatsapp_cloud.embedded_signup.config_id' => 'cfg-1',
    ]);
});

/**
 * @param  array<string, mixed>  $existingTemplates
 */
function fakeMeta(array $existingTemplates = []): void
{
    Http::fake(function (Request $request) use ($existingTemplates) {
        $path = parse_url($request->url(), PHP_URL_PATH);

        return match (true) {
            str_ends_with($path, '/oauth/access_token') => Http::response(['access_token' => 'EAAG-clinica-token', 'token_type' => 'bearer']),
            str_ends_with($path, '/987654321/subscribed_apps') => Http::response(['success' => true]),
            str_ends_with($path, '/555666/register') => Http::response(['success' => true]),
            str_ends_with($path, '/987654321/message_templates') && $request->method() === 'GET' => Http::response(['data' => $existingTemplates]),
            str_ends_with($path, '/987654321/message_templates') => Http::response(['id' => '9001', 'status' => 'PENDING', 'category' => 'UTILITY']),
            str_ends_with($path, '/555666') => Http::response(['display_phone_number' => '+51 999 888 777', 'verified_name' => 'Clínica X', 'id' => '555666']),
            default => Http::response(['error' => ['message' => 'unexpected', 'code' => 1]], 400),
        };
    });
}

function signupBody(array $overrides = []): array
{
    return array_merge([
        'tenant_id' => 'clinica-x',
        'code' => 'AQB-code-de-meta',
        'waba_id' => '987654321',
        'phone_number_id' => '555666',
    ], $overrides);
}

test('GET channel devuelve la config pública sin canal ni secretos', function () {
    $this->getJson('/internal/whatsapp/channel?tenant_id=clinica-x', ['X-Internal-Key' => ES_KEY])
        ->assertOk()
        ->assertJson([
            'channel' => null,
            'embedded_signup' => ['enabled' => true, 'app_id' => '178522', 'config_id' => 'cfg-1'],
        ])
        ->assertDontSee('app-secret-test');
});

test('apagado: responde 409 y no llama a Meta', function () {
    config(['whatsapp_cloud.embedded_signup.enabled' => false]);
    Http::fake();

    $this->postJson('/internal/whatsapp/channel/embedded-signup', signupBody(['waba_id' => '123456', 'phone_number_id' => '555666']), ['X-Internal-Key' => ES_KEY])
        ->assertStatus(409)
        ->assertJson(['error_code' => 'embedded_signup_disabled']);

    Http::assertNothingSent();
    $this->getJson('/internal/whatsapp/channel?tenant_id=clinica-x', ['X-Internal-Key' => ES_KEY])
        ->assertJson(['embedded_signup' => ['enabled' => false, 'app_id' => null]]);
});

test('conecta el número: canal pendiente, token y PIN cifrados, plantilla creada en su WABA', function () {
    fakeMeta();

    $response = $this->postJson('/internal/whatsapp/channel/embedded-signup', signupBody(['waba_id' => '987654321']), ['X-Internal-Key' => ES_KEY]);

    $response->assertCreated()
        ->assertJson([
            'ok' => true,
            'channel' => [
                'provider' => 'cloud',
                'estado' => 'pendiente',
                'display_phone_number' => '+51 999 888 777',
                'plantillas' => [['nombre' => 'recordatorio_vacuna', 'estado' => 'pendiente']],
            ],
            'errores_plantillas' => [],
        ])
        ->assertDontSee('EAAG-clinica-token');

    $channel = WaChannel::query()->sole();
    expect($channel)
        ->tenant_id->toBe('clinica-x')
        ->access_token->toBe('EAAG-clinica-token')
        ->registration_pin->toMatch('/^\d{6}$/');
    expect(DB::table('wa_channels')->value('access_token'))->not->toContain('EAAG');
    expect(DB::table('wa_channels')->value('registration_pin'))->not->toBe($channel->registration_pin);

    Http::assertSent(fn (Request $r) => str_contains($r->url(), '/oauth/access_token')
        && $r['client_secret'] === 'app-secret-test' && $r['code'] === 'AQB-code-de-meta');
    Http::assertSent(fn (Request $r) => str_ends_with($r->url(), '/555666/register')
        && $r->hasHeader('Authorization', 'Bearer EAAG-clinica-token') && $r['pin'] === $channel->registration_pin);
    Http::assertSent(fn (Request $r) => $r->method() === 'POST' && str_ends_with($r->url(), '/987654321/message_templates')
        && $r['name'] === 'recordatorio_vacuna');
});

test('la aprobación de la plantilla activa el canal y avisa al producto', function () {
    fakeMeta();
    $this->postJson('/internal/whatsapp/channel/embedded-signup', signupBody(['waba_id' => '987654321']), ['X-Internal-Key' => ES_KEY])->assertCreated();
    Queue::fake();

    app(WebhookProcessor::class)->process([
        'object' => 'whatsapp_business_account',
        'entry' => [[
            'id' => '987654321',
            'changes' => [[
                'field' => 'message_template_status_update',
                'value' => [
                    'event' => 'APPROVED',
                    'message_template_id' => 9001,
                    'message_template_name' => 'recordatorio_vacuna',
                    'message_template_language' => 'es_PE',
                    'reason' => 'NONE',
                ],
            ]],
        ]],
    ]);

    expect(WaChannel::query()->sole()->estado)->toBe('activo');
    Queue::assertPushed(ForwardEventToProduct::class, fn ($job) => $job->event['evento'] === 'channel.activated'
        && $job->event['tenant_id'] === 'clinica-x');
});

test('si la plantilla ya está aprobada en su WABA el canal queda activo sin crearla otra vez', function () {
    fakeMeta([['id' => '7777', 'name' => 'recordatorio_vacuna', 'language' => 'es_PE', 'status' => 'APPROVED']]);

    $this->postJson('/internal/whatsapp/channel/embedded-signup', signupBody(['waba_id' => '987654321']), ['X-Internal-Key' => ES_KEY])
        ->assertCreated()
        ->assertJson(['channel' => ['estado' => 'activo']]);

    expect(WaTemplate::query()->sole())->meta_template_id->toBe('7777')->estado->toBe('aprobada');
    Http::assertNotSent(fn (Request $r) => $r->method() === 'POST' && str_ends_with($r->url(), '/message_templates'));
});

test('coexistencia: no registra el número', function () {
    fakeMeta();

    $this->postJson('/internal/whatsapp/channel/embedded-signup', signupBody(['waba_id' => '987654321', 'coexistencia' => true]), ['X-Internal-Key' => ES_KEY])
        ->assertCreated();

    Http::assertNotSent(fn (Request $r) => str_ends_with($r->url(), '/register'));
    expect(WaChannel::query()->sole()->registration_pin)->toBeNull();
});

test('un número ya conectado a otro tenant responde 409', function () {
    Http::fake();
    WaChannel::query()->create([
        'producto' => 'vetsaas',
        'tenant_id' => 'otra-clinica',
        'provider' => 'cloud',
        'phone_number_id' => '555666',
    ]);

    $this->postJson('/internal/whatsapp/channel/embedded-signup', signupBody(['waba_id' => '123456']), ['X-Internal-Key' => ES_KEY])
        ->assertStatus(409)
        ->assertJson(['error_code' => 'phone_in_use']);

    Http::assertNothingSent();
});
