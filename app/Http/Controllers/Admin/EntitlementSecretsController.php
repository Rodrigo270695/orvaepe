<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Entitlement;
use App\Models\EntitlementSecret;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EntitlementSecretsController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $q = trim((string) $request->query('q', ''));
        $kind = trim((string) $request->query('kind', ''));
        $entitlementStatus = trim((string) $request->query('entitlement_status', ''));

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

        $secrets = $secretsQuery
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
            ],
        ]);
    }
}
