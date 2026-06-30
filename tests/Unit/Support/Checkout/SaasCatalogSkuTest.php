<?php

use App\Models\CatalogSku;
use App\Support\Checkout\SaasCatalogSku;

test('detects vetsaas sku by metadata', function (): void {
    $sku = new CatalogSku([
        'metadata' => ['saas_product' => 'vetsaas', 'vetsaas_plan_slug' => 'free'],
        'sale_model' => 'saas_subscription',
        'code' => 'vetsaas-free-mensual',
        'list_price' => 0,
    ]);

    expect(SaasCatalogSku::isVetsaas($sku))->toBeTrue()
        ->and(SaasCatalogSku::isSaasSubscription($sku))->toBeTrue()
        ->and(SaasCatalogSku::normalizePlanSlug($sku, 'vetsaas-free-mensual'))->toBe('free');
});

test('detects aulavirtual sku by metadata', function (): void {
    $sku = new CatalogSku([
        'metadata' => ['saas_product' => 'aulavirtual', 'saas_plan_slug' => 'starter'],
        'sale_model' => 'saas_subscription',
        'code' => 'aula-starter',
    ]);

    expect(SaasCatalogSku::isAulaVirtual($sku))->toBeTrue()
        ->and(SaasCatalogSku::isVetsaas($sku))->toBeFalse();
});

test('detects vetsaas sku by code without metadata', function (): void {
    $sku = new CatalogSku([
        'code' => 'Vetsaas-free-mensual',
        'name' => 'Vetsaas — Plan Free',
        'sale_model' => 'one_time',
    ]);

    expect(SaasCatalogSku::isVetsaas($sku))->toBeTrue();
});

test('zero total checkout requires all saas skus', function (): void {
    $vetsaas = new CatalogSku([
        'metadata' => ['saas_product' => 'vetsaas'],
        'sale_model' => 'saas_subscription',
    ]);
    $other = new CatalogSku([
        'metadata' => [],
        'sale_model' => 'one_time',
    ]);

    expect(SaasCatalogSku::collectionQualifiesForZeroTotalCheckout(collect([$vetsaas])))->toBeTrue()
        ->and(SaasCatalogSku::collectionQualifiesForZeroTotalCheckout(collect([$vetsaas, $other])))->toBeFalse();
});

test('detects free and paid vetsaas plans', function (): void {
    $free = new CatalogSku([
        'metadata' => ['saas_product' => 'vetsaas', 'vetsaas_plan_slug' => 'free'],
        'sale_model' => 'saas_subscription',
        'code' => 'vetsaas-free-mensual',
    ]);
    $starter = new CatalogSku([
        'metadata' => ['saas_product' => 'vetsaas', 'vetsaas_plan_slug' => 'starter'],
        'sale_model' => 'saas_subscription',
        'code' => 'vetsaas-starter-mensual',
    ]);
    $pro = new CatalogSku([
        'metadata' => ['saas_product' => 'vetsaas', 'vetsaas_plan_slug' => 'pro'],
        'sale_model' => 'saas_subscription',
        'code' => 'vetsaas-pro-mensual',
    ]);
    $clinica = new CatalogSku([
        'metadata' => ['saas_product' => 'vetsaas', 'vetsaas_plan_slug' => 'clinica'],
        'sale_model' => 'saas_subscription',
        'code' => 'vetsaas-clinica-mensual',
    ]);

    expect(SaasCatalogSku::isFreePlan($free))->toBeTrue()
        ->and(SaasCatalogSku::isPaidVetsaasPlan($free))->toBeFalse()
        ->and(SaasCatalogSku::isPaidVetsaasPlan($starter))->toBeTrue()
        ->and(SaasCatalogSku::isPaidVetsaasPlan($pro))->toBeTrue()
        ->and(SaasCatalogSku::isPaidVetsaasPlan($clinica))->toBeTrue();
});
