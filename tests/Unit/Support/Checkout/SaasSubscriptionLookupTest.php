<?php

use App\Models\CatalogProduct;
use App\Models\CatalogSku;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Models\User;
use App\Support\Checkout\SaasCatalogSku;
use App\Support\Checkout\SaasSubscriptionLookup;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

beforeEach(function (): void {
    Schema::dropIfExists('subscription_items');
    Schema::dropIfExists('subscriptions');
    Schema::dropIfExists('catalog_skus');
    Schema::dropIfExists('catalog_products');
    Schema::dropIfExists('users');

    Schema::create('users', function (Blueprint $table): void {
        $table->id();
        $table->string('username')->nullable();
        $table->string('name');
        $table->string('lastname')->nullable();
        $table->string('document_number')->nullable();
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        $table->string('phone')->nullable();
        $table->text('two_factor_secret')->nullable();
        $table->text('two_factor_recovery_codes')->nullable();
        $table->timestamp('two_factor_confirmed_at')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('catalog_products', function (Blueprint $table): void {
        $table->uuid('id')->primary();
        $table->string('slug', 200)->unique();
        $table->string('name', 255);
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('catalog_skus', function (Blueprint $table): void {
        $table->uuid('id')->primary();
        $table->uuid('catalog_product_id');
        $table->string('code', 120)->unique();
        $table->string('name', 255);
        $table->string('sale_model', 50);
        $table->string('billing_interval', 20)->nullable();
        $table->decimal('list_price', 12, 2);
        $table->string('currency', 3)->default('PEN');
        $table->json('metadata')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });

    Schema::create('subscriptions', function (Blueprint $table): void {
        $table->uuid('id')->primary();
        $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
        $table->string('status', 40);
        $table->timestamp('current_period_start')->nullable();
        $table->timestamp('current_period_end')->nullable();
        $table->boolean('cancel_at_period_end')->default(false);
        $table->json('metadata')->nullable();
        $table->timestamps();
    });

    Schema::create('subscription_items', function (Blueprint $table): void {
        $table->uuid('id')->primary();
        $table->uuid('subscription_id');
        $table->uuid('catalog_sku_id');
        $table->unsignedInteger('quantity')->default(1);
        $table->decimal('unit_price', 12, 2);
        $table->json('metadata')->nullable();
        $table->timestamps();
    });
});

function createVetsaasSku(string $planSlug, string $code): CatalogSku
{
    $product = CatalogProduct::query()->create([
        'name' => 'VetSaaS',
        'slug' => 'vetsaas-'.$planSlug.'-'.uniqid(),
        'is_active' => true,
    ]);

    return CatalogSku::query()->create([
        'catalog_product_id' => $product->id,
        'code' => $code.'-'.uniqid(),
        'name' => 'VetSaaS '.$planSlug,
        'sale_model' => 'saas_subscription',
        'billing_interval' => 'monthly',
        'list_price' => $planSlug === 'free' ? 0 : 39.9,
        'is_active' => true,
        'metadata' => [
            'saas_product' => 'vetsaas',
            'vetsaas_plan_slug' => $planSlug,
        ],
    ]);
}

function createProvisionedVetsaasSubscription(User $user, CatalogSku $sku, string $tenantSlug): Subscription
{
    $subscription = Subscription::query()->create([
        'user_id' => $user->id,
        'status' => Subscription::STATUS_ACTIVE,
        'current_period_start' => now()->subMonth(),
        'current_period_end' => now()->addMonth(),
        'metadata' => [
            'vetsaas_tenant_slug' => $tenantSlug,
        ],
    ]);

    SubscriptionItem::query()->create([
        'subscription_id' => $subscription->id,
        'catalog_sku_id' => $sku->id,
        'quantity' => 1,
        'unit_price' => (string) $sku->list_price,
    ]);

    return $subscription;
}

test('findVetsaasRenewable resolves free to paid upgrade by provisioned tenant', function (): void {
    $user = User::factory()->create();
    $freeSku = createVetsaasSku('free', 'vetsaas-free-mensual');
    $starterSku = createVetsaasSku('starter', 'vetsaas-starter-mensual');

    createProvisionedVetsaasSubscription($user, $freeSku, 'pet-paradise');

    $found = SaasSubscriptionLookup::findVetsaasRenewable($user->id, $starterSku);

    expect($found)->not->toBeNull()
        ->and(SaasSubscriptionLookup::tenantSlugFrom($found))->toBe('pet-paradise');
});

test('findVetsaasRenewable resolves free to pro upgrade', function (): void {
    $user = User::factory()->create();
    $freeSku = createVetsaasSku('free', 'vetsaas-free-mensual');
    $proSku = createVetsaasSku('pro', 'vetsaas-pro-mensual');

    createProvisionedVetsaasSubscription($user, $freeSku, 'clinica-luna');

    $found = SaasSubscriptionLookup::findVetsaasRenewable($user->id, $proSku);

    expect($found)->not->toBeNull()
        ->and(SaasSubscriptionLookup::tenantSlugFrom($found))->toBe('clinica-luna');
});

test('findVetsaasRenewable keeps same sku renewal behavior', function (): void {
    $user = User::factory()->create();
    $starterSku = createVetsaasSku('starter', 'vetsaas-starter-mensual');

    createProvisionedVetsaasSubscription($user, $starterSku, 'clinica-alfa');

    $found = SaasSubscriptionLookup::findVetsaasRenewable($user->id, $starterSku);

    expect($found)->not->toBeNull()
        ->and(SaasSubscriptionLookup::tenantSlugFrom($found))->toBe('clinica-alfa');
});

test('findVetsaasRenewable does not match paid purchase without prior tenant', function (): void {
    $user = User::factory()->create();
    $starterSku = createVetsaasSku('starter', 'vetsaas-starter-mensual');

    expect(SaasSubscriptionLookup::findVetsaasRenewable($user->id, $starterSku))->toBeNull();
});

test('findVetsaasByTenantSlug resolves paid upgrade without matching sku item', function (): void {
    $user = User::factory()->create();
    $freeSku = createVetsaasSku('free', 'vetsaas-free-mensual');
    $clinicaSku = createVetsaasSku('clinica', 'vetsaas-clinica-mensual');

    createProvisionedVetsaasSubscription($user, $freeSku, 'pet-paradise');

    $found = SaasSubscriptionLookup::findVetsaasByTenantSlug('pet-paradise', $clinicaSku);

    expect($found)->not->toBeNull()
        ->and(SaasSubscriptionLookup::tenantSlugFrom($found))->toBe('pet-paradise');
});

test('isFreeSaasSubscription detects free vetsaas and aula subscriptions', function (): void {
    $user = User::factory()->create();
    $freeSku = createVetsaasSku('free', 'vetsaas-free-mensual');
    $starterSku = createVetsaasSku('starter', 'vetsaas-starter-mensual');

    $freeSub = createProvisionedVetsaasSubscription($user, $freeSku, 'pet-paradise');
    $paidSub = createProvisionedVetsaasSubscription($user, $starterSku, 'clinica-alfa');

    expect(SaasCatalogSku::isFreeSaasSubscription($freeSub))->toBeTrue()
        ->and(SaasCatalogSku::isFreeSaasSubscription($paidSub))->toBeFalse();
});
