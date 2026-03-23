<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CatalogCategoryStoreRequest;
use App\Models\CatalogCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogCategoriesController extends Controller
{
    public function index(Request $request): Response
    {
        $q = (string) $request->query('q', '');
        $q = trim($q);
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

        $categoriesQuery = CatalogCategory::query()
            ->with(['parent:id,name,revenue_line']);

        if ($q !== '') {
            $categoriesQuery->where(function ($sub) use ($q) {
                $sub->where('name', 'ILIKE', "%{$q}%")
                    ->orWhere('slug', 'ILIKE', "%{$q}%")
                    ->orWhere('revenue_line', 'ILIKE', "%{$q}%");
            });
        }

        $allowedSortBy = ['is_active', 'name', 'slug', 'revenue_line', 'sort_order'];
        if (in_array($sortBy, $allowedSortBy, true)) {
            $categoriesQuery
                ->orderBy($sortBy, $sortDir)
                ->orderBy('created_at');
        } else {
            $categoriesQuery
                ->orderBy('revenue_line')
                ->orderBy('sort_order')
                ->orderBy('created_at');
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

        $categories = $categoriesQuery
            ->paginate($perPage)
            ->appends($append);

        // Para el modal (dropdown de “parent”).
        $categoriesForSelect = CatalogCategory::query()
            ->select(['id', 'name', 'revenue_line', 'slug', 'sort_order'])
            ->orderBy('revenue_line')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('admin/catalogo-categorias/index', [
            'categories' => $categories,
            'categoriesForSelect' => $categoriesForSelect,
            'filters' => [
                'q' => $q,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    public function store(CatalogCategoryStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (!isset($data['sort_order']) || $data['sort_order'] === null) {
            $data['sort_order'] = 0;
        }

        CatalogCategory::create($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha registrado la categoría',
            ]);
    }

    public function update(
        CatalogCategoryStoreRequest $request,
        CatalogCategory $catalog_category,
    ): RedirectResponse {
        $data = $request->validated();

        if (!isset($data['sort_order']) || $data['sort_order'] === null) {
            $data['sort_order'] = 0;
        }

        $catalog_category->update($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha actualizado la categoría',
            ]);
    }

    public function destroy(CatalogCategory $catalog_category): RedirectResponse
    {
        $catalog_category->delete();

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha eliminado la categoría',
            ]);
    }
}

