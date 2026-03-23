<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\OrderStoreRequest;
use App\Models\CatalogSku;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\User;
use App\Support\Sales\PeruIgvLineCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrdersController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));

        $perPage = (int) $request->query('per_page', 25);
        $allowedPerPage = [10, 15, 20, 25, 30, 40, 50];
        if (!in_array($perPage, $allowedPerPage, true)) {
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

            return redirect()->route('panel.ventas-ordenes.index', $params);
        }

        $ordersQuery = Order::query()
            ->with(['user:id,name,lastname,email,document_number'])
            ->withCount('lines');

        if ($q !== '') {
            $ordersQuery->where('order_number', 'ILIKE', "%{$q}%");
        }

        $ordersQuery->whereDate('created_at', '>=', $dateFrom);
        $ordersQuery->whereDate('created_at', '<=', $dateTo);

        $allowedStatuses = [
            Order::STATUS_DRAFT,
            Order::STATUS_PENDING_PAYMENT,
            Order::STATUS_PAID,
            Order::STATUS_CANCELLED,
            Order::STATUS_REFUNDED,
        ];
        if ($status !== '' && in_array($status, $allowedStatuses, true)) {
            $ordersQuery->where('status', $status);
        }

        $append = ['per_page' => $perPage];
        if ($q !== '') {
            $append['q'] = $q;
        }
        if ($status !== '') {
            $append['status'] = $status;
        }
        $append['date_from'] = $dateFrom;
        $append['date_to'] = $dateTo;

        $sortDir = strtolower((string) $request->query('sort_dir', 'desc'));
        if (!in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }
        $append['sort_dir'] = $sortDir;

        $orders = $ordersQuery
            ->orderBy('created_at', $sortDir)
            ->paginate($perPage)
            ->appends($append);

        return Inertia::render('admin/ventas-ordenes/index', [
            'orders' => $orders,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'sort_dir' => $sortDir,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create(): Response
    {
        // Rol portal cliente (Spatie): `client` — ver RoleSeeder.
        $usersForSelect = User::query()
            ->role('client')
            ->orderBy('name')
            ->orderBy('email')
            ->limit(500)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ]);

        $skusForSelect = CatalogSku::query()
            ->with('product:id,name')
            ->where('is_active', true)
            ->orderBy('code')
            ->get()
            ->map(fn (CatalogSku $s) => [
                'id' => $s->id,
                'code' => $s->code,
                'name' => $s->name,
                'product_name' => $s->product?->name ?? '—',
                'currency' => $s->currency,
                'list_price' => (string) $s->list_price,
            ]);

        return Inertia::render('admin/ventas-ordenes/create', [
            'usersForSelect' => $usersForSelect,
            'skusForSelect' => $skusForSelect,
        ]);
    }

    public function store(OrderStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $linesInput = $data['lines'];
        unset($data['lines']);

        $currency = strtoupper($data['currency']);
        $data['currency'] = $currency;

        $skuIds = collect($linesInput)->pluck('catalog_sku_id')->unique()->values();
        $skus = CatalogSku::query()
            ->with('product:id,name')
            ->whereIn('id', $skuIds)
            ->get()
            ->keyBy('id');

        foreach ($linesInput as $index => $line) {
            $sku = $skus->get($line['catalog_sku_id']);
            if ($sku === null) {
                throw ValidationException::withMessages([
                    "lines.{$index}.catalog_sku_id" => 'SKU no encontrado.',
                ]);
            }
            if (! $sku->is_active) {
                throw ValidationException::withMessages([
                    "lines.{$index}.catalog_sku_id" => 'El SKU no está activo.',
                ]);
            }
            if (strtoupper((string) $sku->currency) !== $currency) {
                throw ValidationException::withMessages([
                    "lines.{$index}.catalog_sku_id" => 'La moneda del SKU debe coincidir con la moneda del pedido ('.$currency.').',
                ]);
            }
        }

        $order = DB::transaction(function () use ($data, $linesInput, $skus) {
            $subtotal = 0.0;
            $discountTotal = 0.0;
            $taxTotal = 0.0;

            $lineRows = [];
            foreach ($linesInput as $line) {
                $sku = $skus->get($line['catalog_sku_id']);
                $qty = (int) $line['quantity'];
                $unit = (float) $sku->list_price;
                $lineDiscount = 0.0;

                $amounts = PeruIgvLineCalculator::forLine(
                    $qty,
                    $unit,
                    (bool) $sku->tax_included,
                    null,
                    (bool) ($sku->igv_applies ?? true),
                );

                $subtotal += $amounts->baseLine;
                $taxTotal += $amounts->taxLine;

                $lineTotal = round($amounts->lineTotal - $lineDiscount, 2);

                $productName = $sku->product?->name ?? '—';
                $lineRows[] = [
                    'catalog_sku_id' => $sku->id,
                    'product_name_snapshot' => $productName,
                    'sku_name_snapshot' => $sku->name,
                    'quantity' => $qty,
                    'unit_price' => round($unit, 2),
                    'line_discount' => $lineDiscount,
                    'tax_amount' => $amounts->taxLine,
                    'line_total' => $lineTotal,
                    'metadata' => [
                        'tax_included' => (bool) $sku->tax_included,
                        'igv_applies' => (bool) ($sku->igv_applies ?? true),
                        'igv_rate' => (float) config('sales.igv_rate', 0.18),
                    ],
                ];
            }

            $subtotal = round($subtotal, 2);
            $discountTotal = round($discountTotal, 2);
            $taxTotal = round($taxTotal, 2);
            $grandTotal = round($subtotal - $discountTotal + $taxTotal, 2);

            $placedAt = null;
            if (($data['status'] ?? '') === Order::STATUS_PAID) {
                $placedAt = now();
            }

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $data['user_id'],
                'status' => $data['status'],
                'currency' => $data['currency'],
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'grand_total' => $grandTotal,
                'coupon_id' => null,
                'billing_snapshot' => null,
                'notes_internal' => $data['notes_internal'] ?? null,
                'placed_at' => $placedAt,
            ]);

            foreach ($lineRows as $row) {
                OrderLine::create(array_merge($row, ['order_id' => $order->id]));
            }

            return $order;
        });

        return redirect()->route('panel.ventas-ordenes.show', $order);
    }

    public function destroy(Order $order): RedirectResponse
    {
        if (! in_array($order->status, [Order::STATUS_DRAFT, Order::STATUS_PENDING_PAYMENT], true)) {
            abort(403);
        }

        $order->delete();

        return redirect()
            ->route('panel.ventas-ordenes.index')
            ->with('success', 'Pedido eliminado.');
    }

    public function show(Order $order): Response
    {
        $order->load([
            'lines' => fn ($q) => $q->orderBy('created_at'),
            'user:id,name,lastname,email,document_number',
            'coupon:id,code',
        ]);

        return Inertia::render('admin/ventas-ordenes/show', [
            'order' => $order,
        ]);
    }
}
