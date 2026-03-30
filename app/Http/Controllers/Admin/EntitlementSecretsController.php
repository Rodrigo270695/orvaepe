<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EntitlementSecretStoreRequest;
use App\Models\Entitlement;
use App\Models\EntitlementSecret;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Inertia\Inertia;
use Inertia\Response;

class EntitlementSecretsController extends Controller
{
    public function create(Request $request): Response
    {
        $preselected = trim((string) $request->query('entitlement_id', ''));

        $entitlementsQuery = Entitlement::query()
            ->with([
                'user:id,name,lastname,email',
                'catalogProduct:id,name',
                'catalogSku:id,code,name',
            ])
            ->orderByDesc('created_at')
            ->limit(400);

        $entitlements = $entitlementsQuery->get();

        if ($preselected !== '' && strlen($preselected) === 36
            && ! $entitlements->pluck('id')->contains($preselected)) {
            $extra = Entitlement::query()
                ->whereKey($preselected)
                ->with([
                    'user:id,name,lastname,email',
                    'catalogProduct:id,name',
                    'catalogSku:id,code,name',
                ])
                ->first();
            if ($extra !== null) {
                $entitlements->prepend($extra);
            }
        }

        $entitlementOptions = $entitlements->map(static function (Entitlement $e): array {
            $email = $e->user?->email ?? '—';
            $product = $e->catalogProduct?->name ?? 'Producto';
            $sku = $e->catalogSku?->code ?? '';

            return [
                'value' => $e->id,
                'label' => $sku !== ''
                    ? "{$email} · {$product} ({$sku})"
                    : "{$email} · {$product}",
                'searchTerms' => array_filter([
                    $email,
                    $e->user?->name,
                    $e->user?->lastname,
                    $product,
                    $sku,
                    $e->catalogSku?->name,
                ]),
            ];
        })->values()->all();

        return Inertia::render('admin/acceso-credenciales/create', [
            'entitlementOptions' => $entitlementOptions,
            'selectedEntitlementId' => $preselected !== '' && strlen($preselected) === 36
                ? $preselected
                : null,
            'kindOptions' => [
                ['value' => EntitlementSecret::KIND_API_KEY, 'label' => 'API key'],
                ['value' => EntitlementSecret::KIND_HMAC_SECRET, 'label' => 'HMAC secret'],
                ['value' => EntitlementSecret::KIND_OAUTH_REFRESH, 'label' => 'OAuth refresh'],
                ['value' => EntitlementSecret::KIND_CERTIFICATE, 'label' => 'Certificado'],
                ['value' => EntitlementSecret::KIND_CUSTOM, 'label' => 'Personalizado (URL, usuario, token, …)'],
            ],
        ]);
    }

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

        return redirect()
            ->route('panel.acceso-credenciales.index', [
                'date_from' => now()->startOfMonth()->format('Y-m-d'),
                'date_to' => now()->endOfMonth()->format('Y-m-d'),
            ])
            ->with('toast', AdminFlashToast::success('Credencial registrada correctamente.'));
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $q = trim((string) $request->query('q', ''));
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

        if ($q !== '') {
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
                'kind' => $kind,
                'entitlement_status' => $entitlementStatus,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }
}
