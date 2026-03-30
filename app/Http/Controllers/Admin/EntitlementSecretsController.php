<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EntitlementSecretStoreRequest;
use App\Models\Entitlement;
use App\Models\EntitlementSecret;
use App\Support\AdminFlashToast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EntitlementSecretsController extends Controller
{
    public function store(EntitlementSecretStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $plain = $data['secret_value'];
        unset($data['secret_value']);

        $publicRef = $data['public_ref'] ?? null;
        if ($publicRef === null || $publicRef === '') {
            $publicRef = '…'.substr(preg_replace('/\s+/', '', $plain), -6);
        }

        EntitlementSecret::query()->create([
            'entitlement_id' => $data['entitlement_id'],
            'kind' => $data['kind'],
            'label' => $data['label'] ?? null,
            'public_ref' => $publicRef,
            'secret_ciphertext' => Crypt::encryptString($plain),
            'expires_at' => $data['expires_at'] ?? null,
            'rotated_at' => null,
            'revoked_at' => null,
            'last_used_at' => null,
            'metadata' => null,
        ]);

        return back()
            ->with('toast', AdminFlashToast::success('Credencial registrada correctamente.'));
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $q = trim((string) $request->query('q', ''));
        $entitlementId = trim((string) $request->query('entitlement_id', ''));
        $kind = trim((string) $request->query('kind', ''));
        $entitlementStatus = trim((string) $request->query('entitlement_status', ''));
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

            return redirect()->route('panel.acceso-credenciales.index', $params);
        }

        $secretsQuery = EntitlementSecret::query()
            ->with([
                'entitlement' => fn ($rel) => $rel->select('id', 'user_id', 'status', 'catalog_product_id'),
                'entitlement.user:id,name,lastname,email',
                'entitlement.catalogProduct:id,name',
            ]);

        $entitlementFilterLabel = null;
        $filterByEntitlementId = $entitlementId !== '' && Str::isUuid($entitlementId);

        if ($filterByEntitlementId) {
            $secretsQuery->where('entitlement_id', $entitlementId);
            $entForLabel = Entitlement::query()
                ->with([
                    'catalogProduct:id,name',
                    'user:id,name,lastname,email',
                ])
                ->find($entitlementId);
            if ($entForLabel !== null) {
                $product = trim((string) ($entForLabel->catalogProduct?->name ?? ''));
                $email = trim((string) ($entForLabel->user?->email ?? ''));
                $entitlementFilterLabel = trim($product.($product !== '' && $email !== '' ? ' · ' : '').$email);
            }
        }

        // Si ya filtramos por entitlement_id, no aplicar `q`: el texto del buscador es solo
        // informativo (viene del enlace desde Derechos de uso) y una frase larga no coincide
        // con name/lastname por separado en ILIKE.
        if ($q !== '' && ! $filterByEntitlementId) {
            $like = '%'.$q.'%';
            $secretsQuery->where(function ($outer) use ($like): void {
                $outer->whereHas('entitlement.user', function ($userQuery) use ($like): void {
                    $userQuery->where(function ($inner) use ($like): void {
                        $inner->where('name', 'ILIKE', $like)
                            ->orWhere('lastname', 'ILIKE', $like)
                            ->orWhere('email', 'ILIKE', $like)
                            ->orWhere('document_number', 'ILIKE', $like);
                    });
                })
                    ->orWhere('label', 'ILIKE', $like)
                    ->orWhere('public_ref', 'ILIKE', $like);
            });
        }

        $secretsQuery->whereDate('created_at', '>=', $dateFrom);
        $secretsQuery->whereDate('created_at', '<=', $dateTo);

        $allowedKinds = [
            EntitlementSecret::KIND_API_KEY,
            EntitlementSecret::KIND_HMAC_SECRET,
            EntitlementSecret::KIND_OAUTH_REFRESH,
            EntitlementSecret::KIND_CERTIFICATE,
            EntitlementSecret::KIND_CUSTOM,
        ];
        if ($kind !== '' && in_array($kind, $allowedKinds, true)) {
            $secretsQuery->where('kind', $kind);
        }

        $allowedEntitlementStatuses = [
            Entitlement::STATUS_PENDING,
            Entitlement::STATUS_ACTIVE,
            Entitlement::STATUS_EXPIRED,
            Entitlement::STATUS_SUSPENDED,
            Entitlement::STATUS_REVOKED,
        ];
        if ($entitlementStatus !== '' && in_array($entitlementStatus, $allowedEntitlementStatuses, true)) {
            $secretsQuery->whereHas('entitlement', function ($entQuery) use ($entitlementStatus): void {
                $entQuery->where('status', $entitlementStatus);
            });
        }

        $allowedSortBy = ['kind', 'label', 'expires_at', 'revoked_at', 'created_at'];
        if (! in_array($sortBy, $allowedSortBy, true)) {
            $sortBy = 'created_at';
            $sortDir = 'desc';
        }

        $secrets = $secretsQuery
            ->orderBy($sortBy, $sortDir)
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/acceso-credenciales/index', [
            'entitlementSecrets' => $secrets,
            'filters' => [
                'q' => $q,
                'entitlement_id' => ($entitlementId !== '' && Str::isUuid($entitlementId)) ? $entitlementId : '',
                'entitlement_filter_label' => $entitlementFilterLabel,
                'kind' => $kind,
                'entitlement_status' => $entitlementStatus,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    public function show(EntitlementSecret $entitlementSecret): JsonResponse
    {
        $entitlementSecret->load([
            'entitlement' => fn ($q) => $q->select('id', 'user_id', 'status', 'catalog_product_id', 'catalog_sku_id'),
            'entitlement.user:id,name,lastname,email',
            'entitlement.catalogProduct:id,name',
            'entitlement.catalogSku:id,code,name',
        ]);

        return response()->json([
            'secret' => $this->secretDetailPayload($entitlementSecret),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function secretDetailPayload(EntitlementSecret $secret): array
    {
        $ent = $secret->entitlement;

        return [
            'id' => $secret->id,
            'kind' => $secret->kind,
            'label' => $secret->label,
            'public_ref' => $secret->public_ref,
            'secret_value' => $secret->decryptPlainOrNull(),
            'metadata' => $secret->metadata,
            'expires_at' => $secret->expires_at?->toIso8601String(),
            'revoked_at' => $secret->revoked_at?->toIso8601String(),
            'rotated_at' => $secret->rotated_at?->toIso8601String(),
            'last_used_at' => $secret->last_used_at?->toIso8601String(),
            'created_at' => $secret->created_at?->toIso8601String(),
            'entitlement' => $ent !== null ? [
                'id' => $ent->id,
                'status' => $ent->status,
                'product_name' => $ent->catalogProduct?->name,
                'sku' => $ent->relationLoaded('catalogSku') ? $ent->catalogSku?->code : null,
                'sku_name' => $ent->relationLoaded('catalogSku') ? $ent->catalogSku?->name : null,
                'user' => $ent->relationLoaded('user') && $ent->user !== null ? [
                    'name' => $ent->user->name,
                    'lastname' => $ent->user->lastname,
                    'email' => $ent->user->email,
                ] : null,
            ] : null,
        ];
    }
}
