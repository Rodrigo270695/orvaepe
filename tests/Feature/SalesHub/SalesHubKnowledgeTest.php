<?php

use App\Models\OpenWaLine;
use App\Models\SalesHubConversation;
use App\Models\SalesHubMessage;
use App\Models\SalesHubProduct;
use App\Models\SalesHubSection;
use App\Models\User;
use App\Services\SalesHub\ProductResolver;
use App\Services\SalesHub\PromptBuilder;
use App\Services\SalesHub\SalesKnowledge;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();

    config([
        'services.vetsaas' => ['label' => 'VetSaaS', 'enabled' => true, 'provision_url' => 'https://vetsaas.test/api/internal/saas/provision', 'hmac_secret' => 'vet-secret'],
        'services.tallersaas' => ['label' => 'TallerSaaS', 'enabled' => true, 'provision_url' => 'https://tallersaas.test/api/internal/saas/provision', 'hmac_secret' => 'taller-secret'],
        'services.aulavirtual' => ['label' => 'Aula Virtual', 'enabled' => true, 'provision_url' => 'https://aula.test/api/internal/saas/provision', 'hmac_secret' => 'aula-secret'],
        'services.sendsaas' => ['enabled' => false, 'provision_url' => null],
    ]);

    Http::fake([
        'vetsaas.test/*' => Http::response([
            'nombre' => 'VetSaaS',
            'resumen' => 'Resumen del SaaS.',
            'palabras_clave' => ['veterinaria'],
            'planes' => [['codigo' => 'pro', 'nombre' => 'Pro', 'precio_mensual' => 249, 'incluye' => ['5 usuarios']]],
            'secciones' => [
                ['tipo' => 'faq', 'titulo' => '¿SUNAT?', 'contenido' => 'Sí, desde Pro.'],
                ['tipo' => 'modulo', 'titulo' => 'Agenda', 'contenido' => 'Citas y recordatorios.'],
            ],
            'demo' => ['url' => 'https://demo.vetsaas.test', 'usuario' => 'demo@vet.pe', 'password' => 'demo1234'],
            'registro_url' => 'https://orvae.pe/software/vetsaas',
        ]),
        'tallersaas.test/*' => Http::response(['error' => 'down'], 500),
        'aula.test/*' => Http::response(['error' => 'down'], 500),
    ]);
});

test('sin nada en ORVAE el bot usa lo que publica el SaaS', function () {
    $k = app(SalesKnowledge::class)->get('vetsaas');

    expect($k['resumen'])->toBe('Resumen del SaaS.')
        ->and($k['secciones'])->toHaveCount(2)
        ->and($k['fuente'])->toBe(['planes' => 'saas', 'conocimiento' => 'saas'])
        ->and(app(SalesKnowledge::class)->get('tallersaas'))->toBeNull();
});

test('lo editado en ORVAE manda y los planes siguen viniendo del SaaS', function () {
    SalesHubProduct::query()->create([
        'producto' => 'vetsaas',
        'resumen' => 'Resumen escrito en ORVAE.',
        'palabras_clave' => ['clinica', 'peluqueria canina'],
        'demo_url' => 'https://demo2.vetsaas.test',
        'demo_usuario' => 'ventas@vet.pe',
        'instrucciones' => 'Ofrece 2 meses gratis en el plan anual.',
    ]);
    SalesHubSection::query()->create(['producto' => 'vetsaas', 'tipo' => 'objecion', 'titulo' => 'Es caro', 'contenido' => 'Compáralo con una consulta.']);
    SalesHubSection::query()->create(['producto' => 'vetsaas', 'tipo' => 'faq', 'titulo' => 'Oculto', 'contenido' => 'x', 'activo' => false]);

    $k = app(SalesKnowledge::class)->get('vetsaas');

    expect($k['resumen'])->toBe('Resumen escrito en ORVAE.')
        ->and($k['nombre'])->toBe('VetSaaS')
        ->and($k['planes'][0]['precio_mensual'])->toBe(249.0)
        ->and($k['palabras_clave'])->toBe(['clinica', 'peluqueria canina'])
        ->and($k['demo'])->toBe(['url' => 'https://demo2.vetsaas.test', 'usuario' => 'ventas@vet.pe', 'password' => null])
        ->and($k['registro_url'])->toBe('https://orvae.pe/software/vetsaas')
        ->and(array_column($k['secciones'], 'titulo'))->toBe(['Es caro'])
        ->and($k['fuente']['conocimiento'])->toBe('orvae');

    $prompt = app(PromptBuilder::class)->build(['vetsaas' => $k], 'vetsaas');

    expect($prompt)->toContain('Ofrece 2 meses gratis en el plan anual.')
        ->toContain('Compáralo con una consulta.')
        ->toContain('S/249.00/mes')
        ->not->toContain('Sí, desde Pro.');
});

test('un SaaS sin conocimiento propio se puede vender solo con lo configurado en ORVAE', function () {
    SalesHubProduct::query()->create([
        'producto' => 'aulavirtual',
        'resumen' => 'Aula virtual para colegios.',
        'palabras_clave' => ['colegio', 'academia'],
    ]);
    $line = OpenWaLine::query()->create([
        'nombre' => 'VENTAS',
        'session_name' => 'ventas',
        'productos' => ['vetsaas', 'aulavirtual'],
    ]);

    $resolver = app(ProductResolver::class);

    expect(array_keys($resolver->knowledgeFor($line)))->toBe(['vetsaas', 'aulavirtual'])
        ->and($resolver->detect($line, 'Tengo una academia de inglés'))->toBe('aulavirtual')
        ->and($resolver->knowledgeFor($line)['aulavirtual']['nombre'])->toBe('Aula Virtual');
});

