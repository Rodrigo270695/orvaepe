<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Support\Checkout\SaasCatalogSku;
use App\Support\Checkout\SaasSubscriptionLookup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Redirige al carrito con el SKU de renovación (mismo plan, sin nuevo subdominio).
 */
class ClientSubscriptionRenewalController extends Controller
{
    public function __invoke(Request $request, Subscription $subscription): RedirectResponse
    {
        abort_unless($subscription->user_id === $request->user()->id, 403);

        $item = $subscription->items()
            ->with(['catalogSku:id,code,name,catalog_product_id,billing_interval', 'catalogSku.product:id,name,slug'])
            ->first();

        if (! $item instanceof SubscriptionItem || $item->catalogSku === null) {
            abort(404);
        }

        $sku = $item->catalogSku;

        $request->session()->put('saas_marketing_renewal', true);

        $tenantSlug = SaasSubscriptionLookup::tenantSlugFrom($subscription);
        if (is_string($tenantSlug) && $tenantSlug !== '') {
            $request->session()->put('vetsaas_renew_tenant_slug', $tenantSlug);
        }

        return redirect()->route('marketing-cart', [
            'renew_plan_id' => $sku->id,
            'renew_system_slug' => $sku->product?->slug ?? (SaasCatalogSku::isVetsaas($sku) ? 'vetsaas' : 'software'),
            'renew_label' => $sku->name,
            'renew' => '1',
        ]);
    }
}
