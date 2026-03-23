<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VentasPagosController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $pendingPaymentCount = Order::query()
            ->where('status', Order::STATUS_PENDING_PAYMENT)
            ->count();

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

            return redirect()->route('panel.ventas-pagos.index', $params);
        }

        $q = trim((string) $request->query('q', ''));
        $gateway = trim((string) $request->query('gateway', ''));
        $status = trim((string) $request->query('status', ''));

        $paymentsQuery = Payment::query()
            ->with([
                'order:id,order_number,currency',
                'user:id,name,lastname,email',
            ])
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->orderByDesc('created_at');

        if ($q !== '') {
            $paymentsQuery->whereHas('order', function ($orderQuery) use ($q) {
                $orderQuery->where('order_number', 'ILIKE', "%{$q}%");
            });
        }

        if ($gateway !== '') {
            $paymentsQuery->where('gateway', $gateway);
        }

        if ($status !== '') {
            $paymentsQuery->where('status', $status);
        }

        $payments = $paymentsQuery->paginate($perPage)->withQueryString();

        $gatewayOptions = Payment::query()
            ->select('gateway')
            ->distinct()
            ->orderBy('gateway')
            ->pluck('gateway')
            ->values()
            ->all();

        $statusOptions = Payment::query()
            ->select('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status')
            ->values()
            ->all();

        return Inertia::render('admin/ventas-pagos/index', [
            'paymentGatewayEnabled' => (bool) config('services.payments.gateway_enabled', false),
            'pendingPaymentCount' => $pendingPaymentCount,
            'payments' => $payments,
            'filters' => [
                'q' => $q,
                'gateway' => $gateway,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'gatewayOptions' => $gatewayOptions,
            'statusOptions' => $statusOptions,
        ]);
    }
}
