<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CatalogSku;
use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\User;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LicenseKeysController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));
        $sortBy = trim((string) $request->query('sort_by', ''));
        $sortDir = strtolower((string) $request->query('sort_dir', 'desc'));
        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

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

            return redirect()->route('panel.acceso-licencias.index', $params);
        }

        $query = LicenseKey::query()
            ->with([
                'user:id,name,lastname,email,document_number',
                'catalogSku:id,code,name,catalog_product_id',
                'catalogSku.product:id,name',
                'order:id,order_number',
            ])
            ->withCount('activations');

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($outer) use ($like): void {
                $outer->where('key', 'ILIKE', $like)
                    ->orWhereHas('user', function ($userQuery) use ($like): void {
                        $userQuery->where(function ($inner) use ($like): void {
                            $inner->where('name', 'ILIKE', $like)
                                ->orWhere('lastname', 'ILIKE', $like)
                                ->orWhere('email', 'ILIKE', $like)
                                ->orWhere('document_number', 'ILIKE', $like);
                        });
                    })
                    ->orWhereHas('order', function ($orderQuery) use ($like): void {
                        $orderQuery->where('order_number', 'ILIKE', $like);
                    });
            });
        }

        $query->whereDate('created_at', '>=', $dateFrom);
        $query->whereDate('created_at', '<=', $dateTo);

        $allowedStatuses = [
            LicenseKey::STATUS_DRAFT,
            LicenseKey::STATUS_PENDING,
            LicenseKey::STATUS_ACTIVE,
            LicenseKey::STATUS_EXPIRED,
            LicenseKey::STATUS_REVOKED,
        ];
        if ($status !== '' && in_array($status, $allowedStatuses, true)) {
            $query->where('status', $status);
        }

        $allowedSortBy = [
            'status',
            'key',
            'max_activations',
            'activation_count',
            'expires_at',
            'created_at',
        ];
        if (! in_array($sortBy, $allowedSortBy, true)) {
            $sortBy = 'created_at';
            $sortDir = 'desc';
        }

        $licenseKeys = $query
            ->orderBy($sortBy, $sortDir)
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/acceso-licencias/index', [
            'licenseKeys' => $licenseKeys,
            'usersForSelect' => $this->usersForSelect(),
            'skusForSelect' => $this->skusForSelect(),
            'filters' => [
                'q' => $q,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    /**
     * Parámetros de listado (filtros) solo desde la query string.
     * No usar $request->only() con "status": el POST del formulario también envía
     * un campo "status" (estado de la licencia) y ensuciaría el redirect.
     *
     * @return array<string, mixed>
     */
    private function licenseListRetainQuery(Request $request): array
    {
        $keys = ['q', 'status', 'date_from', 'date_to', 'sort_by', 'sort_dir', 'per_page', 'page'];
        $out = [];

        foreach ($keys as $key) {
            if (! $request->query->has($key)) {
                continue;
            }
            $v = $request->query->get($key);
            if ($v !== null && $v !== '') {
                $out[$key] = $v;
            }
        }

        return $out;
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'catalog_sku_id' => ['required', 'uuid', 'exists:catalog_skus,id'],
            'key' => ['nullable', 'string', 'max:255', 'unique:license_keys,key'],
            'max_activations' => ['required', 'integer', 'min:1', 'max:999'],
            'expires_at' => ['nullable', 'date'],
            'order_number' => ['nullable', 'string', 'max:40'],
            'status' => ['required', 'in:'.LicenseKey::STATUS_DRAFT.','.LicenseKey::STATUS_ACTIVE],
        ]);

        $orderId = null;
        $orderNumber = trim((string) ($validated['order_number'] ?? ''));
        if ($orderNumber !== '') {
            $order = Order::query()
                ->where('user_id', $validated['user_id'])
                ->where('order_number', $orderNumber)
                ->first();

            if ($order === null) {
                return redirect()
                    ->back()
                    ->withErrors([
                        'order_number' => 'No se encontró ese pedido para este cliente.',
                    ])
                    ->withInput();
            }

            $orderId = $order->id;
        }

        $key = trim((string) ($validated['key'] ?? ''));
        if ($key === '') {
            $key = $this->generateUniqueLicenseKey();
        }

        LicenseKey::query()->create([
            'key' => $key,
            'user_id' => $validated['user_id'],
            'order_id' => $orderId,
            'catalog_sku_id' => $validated['catalog_sku_id'],
            'status' => $validated['status'],
            'max_activations' => $validated['max_activations'],
            'activation_count' => 0,
            'expires_at' => $validated['expires_at'] ?? null,
            'metadata' => [
                'created_via' => LicenseKey::CREATED_VIA_ADMIN_MANUAL,
            ],
        ]);

        return redirect()
            ->route('panel.acceso-licencias.index', $this->licenseListRetainQuery($request))
            ->with('toast', AdminFlashToast::success('Licencia creada.'));
    }

    public function update(Request $request, LicenseKey $license_key): RedirectResponse
    {
        if ($license_key->isFromOrderPayment()) {
            return $this->updateOrderPaymentLicense($request, $license_key);
        }

        if (! $license_key->isCreatedViaAdminManual()) {
            abort(403);
        }

        if ($license_key->isRevoked()) {
            return redirect()
                ->back()
                ->with('toast', AdminFlashToast::error('No se puede editar una licencia revocada.'));
        }

        $validated = $request->validate([
            'max_activations' => ['required', 'integer', 'min:1', 'max:999'],
            'expires_at' => ['nullable', 'date'],
            'status' => ['nullable', 'in:'.LicenseKey::STATUS_DRAFT.','.LicenseKey::STATUS_ACTIVE],
        ]);

        $expiresAt = $validated['expires_at'] ?? null;
        if ($expiresAt === '') {
            $expiresAt = null;
        }

        $payload = [
            'max_activations' => $validated['max_activations'],
            'expires_at' => $expiresAt,
        ];

        if ($license_key->status === LicenseKey::STATUS_DRAFT) {
            $next = $validated['status'] ?? LicenseKey::STATUS_DRAFT;
            $payload['status'] = $next;
        } elseif ($request->filled('status')) {
            return redirect()
                ->back()
                ->withErrors([
                    'status' => 'No puedes cambiar el estado de esta licencia.',
                ]);
        }

        $license_key->update($payload);

        return redirect()
            ->route('panel.acceso-licencias.index', $this->licenseListRetainQuery($request))
            ->with('toast', AdminFlashToast::success('Licencia actualizada.'));
    }

    private function updateOrderPaymentLicense(Request $request, LicenseKey $license_key): RedirectResponse
    {
        if ($license_key->isRevoked()) {
            return redirect()
                ->back()
                ->with('toast', AdminFlashToast::error('No se puede editar una licencia revocada.'));
        }

        if ($license_key->status === LicenseKey::STATUS_PENDING) {
            $validated = $request->validate([
                'key' => ['required', 'string', 'max:255', Rule::unique('license_keys', 'key')->ignore($license_key->id)],
                'max_activations' => ['required', 'integer', 'min:1', 'max:999'],
                'expires_at' => ['nullable', 'date'],
                'status' => ['required', 'in:'.LicenseKey::STATUS_PENDING.','.LicenseKey::STATUS_ACTIVE],
            ]);

            $expiresAt = $validated['expires_at'] ?? null;
            if ($expiresAt === '') {
                $expiresAt = null;
            }

            $metadata = $license_key->metadata ?? [];
            if (($validated['status'] ?? '') === LicenseKey::STATUS_ACTIVE) {
                $metadata['awaiting_provider_key'] = false;
                $metadata['fulfilled_at'] = now()->toIso8601String();
            }

            $license_key->update([
                'key' => trim($validated['key']),
                'max_activations' => $validated['max_activations'],
                'expires_at' => $expiresAt,
                'status' => $validated['status'],
                'metadata' => $metadata,
            ]);

            return redirect()
                ->route('panel.acceso-licencias.index', $this->licenseListRetainQuery($request))
                ->with('toast', AdminFlashToast::success('Licencia actualizada.'));
        }

        $validated = $request->validate([
            'max_activations' => ['required', 'integer', 'min:1', 'max:999'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $expiresAt = $validated['expires_at'] ?? null;
        if ($expiresAt === '') {
            $expiresAt = null;
        }

        $license_key->update([
            'max_activations' => $validated['max_activations'],
            'expires_at' => $expiresAt,
        ]);

        return redirect()
            ->route('panel.acceso-licencias.index', $this->licenseListRetainQuery($request))
            ->with('toast', AdminFlashToast::success('Licencia actualizada.'));
    }

    public function destroy(Request $request, LicenseKey $license_key): RedirectResponse
    {
        if (! $license_key->isCreatedViaAdminManual()) {
            abort(403);
        }

        if ($license_key->status !== LicenseKey::STATUS_DRAFT) {
            return redirect()
                ->back()
                ->with('toast', AdminFlashToast::error('Solo se pueden eliminar licencias en borrador.'));
        }

        if ($license_key->activations()->exists()) {
            return redirect()
                ->back()
                ->with('toast', AdminFlashToast::error('No se puede eliminar: la licencia ya tiene activaciones registradas.'));
        }

        $license_key->delete();

        return redirect()
            ->route('panel.acceso-licencias.index', $this->licenseListRetainQuery($request))
            ->with('toast', AdminFlashToast::success('Licencia eliminada.'));
    }

    private function generateUniqueLicenseKey(): string
    {
        do {
            $segments = [];
            for ($i = 0; $i < 4; $i++) {
                $segments[] = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
            }
            $key = 'ORV-'.implode('-', $segments);
        } while (LicenseKey::query()->where('key', $key)->exists());

        return $key;
    }

    /**
     * @return Collection<int, array{id: int, name: string, email: string}>
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
     * @return Collection<int, array{id: string, code: string, name: string, product_name: string, currency: string, list_price: string}>
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
