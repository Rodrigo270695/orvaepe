<?php

use App\Models\WaChannel;
use App\Models\WaTemplate;
use App\Services\WhatsAppCloud\TemplateProvisioner;
use App\Services\WhatsAppCloud\WhatsAppCloudException;
use Database\Seeders\WhatsAppCloudSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('el seeder crea la plantilla global aprobada y el canal con el token cifrado', function () {
    config([
        'whatsapp_cloud.default_channel.tenant_id' => 'orvae-demo',
        'whatsapp_cloud.default_channel.phone_number_id' => '1091510804035130',
        'whatsapp_cloud.default_channel.waba_id' => '1891985734771702',
        'whatsapp_cloud.default_channel.access_token' => 'EAAG-seed-token',
    ]);

    $this->seed(WhatsAppCloudSeeder::class);
    $this->seed(WhatsAppCloudSeeder::class);

    $template = WaTemplate::query()->sole();
    expect($template)
        ->nombre->toBe('recordatorio_vacuna')
        ->tenant_id->toBeNull()
        ->estado->toBe('aprobada')
        ->num_variables->toBe(6);

    $channel = WaChannel::query()->sole();
    expect($channel)
        ->tenant_id->toBe('orvae-demo')
        ->provider->toBe('cloud')
        ->phone_number_id->toBe('1091510804035130')
        ->access_token->toBe('EAAG-seed-token');
    expect(DB::table('wa_channels')->value('access_token'))->not->toContain('EAAG-seed-token');
});

test('sin token o sin tenant el seeder no crea el canal', function () {
    config([
        'whatsapp_cloud.default_channel.tenant_id' => 'orvae-demo',
        'whatsapp_cloud.default_channel.access_token' => null,
    ]);

    $this->seed(WhatsAppCloudSeeder::class);

    expect(WaChannel::query()->count())->toBe(0)
        ->and(WaTemplate::query()->count())->toBe(1);
});

function provisionChannel(): WaChannel
{
    return WaChannel::query()->create([
        'producto' => 'vetsaas',
        'tenant_id' => 'clinica-x',
        'provider' => 'cloud',
        'phone_number_id' => '555',
        'waba_id' => 'WABA_X',
        'access_token' => 'EAAG-clinica-token',
    ]);
}

test('Embedded Signup apagado: no llama a Meta', function () {
    Http::fake();
    config(['whatsapp_cloud.embedded_signup.enabled' => false]);

    expect(fn () => app(TemplateProvisioner::class)->provision(provisionChannel(), 'recordatorio_vacuna'))
        ->toThrow(WhatsAppCloudException::class);

    Http::assertNothingSent();
});

test('Embedded Signup: crea la plantilla en la WABA de la clínica y la guarda pendiente', function () {
    config(['whatsapp_cloud.embedded_signup.enabled' => true]);
    Http::fake(['graph.facebook.com/*' => Http::response(['id' => '9001', 'status' => 'PENDING', 'category' => 'UTILITY'])]);

    $template = app(TemplateProvisioner::class)->provision(provisionChannel(), 'recordatorio_vacuna');

    Http::assertSent(fn ($request) => $request->url() === 'https://graph.facebook.com/v25.0/WABA_X/message_templates'
        && $request->hasHeader('Authorization', 'Bearer EAAG-clinica-token')
        && $request['name'] === 'recordatorio_vacuna'
        && $request['language'] === 'es_PE'
        && $request['category'] === 'UTILITY'
        && $request['components'][0]['type'] === 'BODY'
        && count($request['components'][0]['example']['body_text'][0]) === 6);

    expect($template)
        ->tenant_id->toBe('clinica-x')
        ->producto->toBe('vetsaas')
        ->waba_id->toBe('WABA_X')
        ->meta_template_id->toBe('9001')
        ->estado->toBe('pendiente');
});
