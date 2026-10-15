<?php

use App\Services\SalesHub\SaasKnowledgeClient;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();

    config([
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
});

function knowledgePayload(array $overrides = []): array
{
    return array_merge([
        'version' => 1,
        'nombre' => 'TallerSaaS',
        'resumen' => 'Sistema para talleres mecánicos.',
        'palabras_clave' => ['taller', 'mecánico', 'taller'],
        'planes' => [
            ['codigo' => 'basico', 'nombre' => 'Básico', 'precio_mensual' => '49.90', 'incluye' => ['1 sede', '5 usuarios']],
            ['codigo' => 'roto'],
        ],
        'secciones' => [
            ['tipo' => 'faq', 'titulo' => '¿Emite SUNAT?', 'contenido' => 'Sí, desde Básico.'],
            ['tipo' => 'raro', 'titulo' => 'Otro', 'contenido' => 'Texto'],
            ['tipo' => 'faq', 'titulo' => 'Sin contenido'],
        ],
        'demo' => ['url' => 'https://demo.tallersaas.test', 'usuario' => 'demo@x.pe', 'password' => 'demo1234'],
        'registro_url' => 'https://orvae.pe/software/tallersaas',
        'extra' => ['no' => 'debe pasar'],
    ], $overrides);
}

test('consulta al SaaS con firma HMAC en la URL deducida y normaliza la respuesta', function () {
    Http::fake(['tallersaas.test/*' => Http::response(knowledgePayload())]);

    $knowledge = app(SaasKnowledgeClient::class)->get('tallersaas');

    Http::assertSent(function (Request $request) {
        $timestamp = $request->header('X-Orvae-Timestamp')[0] ?? '';

        return $request->method() === 'GET'
            && $request->url() === 'https://tallersaas.test/api/internal/saas/salesbot-knowledge'
            && $request->header('X-Orvae-Signature')[0] === hash_hmac('sha256', $timestamp.'.', 'taller-secret');
    });

    expect($knowledge['producto'])->toBe('tallersaas')
        ->and($knowledge['palabras_clave'])->toBe(['taller', 'mecánico'])
        ->and($knowledge['planes'])->toHaveCount(1)
        ->and($knowledge['planes'][0]['precio_mensual'])->toBe(49.9)
        ->and($knowledge['secciones'])->toHaveCount(2)
        ->and($knowledge['secciones'][1]['tipo'])->toBe('general')
        ->and($knowledge['demo']['usuario'])->toBe('demo@x.pe')
        ->and($knowledge)->not->toHaveKey('extra');
});

test('usa la caché y, si el SaaS cae, la última respuesta buena sin reintentar en cada llamada', function () {
    Http::fakeSequence('tallersaas.test/*')
        ->push(knowledgePayload())
        ->push(['error' => 'down'], 500)
        ->push(['error' => 'down'], 500)
        ->push(['error' => 'down'], 500);
    $client = app(SaasKnowledgeClient::class);

    $client->get('tallersaas');
    $client->get('tallersaas');
    Http::assertSentCount(1);

    $client->forget('tallersaas');
    $fallback = $client->get('tallersaas');
    $client->get('tallersaas');

    expect($fallback['nombre'])->toBe('TallerSaaS');
    Http::assertSentCount(2);
});

test('es dinámico: un SaaS nuevo en services aparece; uno apagado no se consulta', function () {
    config([
        'services.foodsaas' => [
            'label' => 'FoodSaaS',
            'enabled' => true,
            'provision_url' => 'https://foodsaas.test/api/internal/saas/provision',
            'hmac_secret' => 'food-secret',
            'knowledge_url' => 'https://foodsaas.test/custom/knowledge',
        ],
    ]);
    Http::fake([
        'foodsaas.test/custom/knowledge' => Http::response(knowledgePayload(['nombre' => 'FoodSaaS'])),
        '*' => Http::response(knowledgePayload()),
    ]);

    $all = app(SaasKnowledgeClient::class)->all();

    expect(array_keys($all))->toBe(['vetsaas', 'tallersaas', 'foodsaas'])
        ->and($all['foodsaas']['nombre'])->toBe('FoodSaaS')
        ->and(app(SaasKnowledgeClient::class)->get('aulavirtual'))->toBeNull();
    Http::assertNotSent(fn (Request $r) => str_contains($r->url(), 'aulavirtual'));
});

function signedKnowledgeRefresh(string $producto, string $secret, ?string $signature = null): Illuminate\Testing\TestResponse
{
    $body = (string) json_encode(['evento' => 'knowledge.updated']);
    $timestamp = (string) time();

    return test()->call('POST', "/api/internal/saas/{$producto}/knowledge/refresh", [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_ORVAE_TIMESTAMP' => $timestamp,
        'HTTP_X_ORVAE_SIGNATURE' => $signature ?? 'sha256='.hash_hmac('sha256', $timestamp.'.'.$body, $secret),
    ], $body);
}

test('el SaaS avisa cambios con su propia firma y ORVAE vuelve a consultar', function () {
    Http::fakeSequence('vetsaas.test/*')
        ->push(knowledgePayload(['nombre' => 'VetSaaS v1']))
        ->push(knowledgePayload(['nombre' => 'VetSaaS v2']));
    $client = app(SaasKnowledgeClient::class);
    $client->get('vetsaas');

    signedKnowledgeRefresh('vetsaas', 'taller-secret')->assertUnauthorized();
    signedKnowledgeRefresh('vetsaas', 'vet-secret')->assertOk();

    expect($client->get('vetsaas')['nombre'])->toBe('VetSaaS v2');
});

test('rechaza productos que no existen en services', function () {
    signedKnowledgeRefresh('mail', 'x')->assertUnauthorized();
    signedKnowledgeRefresh('no-existe', 'x')->assertUnauthorized();
});
