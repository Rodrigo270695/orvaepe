<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CouponStoreRequest;
use App\Models\CatalogSku;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponsController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $sortBy = (string) $request->query('sort_by', '');
        $sortDir = strtolower((string) $request->query('sort_dir', 'asc'));
        if (!in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'asc';
        }

        $perPage = (int) $request->query('per_page', 10);
        $allowedPerPage = [10, 20, 30, 40, 50];
        if (!in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        $couponsQuery = Coupon::query();

        if ($q !== '') {
            $couponsQuery->where(function ($sub) use ($q) {
                $sub->where('code', 'ILIKE', "%{$q}%")
                    ->orWhere('discount_type', 'ILIKE', "%{$q}%");
            });
        }

        $allowedSortBy = ['code', 'is_active', 'discount_type', 'discount_value', 'expires_at', 'used_count', 'max_uses'];
        if (in_array($sortBy, $allowedSortBy, true)) {
            $couponsQuery
                ->orderBy($sortBy, $sortDir)
                ->orderBy('created_at');
        } else {
            $couponsQuery->orderByDesc('created_at');
            $sortBy = '';
        }

        $append = ['per_page' => $perPage];
        if ($q !== '') {
            $append['q'] = $q;
        }
        if ($sortBy !== '') {
            $append['sort_by'] = $sortBy;
            $append['sort_dir'] = $sortDir;
        }

        $coupons = $couponsQuery
            ->paginate($perPage)
            ->appends($append);

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
            ]);

        return Inertia::render('admin/catalogo-cupones/index', [
            'coupons' => $coupons,
            'skusForSelect' => $skusForSelect,
            'filters' => [
                'q' => $q,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    public function store(CouponStoreRequest $request): RedirectResponse
    {
        $data = $request->couponPayload();
        $data['used_count'] = 0;

        Coupon::create($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha creado el cupón',
            ]);
    }

    public function update(
        CouponStoreRequest $request,
        Coupon $coupon,
    ): RedirectResponse {
        $data = $request->couponPayload();
        unset($data['used_count']);

        $coupon->update($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha actualizado el cupón',
            ]);
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha eliminado el cupón',
            ]);
    }
}
