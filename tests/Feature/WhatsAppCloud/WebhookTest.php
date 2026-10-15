<?php

use App\Jobs\WhatsAppCloud\ForwardEventToProduct;
use App\Jobs\WhatsAppCloud\ProcessWebhookPayload;
use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Models\WaTemplate;
use App\Services\WhatsAppCloud\WebhookProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

const WA_TEST_SECRET = 'test-app-secret';

beforeEach(function () {
    config([
        'whatsapp_cloud.verify_token' => 'test-verify-token',
        'whatsapp_cloud.app_secret' => WA_TEST_SECRET,
    ]);

    $this->channel = WaChannel::query()->create([
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-demo',
        'provider' => 'cloud',
        'phone_number_id' => '111222333',
        'access_token' => 'EAAG-secret-token',
    ]);
});

function waPayload(array $value): array
{
    return [
        'object' => 'whatsapp_business_account',
        'entry' => [[
            'id' => 'WABA_ID',
            'changes' => [[
                'field' => 'messages',
                'value' => array_merge([
                    'messaging_product' => 'whatsapp',
                    'metadata' => ['display_phone_number' => '51900000000', 'phone_number_id' => '111222333'],
                ], $value),
            ]],
        ]],
    ];
}

function waOutbound(array $overrides = []): WaMessage
{
    return WaMessage::query()->create(array_merge([
        'wa_channel_id' => test()->channel->id,
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-demo',
        'reminder_id' => 'rem-1',
        'provider_msg_id' => 'wamid.OUT1',
        'telefono' => '51987654321',
        'direccion' => 'out',
        'categoria' => 'recordatorio',
        'estado' => 'accepted',
    ], $overrides));
}

test('GET devuelve el challenge en texto plano si el token coincide', function () {
    $response = $this->get('/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=1158201444');

    $response->assertOk();
    expect($response->getContent())->toBe('1158201444');
    expect($response->headers->get('Content-Type'))->toStartWith('text/plain');
});

test('GET responde 403 si el token no coincide', function () {
    $this->get('/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=otro&hub.challenge=1')->assertForbidden();
    $this->get('/webhooks/whatsapp?hub.mode=unsubscribe&hub.verify_token=test-verify-token&hub.challenge=1')->assertForbidden();
});

test('POST con firma inválida responde 401 y no encola nada', function () {
    Queue::fake();
    $body = json_encode(waPayload(['statuses' => []]));

    $this->call('POST', '/webhooks/whatsapp', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_HUB_SIGNATURE_256' => 'sha256='.hash_hmac('sha256', $body, 'otro-secreto'),
    ], $body)->assertUnauthorized();

    $this->call('POST', '/webhooks/whatsapp', [], [], [], ['CONTENT_TYPE' => 'application/json'], $body)
        ->assertUnauthorized();

    Queue::assertNothingPushed();
});

test('POST con firma válida responde 200 y encola el procesamiento', function () {
    Queue::fake();
    $body = json_encode(waPayload(['statuses' => []]));

    $this->call('POST', '/webhooks/whatsapp', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_HUB_SIGNATURE_256' => 'sha256='.hash_hmac('sha256', $body, WA_TEST_SECRET),
    ], $body)->assertOk();

    Queue::assertPushed(ProcessWebhookPayload::class);
});

test('actualiza el estado sin retroceder y guarda el error si falla', function () {
    Queue::fake();
    $message = waOutbound();
    $processor = app(WebhookProcessor::class);

    $processor->process(waPayload(['statuses' => [['id' => 'wamid.OUT1', 'status' => 'read', 'timestamp' => '1760000100']]]));
    $processor->process(waPayload(['statuses' => [['id' => 'wamid.OUT1', 'status' => 'delivered', 'timestamp' => '1760000050']]]));

    $message->refresh();
    expect($message->estado)->toBe('read');
    expect($message->read_at)->not->toBeNull();
    expect($message->delivered_at)->not->toBeNull();

    $failed = waOutbound(['provider_msg_id' => 'wamid.OUT2']);
    $processor->process(waPayload(['statuses' => [[
        'id' => 'wamid.OUT2',
        'status' => 'failed',
        'timestamp' => '1760000200',
        'errors' => [['code' => 131026, 'title' => 'Message undeliverable', 'error_data' => ['details' => 'Receptor sin WhatsApp']]],
    ]]]));

    $failed->refresh();
    expect($failed->estado)->toBe('failed');
    expect($failed->error_code)->toBe('131026');
    expect($failed->error_msg)->toBe('Receptor sin WhatsApp');

    Queue::assertPushed(ForwardEventToProduct::class, 3);
});

