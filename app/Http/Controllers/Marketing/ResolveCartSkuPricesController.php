<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogSku;
use App\Services\Checkout\VetSaaSRenewalBillingClient;
use App\Support\Checkout\SaasCatalogSku;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ResolveCartSkuPricesController extends Controller
{
    public function __construct(
        private readonly VetSaaSRenewalBillingClient $renewalBillingClient,
    ) {}

    /**
     * Devuelve precios de lista del catálogo por UUID de SKU (plan_id en el carrito).
     * En renovaciones VetSaaS sustituye el precio del SKU por el precio pactado en VetSaaS.
     *
     * @return array<string, array{list_price: float, currency: string, name: string}>
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plan_ids' => ['required', 'array', 'min:1'],
            'plan_ids.*' => ['required', 'uuid'],
        ]);

        $ids = array_values(array_unique($data['plan_ids']));

        $columns = ['id', 'name', 'list_price', 'currency', 'tax_included', 'code', 'sale_model', 'metadata'];
        if (Schema::hasColumn('catalog_skus', 'igv_applies')) {
            $columns[] = 'igv_applies';
        }

        $skus = CatalogSku::query()
            ->with('product:id,name,slug')
            ->whereIn('id', $ids)
            ->where('is_active', true)
            ->get($columns);

        $renewTenantSlug = trim((string) $request->session()->get('vetsaas_renew_tenant_slug', ''));
        $renewalBilling = $renewTenantSlug !== ''
            ? $this->renewalBillingClient->forTenantSlug($renewTenantSlug)
            : null;

        $renewalAddons = [];
        $planAmount = is_array($renewalBilling) ? (float) ($renewalBilling['plan_amount'] ?? 0) : 0.0;
        $billingApplies = is_array($renewalBilling) && ($renewalBilling['applies'] ?? false) === true;

        if ($billingApplies && is_array($renewalBilling['addons'] ?? null)) {
            foreach ($renewalBilling['addons'] as $addon) {
                if (! is_array($addon)) {
                    continue;
                }
                $amount = (float) ($addon['amount'] ?? 0);
                if ($amount <= 0) {
                    continue;
                }
                $renewalAddons[] = [
                    'key' => (string) ($addon['key'] ?? 'addon'),
                    'label' => (string) ($addon['label'] ?? 'Add-on'),
                    'amount' => round($amount, 2),
                    'igv_applies' => false,
                ];
            }
        }

        $prices = [];
        foreach ($skus as $sku) {
            $listPrice = (float) $sku->list_price;

            if ($billingApplies && $planAmount > 0 && SaasCatalogSku::isVetsaas($sku)) {
                $listPrice = $planAmount;
            }

            $prices[$sku->id] = [
                'list_price' => $listPrice,
                'currency' => strtoupper((string) $sku->currency),
                'name' => (string) $sku->name,
                'tax_included' => (bool) $sku->tax_included,
                'igv_applies' => Schema::hasColumn('catalog_skus', 'igv_applies')
                    ? (bool) ($sku->igv_applies ?? true)
                    : true,
                'renewal_price' => $billingApplies && SaasCatalogSku::isVetsaas($sku),
            ];
        }

        return response()->json([
            'prices' => $prices,
            'renewal_addons' => $renewalAddons,
        ]);
    }
}