test('copiar del SaaS solo rellena lo vacío y no duplica bloques', function () {
    SalesHubProduct::query()->create(['producto' => 'vetsaas', 'resumen' => 'Mío']);
    SalesHubSection::query()->create(['producto' => 'vetsaas', 'tipo' => 'faq', 'titulo' => '¿sunat?', 'contenido' => 'Mi respuesta']);

    $first = app(SalesKnowledge::class)->importFromSaas('vetsaas');
    $second = app(SalesKnowledge::class)->importFromSaas('vetsaas');

    $product = SalesHubProduct::query()->where('producto', 'vetsaas')->first();

    expect($first['secciones'])->toBe(1)
        ->and($second)->toBe(['campos' => 0, 'secciones' => 0])
        ->and($product->resumen)->toBe('Mío')
        ->and($product->demo_url)->toBe('https://demo.vetsaas.test')
        ->and($product->palabras_clave)->toBe(['veterinaria'])
        ->and(SalesHubSection::query()->where('producto', 'vetsaas')->pluck('contenido')->all())->toBe(['Mi respuesta', 'Citas y recordatorios.'])
        ->and(app(SalesKnowledge::class)->importFromSaas('tallersaas'))->toBeNull();
});

test('el panel guarda conocimiento y bloques del SaaS', function () {
    $this->seed(RoleSeeder::class);
    $this->actingAs(User::factory()->superadmin()->create());

    $this->get('/panel/centro-ventas?producto=vetsaas')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/centro-ventas/index')
            ->where('knowledge.producto', 'vetsaas')
            ->where('knowledge.planes.0.nombre', 'Pro')
            ->has('products', 3));

    $this->put('/panel/centro-ventas/conocimiento/vetsaas', [
        'resumen' => 'Nuevo resumen',
        'palabras_clave' => "clinica, veterinaria\nclinica",
        'demo_url' => 'https://demo.vetsaas.test',
    ])->assertRedirect();

    $this->post('/panel/centro-ventas/conocimiento/vetsaas/bloques', [
        'tipo' => 'novedad',
        'titulo' => 'Recetas por WhatsApp',
        'contenido' => 'Ahora se envían solas.',
    ])->assertRedirect();

    $this->put('/panel/centro-ventas/conocimiento/no-existe', ['resumen' => 'x'])->assertNotFound();

    expect(SalesHubProduct::query()->where('producto', 'vetsaas')->value('palabras_clave'))->toBe(['clinica', 'veterinaria'])
        ->and(SalesHubSection::query()->where('producto', 'vetsaas')->value('titulo'))->toBe('Recetas por WhatsApp');
});

function signedSalesHubGet(string $uri, string $secret): TestResponse
{
    $timestamp = (string) time();

    return test()->call('GET', $uri, [], [], [], [
        'HTTP_ACCEPT' => 'application/json',
        'HTTP_X_ORVAE_TIMESTAMP' => $timestamp,
        'HTTP_X_ORVAE_SIGNATURE' => 'sha256='.hash_hmac('sha256', $timestamp.'.', $secret),
    ]);
}

test('cada SaaS lee por API firmada solo sus conversaciones', function () {
    $line = OpenWaLine::query()->create(['nombre' => 'VENTAS', 'session_name' => 'ventas']);
    $vet = SalesHubConversation::query()->create(['openwa_line_id' => $line->id, 'wa_chat_id' => '1@c.us', 'phone' => '51911111111', 'nombre' => 'Clínica Sol', 'producto' => 'vetsaas', 'last_inbound_at' => now()]);
    $taller = SalesHubConversation::query()->create(['openwa_line_id' => $line->id, 'wa_chat_id' => '2@c.us', 'phone' => '51922222222', 'producto' => 'tallersaas']);
    $vet->messages()->create(['direccion' => SalesHubMessage::IN, 'autor' => SalesHubMessage::AUTOR_CLIENTE, 'body' => 'Hola, precios?']);
    $vet->messages()->create(['direccion' => SalesHubMessage::OUT, 'autor' => SalesHubMessage::AUTOR_BOT, 'body' => 'El plan Pro cuesta S/249.']);

    signedSalesHubGet('/api/internal/saas/vetsaas/saleshub/conversations', 'taller-secret')->assertUnauthorized();

    signedSalesHubGet('/api/internal/saas/vetsaas/saleshub/conversations?search=sol', 'vet-secret')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nombre', 'Clínica Sol')
        ->assertJsonPath('data.0.ultimo_mensaje.autor', 'bot')
        ->assertJsonPath('stats.total', 1);

    signedSalesHubGet("/api/internal/saas/vetsaas/saleshub/conversations/{$vet->id}", 'vet-secret')
        ->assertOk()
        ->assertJsonCount(2, 'messages')
        ->assertJsonPath('messages.0.body', 'Hola, precios?');

    signedSalesHubGet("/api/internal/saas/vetsaas/saleshub/conversations/{$taller->id}", 'vet-secret')->assertNotFound();
});
