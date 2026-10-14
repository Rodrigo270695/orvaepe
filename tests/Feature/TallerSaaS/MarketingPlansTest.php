<?php

use App\Services\Checkout\TallerSaaSMarketingClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

const TALLER_PLANS_URL = 'https://taller.test/api/public/tallersaas/plans';

beforeEach(function () {
    Cache::flush();
    config([
        'services.tallersaas.marketing_url' => TALLER_PLANS_URL,
        'services.tallersaas.hmac_secret' => 'secreto-compartido',
    ]);
});

function tallerPlansResponse(int $sedesPro = 2): array
{
    return [
        'plans' => [
            [
                'codigo' => 'free', 'nombre' => 'Gratis', 'trial_days' => 15,
                'features' => [
                    'max_sedes' => 1, 'max_usuarios' => 2, 'max_clientes' => 100, 'max_vehiculos' => 100,
                    'max_productos' => 50, 'boletas_electronicas' => false, 'facturas_electronicas' => false,
                    'guias_remision' => false, 'max_comprobantes_mes' => 0,
                ],
            ],
            [
                'codigo' => 'pro', 'nombre' => 'Pro', 'trial_days' => 7,
                'features' => [
                    'max_sedes' => $sedesPro, 'max_usuarios' => 5, 'max_clientes' => 400, 'max_vehiculos' => 450,
                    'max_productos' => 400, 'boletas_electronicas' => true, 'facturas_electronicas' => true,
                    'guias_remision' => true, 'max_comprobantes_mes' => -1,
                ],
            ],
        ],
    ];
}

function signedRefresh(string $secret = 'secreto-compartido'): array
{
    $body = '{"producto":"tallersaas","evento":"plans.updated"}';
    $timestamp = (string) time();

    return [$body, [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_ORVAE_TIMESTAMP' => $timestamp,
        'HTTP_X_ORVAE_SIGNATURE' => 'sha256='.hash_hmac('sha256', $timestamp.'.'.$body, $secret),
        'HTTP_X_IDEMPOTENCY_KEY' => 'test',
    ]];
}

test('arma la tabla comparativa y los highlights con los features de TallerSaaS', function () {
    Http::fake([TALLER_PLANS_URL => Http::response(tallerPlansResponse())]);

    $payload = app(TallerSaaSMarketingClient::class)->payload();

    $rows = collect($payload['comparison'])->keyBy('key');
    expect($rows['max_sedes']['values'])->toBe(['free' => '1', 'pro' => '2'])
        ->and($rows['max_usuarios']['values'])->toBe(['free' => '2', 'pro' => '5'])
        ->and($rows['facturas_electronicas']['values'])->toBe(['free' => 'No', 'pro' => 'Sí'])
        ->and($rows['max_comprobantes_mes']['values'])->toBe(['free' => 'No incluye', 'pro' => 'Ilimitado'])
        ->and($rows['modulo_car_wash']['values'])->toBe(['free' => 'Sí', 'pro' => 'Sí']);

    $pro = collect($payload['plans'])->firstWhere('codigo', 'pro');
    expect($pro['trial_days'])->toBe(7)
        ->and($pro['highlights'])->toContain('Hasta 2 sedes · 5 usuarios')
        ->and($pro['highlights'])->toContain('400 clientes · 450 vehículos')
        ->and($pro['highlights'])->toContain('Boleta, factura y guías SUNAT')
        ->and($pro['highlights'])->toContain('Comprobantes ilimitados');

    $free = collect($payload['plans'])->firstWhere('codigo', 'free');
    expect($free['highlights'])->toContain('Sin comprobantes SUNAT');
});

test('usa la caché y, al recibir el aviso firmado de TallerSaaS, vuelve a consultar', function () {
    Http::fakeSequence(TALLER_PLANS_URL)
        ->push(tallerPlansResponse(2))
        ->push(tallerPlansResponse(4));

    $client = app(TallerSaaSMarketingClient::class);
    $sedes = fn () => collect($client->payload()['comparison'])->firstWhere('key', 'max_sedes')['values']['pro'];

    expect($sedes())->toBe('2');
    expect($sedes())->toBe('2');

    [$body, $headers] = signedRefresh();
    $this->call('POST', '/api/internal/tallersaas/marketing/refresh', [], [], [], $headers, $body)
        ->assertOk();

    expect($sedes())->toBe('4');
});

test('rechaza el aviso con firma inválida y no borra la caché', function () {
    Http::fake([TALLER_PLANS_URL => Http::response(tallerPlansResponse())]);
    app(TallerSaaSMarketingClient::class)->payload();

    [$body, $headers] = signedRefresh('otro-secreto');
    $this->call('POST', '/api/internal/tallersaas/marketing/refresh', [], [], [], $headers, $body)
        ->assertUnauthorized();

    expect(Cache::has('tallersaas.marketing_payload'))->toBeTrue();
});

test('si TallerSaaS no responde usa la última respuesta buena', function () {
    Http::fakeSequence(TALLER_PLANS_URL)
        ->push(tallerPlansResponse(3))
        ->push('error', 500);

    $client = app(TallerSaaSMarketingClient::class);
    $client->payload();
    $client->forgetCache();

    $payload = $client->payload();
    expect(collect($payload['comparison'])->firstWhere('key', 'max_sedes')['values']['pro'])->toBe('3');
});

test('sin datos de TallerSaaS ni copia previa devuelve null (la landing usa los datos fijos)', function () {
    Http::fake([TALLER_PLANS_URL => Http::response('error', 503)]);

    expect(app(TallerSaaSMarketingClient::class)->payload())->toBeNull();
});
