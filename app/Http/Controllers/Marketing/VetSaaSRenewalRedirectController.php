<?php

declare(strict_types=1);

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogSku;
use App\Support\Checkout\SaasCatalogSku;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Enlace público desde VetSaaS (WhatsApp) → carrito Orvae con el plan de renovación.
 */
class VetSaaSRenewalRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $tenantSlug = trim((string) $request->query('tenant', ''));
        $planSlug = strtolower(trim((string) $request->query('plan', '')));
        $ciclo = strtolower(trim((string) $request->query('ciclo', 'mensual')));

        if ($planSlug === '') {
            return redirect()->route('software-detail', ['system' => 'vetsaas']);
        }

        $sku = $this->resolveSku($planSlug, $ciclo);

        if (! $sku instanceof CatalogSku) {
            return redirect()
                ->route('software-detail', ['system' => 'vetsaas'])
                ->with('status', 'No encontramos el plan indicado. Elige tu plan en la página de VetSaaS.');
        }

        $request->session()->put('saas_marketing_renewal', true);

        if ($tenantSlug !== '') {
            $request->session()->put('vetsaas_renew_tenant_slug', $tenantSlug);
        }

        return redirect()->route('marketing-cart', array_filter([
            'renew_plan_id' => $sku->id,
            'renew_system_slug' => 'vetsaas',
            'renew_label' => $sku->name,
            'renew' => '1',
            'tenant' => $tenantSlug !== '' ? $tenantSlug : null,
        ]));
    }

    private function resolveSku(string $planSlug, string $ciclo): ?CatalogSku
    {
        $annual = in_array($ciclo, ['anual', 'annual', 'year', 'yearly'], true);

        return CatalogSku::query()
            ->with('product:id,name,slug')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->first(function (CatalogSku $sku) use ($planSlug, $annual): bool {
                if (! SaasCatalogSku::isVetsaas($sku)) {
                    return false;
                }

                if ($this->matchesBillingCycle($sku, $annual) === false) {
                    return false;
                }

                foreach (SaasCatalogSku::planSlugCandidates($sku) as $candidate) {
                    $normalized = SaasCatalogSku::normalizePlanSlug($sku, is_string($candidate) ? $candidate : null);
                    if ($normalized === $planSlug) {
                        return true;
                    }
                }

                return false;
            });
    }

    private function matchesBillingCycle(CatalogSku $sku, bool $annual): bool
    {
        $interval = strtolower(trim((string) ($sku->billing_interval ?? '')));

        if ($interval === '') {
            return true;
        }

        $isAnnualSku = in_array($interval, ['year', 'yearly', 'annual', 'anual'], true);

        return $annual ? $isAnnualSku : ! $isAnnualSku;
    }
}
