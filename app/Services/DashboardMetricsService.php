<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\CatalogProduct;
use App\Models\CatalogSku;
use App\Models\Coupon;
use App\Models\Entitlement;
use App\Models\Order;
use App\Models\SoftwareRelease;
use App\Models\Subscription;
use App\Models\User;
use App\Models\WebhookEvent;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Métricas del panel operativo (dashboard e informes).
 */
class DashboardMetricsService
{
    private const CHART_DAYS = 14;

    /**
     * @return array{
     *     kpis: array,
     *     dailyChart: array,
     *     ordersByStatus: array,
     *     revenueByLine: array,
     *     paymentsByGateway: array,
     *     subscriptionsByStatus: array,
     * }
     */
    public function build(): array
    {
        $chartStart = Carbon::now()->subDays(self::CHART_DAYS - 1)->startOfDay();

        $ordersPlacedByDay = $this->countsByDay(
            Order::query()
                ->whereNotNull('placed_at')
                ->where('placed_at', '>=', $chartStart),
            'placed_at',
        );

        $revenuePaidByDay = $this->sumsByDay(
            Order::query()
                ->where('status', Order::STATUS_PAID)
                ->whereNotNull('placed_at')
                ->where('placed_at', '>=', $chartStart),
            'placed_at',
            'grand_total',
        );

        $ordersByStatus = Order::query()
            ->selectRaw('status')
            ->selectRaw('COUNT(*)::int as count')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => (string) $row->status,
                'count' => (int) $row->count,
            ])
            ->values()
            ->all();

        $revenueByLine = $this->revenueByRevenueLine();

        $paymentsByGateway = DB::table('payments')
            ->whereNotNull('paid_at')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('gateway')
            ->selectRaw('COALESCE(SUM(amount), 0)::numeric(12,2) as total')
            ->groupBy('gateway')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'gateway' => (string) $row->gateway,
                'total' => (float) $row->total,
            ])
            ->values()
            ->all();

        $subscriptionsByStatus = Subscription::query()
            ->selectRaw('status')
            ->selectRaw('COUNT(*)::int as count')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => (string) $row->status,
                'count' => (int) $row->count,
            ])
            ->values()
            ->all();

        $revenuePaidLast30 = (float) Order::query()
            ->where('status', Order::STATUS_PAID)
            ->whereNotNull('placed_at')
            ->where('placed_at', '>=', Carbon::now()->subDays(30))
            ->sum('grand_total');

        $revenuePaidAll = (float) Order::query()
            ->where('status', Order::STATUS_PAID)
            ->sum('grand_total');

        $kpis = [
            'orders_total' => Order::query()->count(),
            'orders_paid' => Order::query()->where('status', Order::STATUS_PAID)->count(),
            'orders_pending_payment' => Order::query()->where('status', Order::STATUS_PENDING_PAYMENT)->count(),
            'revenue_paid_all' => $revenuePaidAll,
            'revenue_paid_last_30d' => $revenuePaidLast30,
            'subscriptions_active' => Subscription::query()->where('status', Subscription::STATUS_ACTIVE)->count(),
            'entitlements_active' => Entitlement::query()->where('status', Entitlement::STATUS_ACTIVE)->count(),
            'webhooks_pending' => WebhookEvent::query()->where('processed', false)->count(),
            'users_total' => User::query()->count(),
            'clients_total' => User::role('client')->count(),
            'products_active' => CatalogProduct::query()->where('is_active', true)->count(),
            'skus_active' => CatalogSku::query()->where('is_active', true)->count(),
            'coupons_active' => Coupon::query()->where('is_active', true)->count(),
            'releases_total' => SoftwareRelease::query()->count(),
            'audit_logs_7d' => AuditLog::query()->where('created_at', '>=', Carbon::now()->subDays(7))->count(),
        ];

        $dailyChart = $this->mergeDailySeries($ordersPlacedByDay, $revenuePaidByDay, self::CHART_DAYS);

        return [
            'kpis' => $kpis,
            'dailyChart' => $dailyChart,
            'ordersByStatus' => $ordersByStatus,
            'revenueByLine' => $revenueByLine,
            'paymentsByGateway' => $paymentsByGateway,
            'subscriptionsByStatus' => $subscriptionsByStatus,
        ];
    }

    /**
     * @return array<int, array{date: string, short_label: string, orders: int, revenue: float}>
     */
    private function mergeDailySeries(Collection $orderCounts, Collection $revenueSums, int $days): array
    {
        $out = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $d = Carbon::now()->subDays($i)->format('Y-m-d');
            $out[] = [
                'date' => $d,
                'short_label' => Carbon::parse($d)->translatedFormat('d M'),
                'orders' => (int) ($orderCounts->get($d) ?? 0),
                'revenue' => round((float) ($revenueSums->get($d) ?? 0), 2),
            ];
        }

        return $out;
    }

    private function countsByDay($query, string $dateColumn): Collection
    {
        /** @var Builder<Order> $query */
        $rows = (clone $query)
            ->selectRaw('DATE('.$dateColumn.') as d')
            ->selectRaw('COUNT(*)::int as c')
            ->groupByRaw('DATE('.$dateColumn.')')
            ->orderBy('d')
            ->get();

        return $rows->mapWithKeys(fn ($row) => [
            Carbon::parse($row->d)->format('Y-m-d') => (int) $row->c,
        ]);
    }

    /**
     * @param  Builder<Order>  $query
     */
    private function sumsByDay($query, string $dateColumn, string $sumColumn): Collection
    {
        $rows = (clone $query)
            ->selectRaw('DATE('.$dateColumn.') as d')
            ->selectRaw('SUM('.$sumColumn.')::numeric(14,2) as total')
            ->groupByRaw('DATE('.$dateColumn.')')
            ->orderBy('d')
            ->get();

        return $rows->mapWithKeys(fn ($row) => [
            Carbon::parse($row->d)->format('Y-m-d') => (float) $row->total,
        ]);
    }

    /**
     * @return list<array{key: string, label: string, total: float}>
     */
    private function revenueByRevenueLine(): array
    {
        $rows = DB::table('order_lines')
            ->join('orders', 'order_lines.order_id', '=', 'orders.id')
            ->join('catalog_skus', 'order_lines.catalog_sku_id', '=', 'catalog_skus.id')
            ->join('catalog_products', 'catalog_skus.catalog_product_id', '=', 'catalog_products.id')
            ->join('catalog_categories', 'catalog_products.category_id', '=', 'catalog_categories.id')
            ->where('orders.status', Order::STATUS_PAID)
            ->selectRaw('catalog_categories.revenue_line as line')
            ->selectRaw('COALESCE(SUM(order_lines.line_total), 0)::numeric(14,2) as total')
            ->groupBy('catalog_categories.revenue_line')
            ->orderByDesc('total')
            ->get();

        $labels = [
            'software_system' => 'Software propio',
            'oem_license' => 'Licencias OEM',
            'service' => 'Servicios',
        ];

        return $rows
            ->map(function ($row) use ($labels) {
                $key = (string) $row->line;

                return [
                    'key' => $key,
                    'label' => $labels[$key] ?? $key,
                    'total' => (float) $row->total,
                ];
            })
            ->values()
            ->all();
    }
}
