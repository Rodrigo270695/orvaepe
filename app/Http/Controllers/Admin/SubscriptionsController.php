<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SubscriptionStoreRequest;
use App\Http\Requests\Admin\SubscriptionUpdateRequest;
use App\Models\CatalogSku;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Models\User;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionsController extends Controller
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

            return redirect()->route('panel.ventas-suscripciones.index', $params);
        }

        $subscriptionsQuery = Subscription::query()
            ->with([
                'user:id,name,lastname,email,document_number',
                'items.catalogSku:id,code,name',
            ])
            ->withCount('items');

        if ($q !== '') {
            $like = '%'.$q.'%';
            $subscriptionsQuery->whereHas('user', function ($userQuery) use ($like): void {
                $userQuery->where(function ($inner) use ($like): void {
                    $inner->where('name', 'ILIKE', $like)
                        ->orWhere('lastname', 'ILIKE', $like)
                        ->orWhere('email', 'ILIKE', $like)
                        ->orWhere('document_number', 'ILIKE', $like);
                });
            });
        }

        $subscriptionsQuery->whereDate('created_at', '>=', $dateFrom);
        $subscriptionsQuery->whereDate('created_at', '<=', $dateTo);

        $allowedStatuses = [
            Subscription::STATUS_TRIALING,
            Subscription::STATUS_ACTIVE,
            Subscription::STATUS_PAST_DUE,
            Subscription::STATUS_PAUSED,
            Subscription::STATUS_CANCELLED,
        ];
        if ($status !== '' && in_array($status, $allowedStatuses, true)) {
            $subscriptionsQuery->where('status', $status);
        }

        $subscriptions = $subscriptionsQuery
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/ventas-suscripciones/index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/ventas-suscripciones/create', [
            'usersForSelect' => $this->usersForSelect(),
            'skusForSelect' => $this->skusForSelect(),
        ]);
    }

    public function store(SubscriptionStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $data['cancel_at_period_end'] = (bool) ($data['cancel_at_period_end'] ?? false);

        if (($data['status'] ?? '') === Subscription::STATUS_CANCELLED) {
            $data['cancelled_at'] = now();
        } else {
            $data['cancelled_at'] = null;
        }

        DB::transaction(function () use ($data, $items): void {
            $subscription = Subscription::create($data);
            foreach ($items as $item) {
                SubscriptionItem::create([
                    'subscription_id' => $subscription->id,
                    'catalog_sku_id' => $item['catalog_sku_id'],
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);
            }
        });

        return redirect()
            ->route('panel.ventas-suscripciones.index')
            ->with('toast', AdminFlashToast::success('Suscripción creada.'));
    }

    public function edit(Subscription $subscription): Response
    {
        $subscription->load([
            'items' => fn ($q) => $q->orderBy('created_at'),
        ]);

        return Inertia::render('admin/ventas-suscripciones/edit', [
            'subscription' => [
                'id' => $subscription->id,
                'user_id' => $subscription->user_id,
                'status' => $subscription->status,
                'gateway_customer_id' => $subscription->gateway_customer_id,
                'gateway_subscription_id' => $subscription->gateway_subscription_id,
                'current_period_start' => $subscription->current_period_start?->toIso8601String(),
                'current_period_end' => $subscription->current_period_end?->toIso8601String(),
                'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
                'cancel_at_period_end' => (bool) $subscription->cancel_at_period_end,
                'items' => $subscription->items->map(fn (SubscriptionItem $i) => [
                    'catalog_sku_id' => $i->catalog_sku_id,
                    'quantity' => $i->quantity,
                    'unit_price' => (string) $i->unit_price,
                ]),
            ],
            'usersForSelect' => $this->usersForSelect(),
            'skusForSelect' => $this->skusForSelect(),
        ]);
    }

    public function update(SubscriptionUpdateRequest $request, Subscription $subscription): RedirectResponse
    {
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $data['cancel_at_period_end'] = (bool) ($data['cancel_at_period_end'] ?? false);

        $newStatus = $data['status'];
        if ($newStatus === Subscription::STATUS_CANCELLED) {
            if ($subscription->cancelled_at === null) {
                $data['cancelled_at'] = now();
            }
        } else {
            $data['cancelled_at'] = null;
        }

        DB::transaction(function () use ($subscription, $data, $items): void {
            $subscription->update($data);
            $subscription->items()->delete();
            foreach ($items as $item) {
                SubscriptionItem::create([
                    'subscription_id' => $subscription->id,
                    'catalog_sku_id' => $item['catalog_sku_id'],
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);
            }
        });

        return redirect()
            ->route('panel.ventas-suscripciones.index')
            ->with('toast', AdminFlashToast::success('Suscripción actualizada.'));
    }

    public function cancel(Subscription $subscription): RedirectResponse
    {
        if ($subscription->status === Subscription::STATUS_CANCELLED) {
            return redirect()
                ->route('panel.ventas-suscripciones.index')
                ->with('toast', AdminFlashToast::error('La suscripción ya estaba cancelada.'));
        }

        $subscription->update([
            'status' => Subscription::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancel_at_period_end' => false,
        ]);

        return redirect()
            ->route('panel.ventas-suscripciones.index')
            ->with('toast', AdminFlashToast::success('Suscripción cancelada.'));
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: int, name: string, email: string}>
     */
    private function usersForSelect()
    {
        return User::query()
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
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: string, code: string, name: string, product_name: string, currency: string, list_price: string}>
     */
    private function skusForSelect()
    {
        return CatalogSku::query()
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
    }
}
