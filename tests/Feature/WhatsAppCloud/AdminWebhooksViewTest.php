<?php

use App\Models\User;
use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Models\WebhookEvent;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->actingAs(User::factory()->superadmin()->create());

    $channel = WaChannel::query()->create([
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-demo',
        'provider' => 'cloud',
        'phone_number_id' => '111222333',
        'access_token' => 'EAAG-secret-token',
    ]);

    WaMessage::query()->create([
        'wa_channel_id' => $channel->id,
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-demo',
        'reminder_id' => 'rem-1',
        'provider_msg_id' => 'wamid.ABC',
        'telefono' => '51976709811',
        'direccion' => 'out',
        'categoria' => 'utility',
        'plantilla' => 'recordatorio_vacuna',
        'estado' => 'failed',
    ]);

    WebhookEvent::query()->create([
        'gateway' => 'whatsapp_cloud',
        'gateway_event_id' => 'wamid.ABC:failed',
        'event_type' => 'status.failed',
        'payload' => ['id' => 'wamid.ABC', 'status' => 'failed', 'errors' => [['code' => 131026, 'title' => 'Message undeliverable']]],
        'processed' => true,
        'processed_at' => now(),
        'attempts' => 0,
    ]);

    WebhookEvent::query()->create([
        'gateway' => 'culqi',
        'gateway_event_id' => 'evt_culqi_1',
        'event_type' => 'charge.succeeded',
        'payload' => [],
        'processed' => true,
        'attempts' => 0,
    ]);
});

function whatsappCloudUrl(array $query = []): string
{
    return route('panel.operacion-whatsapp-cloud.index', array_merge([
        'date_from' => now()->startOfMonth()->format('Y-m-d'),
        'date_to' => now()->endOfMonth()->format('Y-m-d'),
    ], $query));
}

test('lista solo eventos de WhatsApp Cloud cruzados con su mensaje', function () {
    $this->get(whatsappCloudUrl())
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/operacion-whatsapp-cloud/index')
            ->has('webhookEvents.data', 1)
            ->where('webhookEvents.data.0.wamid', 'wamid.ABC')
            ->where('webhookEvents.data.0.mensaje.telefono', '51976709811')
            ->where('webhookEvents.data.0.mensaje.reminder_id', 'rem-1')
            ->where('webhookEvents.data.0.meta_error.code', '131026')
            ->where('stats.fallidos', 1)
        );
});

test('busca por teléfono y filtra por producto', function () {
    $this->get(whatsappCloudUrl(['q' => '976709811']))
        ->assertInertia(fn (Assert $page) => $page->has('webhookEvents.data', 1));

    $this->get(whatsappCloudUrl(['producto' => 'tallersaas']))
        ->assertInertia(fn (Assert $page) => $page->has('webhookEvents.data', 0));
});

test('sin rango de fechas redirige al mes actual', function () {
    $this->get(route('panel.operacion-whatsapp-cloud.index'))->assertRedirect();
});

test('la vista de pasarelas ya no muestra eventos de WhatsApp Cloud', function () {
    $this->get(route('panel.operacion-webhooks.index', [
        'date_from' => now()->startOfMonth()->format('Y-m-d'),
        'date_to' => now()->endOfMonth()->format('Y-m-d'),
    ]))->assertInertia(fn (Assert $page) => $page
        ->has('webhookEvents.data', 1)
        ->where('webhookEvents.data.0.gateway', 'culqi')
    );
});
