<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LicenseActivation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LicenseActivationsController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $q = trim((string) $request->query('q', ''));
        $active = trim((string) $request->query('active', ''));

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

            return redirect()->route('panel.acceso-activaciones.index', $params);
        }

        $query = LicenseActivation::query()
            ->with([
                'licenseKey' => fn ($rel) => $rel->select('id', 'key', 'user_id', 'status'),
                'licenseKey.user:id,name,lastname,email',
            ]);

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($outer) use ($like): void {
                $outer->where('domain', 'ILIKE', $like)
                    ->orWhere('ip_address', 'ILIKE', $like)
                    ->orWhereHas('licenseKey', function ($keyQuery) use ($like): void {
                        $keyQuery->where('key', 'ILIKE', $like);
                    });
            });
        }

        $query->whereDate('created_at', '>=', $dateFrom);
        $query->whereDate('created_at', '<=', $dateTo);

        if ($active === '1') {
            $query->where('is_active', true);
        } elseif ($active === '0') {
            $query->where('is_active', false);
        }

        $activations = $query
            ->orderByDesc('last_ping_at')
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/acceso-activaciones/index', [
            'licenseActivations' => $activations,
            'filters' => [
                'q' => $q,
                'active' => $active,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
