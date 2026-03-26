<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Entitlement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EntitlementsController extends Controller
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

            return redirect()->route('panel.acceso-entitlements.index', $params);
        }

        $query = Entitlement::query()
            ->with([
                'user:id,name,lastname,email,document_number',
                'catalogProduct:id,name',
                'catalogSku:id,code,name',
            ])
            ->withCount('secrets');

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->whereHas('user', function ($userQuery) use ($like): void {
                $userQuery->where(function ($inner) use ($like): void {
                    $inner->where('name', 'ILIKE', $like)
                        ->orWhere('lastname', 'ILIKE', $like)
                        ->orWhere('email', 'ILIKE', $like)
                        ->orWhere('document_number', 'ILIKE', $like);
                });
            });
        }

        $query->whereDate('created_at', '>=', $dateFrom);
        $query->whereDate('created_at', '<=', $dateTo);

        $allowedStatuses = [
            Entitlement::STATUS_PENDING,
            Entitlement::STATUS_ACTIVE,
            Entitlement::STATUS_EXPIRED,
            Entitlement::STATUS_SUSPENDED,
            Entitlement::STATUS_REVOKED,
        ];
        if ($status !== '' && in_array($status, $allowedStatuses, true)) {
            $query->where('status', $status);
        }

        $allowedSortBy = ['status', 'starts_at', 'ends_at', 'secrets_count', 'created_at'];
        if (! in_array($sortBy, $allowedSortBy, true)) {
            $sortBy = 'created_at';
            $sortDir = 'desc';
        }

        $entitlements = $query
            ->orderBy($sortBy, $sortDir)
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/acceso-entitlements/index', [
            'entitlements' => $entitlements,
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
}
