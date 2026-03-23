<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OemLicenseDelivery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OemLicenseDeliveriesController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));

        $perPage = (int) $request->query('per_page', 25);
        $allowedPerPage = [10, 15, 20, 25, 30, 40, 50];
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        $dateFrom = trim((string) $request->query('date_from', ''));
        $dateTo = trim((string) $request->query('date_to', ''));
        $datePattern = '/^\d{4}-\d{2}-\d{2}$/';
        $validFrom = $dateFrom !== '' && preg_match($datePattern, $dateFrom);
        $validTo = $dateTo !== '' && preg_match($datePattern, $dateTo);

        if (! $validFrom || ! $validTo) {
            $params = array_merge($request->query(), [
                'date_from' => now()->startOfMonth()->format('Y-m-d'),
                'date_to' => now()->endOfMonth()->format('Y-m-d'),
            ]);

            return redirect()->route('panel.acceso-entregas-oem.index', $params);
        }

        $query = OemLicenseDelivery::query()
            ->with([
                'orderLine' => fn ($rel) => $rel->select(
                    'id',
                    'order_id',
                    'product_name_snapshot',
                    'sku_name_snapshot',
                ),
                'orderLine.order:id,order_number,user_id',
                'orderLine.order.user:id,name,lastname,email',
            ]);

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($outer) use ($like): void {
                $outer->where('vendor', 'ILIKE', $like)
                    ->orWhere('license_code', 'ILIKE', $like)
                    ->orWhere('activation_payload', 'ILIKE', $like)
                    ->orWhereHas('orderLine.order', function ($orderQuery) use ($like): void {
                        $orderQuery->where('order_number', 'ILIKE', $like);
                    });
            });
        }

        $query->whereDate('created_at', '>=', $dateFrom);
        $query->whereDate('created_at', '<=', $dateTo);

        $allowedStatuses = [
            OemLicenseDelivery::STATUS_PENDING,
            OemLicenseDelivery::STATUS_DELIVERED,
            OemLicenseDelivery::STATUS_REVOKED,
        ];
        if ($status !== '' && in_array($status, $allowedStatuses, true)) {
            $query->where('status', $status);
        }

        $deliveries = $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/acceso-entregas-oem/index', [
            'oemLicenseDeliveries' => $deliveries,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
