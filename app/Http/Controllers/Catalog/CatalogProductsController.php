<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CatalogProductStoreRequest;
use App\Models\CatalogCategory;
use App\Models\CatalogProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogProductsController extends Controller
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

        $productsQuery = CatalogProduct::query()
            ->with(['category:id,name,revenue_line']);

        if ($q !== '') {
            $productsQuery->where(function ($sub) use ($q) {
                $sub->where('name', 'ILIKE', "%{$q}%")
                    ->orWhere('slug', 'ILIKE', "%{$q}%")
                    ->orWhere('tagline', 'ILIKE', "%{$q}%")
                    ->orWhereHas('category', function ($categoryQuery) use ($q) {
                        $categoryQuery->where('name', 'ILIKE', "%{$q}%")
                            ->orWhere('revenue_line', 'ILIKE', "%{$q}%");
                    });
            });
        }

        $allowedSortBy = ['is_active', 'name', 'slug', 'created_at'];
        if (in_array($sortBy, $allowedSortBy, true)) {
            $productsQuery->orderBy($sortBy, $sortDir)->orderBy('created_at');
        } else {
            $productsQuery->orderBy('created_at', 'desc');
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

        $products = $productsQuery
            ->paginate($perPage)
            ->appends($append);

        $categoriesForSelect = CatalogCategory::query()
            ->select(['id', 'name', 'revenue_line', 'is_active'])
            ->where('is_active', true)
            ->orderBy('revenue_line')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/catalogo-productos/index', [
            'products' => $products,
            'categoriesForSelect' => $categoriesForSelect,
            'filters' => [
                'q' => $q,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    public function store(CatalogProductStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        CatalogProduct::create($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha registrado el producto',
            ]);
    }

    public function update(
        CatalogProductStoreRequest $request,
        CatalogProduct $catalog_product,
    ): RedirectResponse {
        $data = $request->validated();
        $catalog_product->update($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha actualizado el producto',
            ]);
    }

    public function destroy(CatalogProduct $catalog_product): RedirectResponse
    {
        $catalog_product->delete();

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha eliminado el producto',
            ]);
    }
}