test('ignora eventos repetidos por id + estado', function () {
    Queue::fake();
    waOutbound();
    $payload = waPayload(['statuses' => [['id' => 'wamid.OUT1', 'status' => 'delivered', 'timestamp' => '1760000050']]]);

    app(WebhookProcessor::class)->process($payload);
    app(WebhookProcessor::class)->process($payload);

    Queue::assertPushed(ForwardEventToProduct::class, 1);
});

test('message_template_status_update actualiza wa_templates.estado (idempotente)', function () {
    Queue::fake();
    $template = WaTemplate::query()->create([
        'waba_id' => 'WABA_ID',
        'nombre' => 'recordatorio_vacuna',
        'idioma' => 'es_PE',
        'tipo' => 'vacuna',
        'estado' => 'pendiente',
        'num_variables' => 6,
    ]);
    $update = fn (string $event, string $reason = 'NONE') => [
        'object' => 'whatsapp_business_account',
        'entry' => [[
            'id' => 'WABA_ID',
            'changes' => [[
                'field' => 'message_template_status_update',
                'value' => [
                    'event' => $event,
                    'message_template_id' => 777,
                    'message_template_name' => 'recordatorio_vacuna',
                    'message_template_language' => 'es_PE',
                    'reason' => $reason,
                ],
            ]],
        ]],
    ];

    app(WebhookProcessor::class)->process($update('APPROVED'));
    expect($template->refresh())
        ->estado->toBe('aprobada')
        ->meta_template_id->toBe('777')
        ->motivo->toBeNull();

    app(WebhookProcessor::class)->process($update('REJECTED', 'INVALID_FORMAT'));
    expect($template->refresh())->estado->toBe('rechazada')->motivo->toBe('INVALID_FORMAT');

    $template->forceFill(['estado' => 'aprobada'])->save();
    app(WebhookProcessor::class)->process($update('REJECTED', 'INVALID_FORMAT'));
    expect($template->refresh()->estado)->toBe('aprobada');

    Queue::assertNothingPushed();
});

test('ignora y registra eventos de un phone_number_id desconocido', function () {
    Queue::fake();
    $payload = waPayload(['statuses' => [['id' => 'wamid.OUT1', 'status' => 'read']]]);
    $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'] = '999';

    app(WebhookProcessor::class)->process($payload);

    Queue::assertNothingPushed();
});

test('mensaje entrante "Confirmo" se guarda y se reenvía con el recordatorio confirmado', function () {
    Queue::fake();
    waOutbound();

    app(WebhookProcessor::class)->process(waPayload(['messages' => [[
        'from' => '51987654321',
        'id' => 'wamid.IN1',
        'timestamp' => '1760000300',
        'type' => 'text',
        'text' => ['body' => ' Confirmo. '],
        'context' => ['from' => '51900000000', 'id' => 'wamid.OUT1'],
    ]]]));

    $inbound = WaMessage::query()->where('provider_msg_id', 'wamid.IN1')->firstOrFail();
    expect($inbound->direccion)->toBe('in');
    expect($inbound->tenant_id)->toBe('clinica-demo');
    expect($inbound->telefono)->toBe('51987654321');
    expect($inbound->reminder_id)->toBe('rem-1');
    expect($inbound->texto)->toBe(' Confirmo. ');

    Queue::assertPushed(ForwardEventToProduct::class, fn (ForwardEventToProduct $job) => $job->producto === 'vetsaas'
        && $job->event['accion'] === 'confirmado'
        && $job->event['reminder_id'] === 'rem-1');
});

test('"REPROGRAMAR" sin context se asocia al último recordatorio enviado a ese teléfono', function () {
    Queue::fake();
    waOutbound();

    app(WebhookProcessor::class)->process(waPayload(['messages' => [[
        'from' => '51987654321',
        'id' => 'wamid.IN2',
        'type' => 'button',
        'button' => ['text' => 'REPROGRAMAR', 'payload' => 'reprogramar'],
    ]]]));

    Queue::assertPushed(ForwardEventToProduct::class, fn (ForwardEventToProduct $job) => $job->event['accion'] === 'reprogramar'
        && $job->event['reminder_id'] === 'rem-1');
});

test('el reenvío al producto va firmado y no incluye el token de Meta', function () {
    config([
        'whatsapp_cloud.products.vetsaas.events_url' => 'https://vetsaas.test/api/internal/whatsapp/events',
        'services.vetsaas.hmac_secret' => 'hmac-test',
    ]);
    Http::fake(['vetsaas.test/*' => Http::response(['ok' => true])]);
    waOutbound();

    app(WebhookProcessor::class)->process(waPayload(['statuses' => [['id' => 'wamid.OUT1', 'status' => 'delivered']]]));

    Http::assertSent(fn ($request) => $request->hasHeader('X-Orvae-Signature')
        && $request['estado'] === 'delivered'
        && ! str_contains($request->body(), 'EAAG-secret-token'));
});
