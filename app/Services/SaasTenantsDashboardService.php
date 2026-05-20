<?php

namespace App\Services;

use App\Models\CatalogSku;
use App\Models\Order;
use App\Models\Subscription;
use App\Support\Checkout\SaasCatalogSku;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Métricas de tenants provisionados (Aula Virtual y VetSaaS) para el panel operativo.
 */
class SaasTenantsDashboardService
{
    /**
     * @return array{
     *     aulavirtual: array<string, mixed>,
     *     vetsaas: array<string, mixed>,
     * }
     */
    public function build(): array
    {
        return [
            'aulavirtual' => $this->buildPanel(
                key: 'aulavirtual',
                label: 'Aula Virtual',
                description: 'Academias y tenants LMS provisionados tras la compra.',
                product: 'aulavirtual',
                slugMetaKey: 'aula_virtual_tenant_slug',
                urlMetaKey: 'aula_virtual_academy_url',
                skipSnapshotKey: 'aulavirtual_provision_skipped',
                configPrefix: 'aulavirtual',
                accent: 'aula',
            ),
            'vetsaas' => $this->buildPanel(
                key: 'vetsaas',
                label: 'VetSaaS',
                description: 'Clínicas veterinarias multi-tenant tras activación del plan.',
                product: 'vetsaas',
                slugMetaKey: 'vetsaas_tenant_slug',
                urlMetaKey: 'vetsaas_login_url',
                skipSnapshotKey: 'vetsaas_provision_skipped',
                errorSnapshotKey: 'vetsaas_provision_error',
                configPrefix: 'vetsaas',
                accent: 'vet',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildPanel(
        string $key,
        string $label,
        string $description,
        string $product,
        string $slugMetaKey,
        string $urlMetaKey,
        string $skipSnapshotKey,
        string $configPrefix,
        string $accent,
        ?string $errorSnapshotKey = null,
    ): array {
        $enabled = (bool) config("services.{$configPrefix}.enabled", false);
        $provisionUrl = trim((string) config("services.{$configPrefix}.provision_url"));
        $hasSecret = filled(config("services.{$configPrefix}.hmac_secret"));
        $configured = $provisionUrl !== '' && $hasSecret;
        $tenantDomain = (string) config("services.{$configPrefix}.tenant_domain", match ($key) {
            'vetsaas' => 'vetsaas.orvae.pe',
            default => 'aulavirtual.orvae.pe',
        });
        $tenantScheme = (string) config("services.{$configPrefix}.tenant_scheme", 'https');

        $skuIds = $this->saasSkuIdsForProduct($product);
        $recentTenants = $this->collectRecentTenants($slugMetaKey, $urlMetaKey, $skipSnapshotKey, $errorSnapshotKey, $skuIds, $tenantScheme, $tenantDomain);
        $tenantSlugs = $recentTenants->pluck('tenant_slug')->filter()->unique()->values();

        $subscriptionsTotal = $this->countSubscriptionsForSkus($skuIds);
        $subscriptionsActive = $this->countSubscriptionsForSkus($skuIds, Subscription::STATUS_ACTIVE);

        $paidOrders = Order::query()
            ->where('status', Order::STATUS_PAID)
            ->whereHas('lines', fn ($q) => $q->whereIn('catalog_sku_id', $skuIds))
            ->count();

        $revenueLast30 = (float) Order::query()
            ->where('status', Order::STATUS_PAID)
            ->whereNotNull('placed_at')
            ->where('placed_at', '>=', Carbon::now()->subDays(30))
            ->whereHas('lines', fn ($q) => $q->whereIn('catalog_sku_id', $skuIds))
            ->sum('grand_total');

        $provisionErrors = Order::query()
            ->where('status', Order::STATUS_PAID)
            ->where(function ($q) use ($slugMetaKey, $errorSnapshotKey, $skipSnapshotKey): void {
                $q->whereNull("billing_snapshot->{$slugMetaKey}");
                if ($errorSnapshotKey !== null) {
                    $q->orWhereNotNull("billing_snapshot->{$errorSnapshotKey}");
                } else {
                    $q->orWhereNotNull("billing_snapshot->{$skipSnapshotKey}");
                }
            })
            ->whereHas('lines', fn ($q) => $q->whereIn('catalog_sku_id', $skuIds))
            ->count();

        return [
            'key' => $key,
            'label' => $label,
            'description' => $description,
            'accent' => $accent,
            'enabled' => $enabled,
            'configured' => $configured,
            'provision_url' => $provisionUrl !== '' ? $provisionUrl : null,
            'tenant_domain' => $tenantDomain,
            'stats' => [
                'tenants_total' => $tenantSlugs->count(),
                'subscriptions_total' => $subscriptionsTotal,
                'subscriptions_active' => $subscriptionsActive,
                'paid_orders' => $paidOrders,
                'revenue_last_30d' => round($revenueLast30, 2),
                'provision_attention' => $provisionErrors,
            ],
            'recent_tenants' => $recentTenants->take(8)->values()->all(),
        ];
    }

    /**
     * @return list<string>
     */
    private function saasSkuIdsForProduct(string $product): array
    {
        return CatalogSku::query()
            ->with('product')
            ->where('is_active', true)
            ->get()
            ->filter(function (CatalogSku $sku) use ($product): bool {
                return match ($product) {
                    'vetsaas' => SaasCatalogSku::isVetsaas($sku),
                    'aulavirtual' => SaasCatalogSku::isAulaVirtual($sku),
                    default => false,
                };
            })
            ->pluck('id')
            ->values()
            ->all();
    }

    /**
     * @param  list<string>  $skuIds
     */
    private function countSubscriptionsForSkus(array $skuIds, ?string $status = null): int
    {
        if ($skuIds === []) {
            return 0;
        }

        $query = Subscription::query()
            ->whereHas('items', fn ($q) => $q->whereIn('catalog_sku_id', $skuIds));

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->count();
    }

    /**
     * @param  list<string>  $skuIds
     * @return Collection<int, array<string, mixed>>
     */
    private function collectRecentTenants(
        string $slugMetaKey,
        string $urlMetaKey,
        string $skipSnapshotKey,
        ?string $errorSnapshotKey,
        array $skuIds,
        string $tenantScheme,
        string $tenantDomain,
    ): Collection {
        $rows = collect();

        $subscriptions = Subscription::query()
            ->with(['user', 'items.catalogSku'])
            ->where(function ($q) use ($slugMetaKey, $skuIds): void {
                $q->whereNotNull("metadata->{$slugMetaKey}");
                if ($skuIds !== []) {
                    $q->orWhereHas('items', fn ($iq) => $iq->whereIn('catalog_sku_id', $skuIds));
                }
            })
            ->latest('created_at')
            ->limit(40)
            ->get();

        foreach ($subscriptions as $subscription) {
            $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
            $slug = $metadata[$slugMetaKey] ?? null;
            $url = $metadata[$urlMetaKey] ?? null;
            $sku = $subscription->items->first()?->catalogSku;
            $planLabel = $sku?->name ?? $sku?->code;

            if (! is_string($slug) || $slug === '') {
                continue;
            }

            $rows->push([
                'tenant_slug' => $slug,
                'tenant_label' => Str::headline(str_replace('-', ' ', $slug)),
                'customer_email' => $subscription->user?->email,
                'customer_name' => trim((string) ($subscription->user?->name ?? '').' '.(string) ($subscription->user?->lastname ?? '')),
                'plan_label' => $planLabel,
                'subscription_status' => $subscription->status,
                'access_url' => is_string($url) && $url !== ''
                    ? $url
                    : $this->guessTenantUrl($slug, $tenantScheme, $tenantDomain, str_contains($urlMetaKey, 'login')),
                'provision_status' => 'ok',
                'provision_note' => null,
                'order_number' => is_string($metadata['checkout_order_number'] ?? null)
                    ? $metadata['checkout_order_number']
                    : null,
                'created_at' => $subscription->created_at?->toIso8601String(),
                '_sort' => $subscription->created_at?->timestamp ?? 0,
            ]);
        }

        $orders = Order::query()
            ->with('user')
            ->where('status', Order::STATUS_PAID)
            ->whereNotNull("billing_snapshot->{$slugMetaKey}")
            ->when($skuIds !== [], fn ($q) => $q->whereHas('lines', fn ($lq) => $lq->whereIn('catalog_sku_id', $skuIds)))
            ->latest('placed_at')
            ->limit(30)
            ->get();

        foreach ($orders as $order) {
            $snapshot = is_array($order->billing_snapshot) ? $order->billing_snapshot : [];
            $slug = $snapshot[$slugMetaKey] ?? null;

            if (! is_string($slug) || $slug === '') {
                continue;
            }

            if ($rows->contains(fn (array $r): bool => ($r['tenant_slug'] ?? '') === $slug)) {
                continue;
            }

            $url = $snapshot[$urlMetaKey] ?? null;
            $provisionStatus = 'ok';
            $provisionNote = null;

            if ($errorSnapshotKey !== null && isset($snapshot[$errorSnapshotKey])) {
                $provisionStatus = 'error';
                $provisionNote = is_array($snapshot[$errorSnapshotKey])
                    ? ($snapshot[$errorSnapshotKey]['message'] ?? 'Error de provisión')
                    : 'Error de provisión';
            } elseif (isset($snapshot[$skipSnapshotKey])) {
                $provisionStatus = 'skipped';
                $provisionNote = (string) $snapshot[$skipSnapshotKey];
            } elseif (! is_string($url) || $url === '') {
                $provisionStatus = 'pending';
                $provisionNote = 'Pedido pagado; pendiente URL de acceso';
            }

            $rows->push([
                'tenant_slug' => $slug,
                'tenant_label' => Str::headline(str_replace('-', ' ', $slug)),
                'customer_email' => $order->user?->email,
                'customer_name' => trim((string) ($order->user?->name ?? '').' '.(string) ($order->user?->lastname ?? '')),
                'plan_label' => null,
                'subscription_status' => null,
                'access_url' => is_string($url) && $url !== ''
                    ? $url
                    : $this->guessTenantUrl($slug, $tenantScheme, $tenantDomain, str_contains($urlMetaKey, 'login')),
                'provision_status' => $provisionStatus,
                'provision_note' => $provisionNote,
                'order_number' => $order->order_number,
                'created_at' => ($order->placed_at ?? $order->created_at)?->toIso8601String(),
                '_sort' => ($order->placed_at ?? $order->created_at)?->timestamp ?? 0,
            ]);
        }

        return $rows
            ->sortByDesc('_sort')
            ->map(function (array $row): array {
                unset($row['_sort']);

                return $row;
            })
            ->values();
    }

    private function guessTenantUrl(string $slug, string $scheme, string $domain, bool $withLoginPath): string
    {
        $base = sprintf('%s://%s.%s', $scheme, $slug, $domain);

        return $withLoginPath ? $base.'/login' : $base;
    }
}
