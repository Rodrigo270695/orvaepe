<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CatalogSkuStoreRequest;
use App\Models\CatalogProduct;
use App\Models\CatalogSku;
use App\Services\Catalog\CatalogSkusExcelExport;
use App\Support\AdminFlashToast;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CatalogSkusController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $categoryId = trim((string) $request->query('category_id', ''));
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

        $skusQuery = $this->baseSkusQuery($request);

        $allowedSortBy = ['is_active', 'code', 'name', 'list_price', 'sale_model', 'sort_order'];
        if (in_array($sortBy, $allowedSortBy, true)) {
            $skusQuery->orderBy($sortBy, $sortDir)->orderBy('created_at');
        } else {
            $skusQuery->orderBy('sort_order')->orderBy('created_at', 'desc');
            $sortBy = '';
        }

        $append = ['per_page' => $perPage];
        if ($q !== '') {
            $append['q'] = $q;
        }
        if ($categoryId !== '') {
            $append['category_id'] = $categoryId;
        }
        if ($sortBy !== '') {
            $append['sort_by'] = $sortBy;
            $append['sort_dir'] = $sortDir;
        }

        $skus = $skusQuery->paginate($perPage)->appends($append);
        $currentSkuProductIds = $skus->getCollection()
            ->pluck('catalog_product_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $productsForSelect = CatalogProduct::query()
            ->with('category:id,name,revenue_line')
            ->select(['id', 'name', 'slug', 'category_id', 'is_active'])
            ->where(function ($query) use ($currentSkuProductIds) {
                $query->where('is_active', true);

                if ($currentSkuProductIds !== []) {
                    $query->orWhereIn('id', $currentSkuProductIds);
                }
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/catalogo-skus/index', [
            'skus' => $skus,
            'productsForSelect' => $productsForSelect,
            'filters' => [
                'q' => $q,
                'category_id' => $categoryId,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    /**
     * Exporta a Excel los SKUs con los mismos filtros y orden que el listado (sin paginar).
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $skusQuery = $this->baseSkusQuery($request);

        $sortBy = (string) $request->query('sort_by', '');
        $sortDir = strtolower((string) $request->query('sort_dir', 'asc'));
        if (!in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'asc';
        }

        $allowedSortBy = ['is_active', 'code', 'name', 'list_price', 'sale_model', 'sort_order'];
        if (in_array($sortBy, $allowedSortBy, true)) {
            $skusQuery->orderBy($sortBy, $sortDir)->orderBy('created_at');
        } else {
            $skusQuery->orderBy('sort_order')->orderBy('created_at', 'desc');
        }

        $skus = $skusQuery->get();
        $spreadsheet = CatalogSkusExcelExport::buildSpreadsheet($skus);

        $filename = 'catalogo-skus-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Consulta base: búsqueda `q` y filtro por categoría (sin orden ni paginación).
     *
     * @return Builder<CatalogSku>
     */
    protected function baseSkusQuery(Request $request): Builder
    {
        $q = trim((string) $request->query('q', ''));
        $categoryId = trim((string) $request->query('category_id', ''));

        $skusQuery = CatalogSku::query()
            ->with(['product:id,name,slug,category_id', 'product.category:id,name,revenue_line']);

        if ($q !== '') {
            $skusQuery->where(function ($sub) use ($q) {
                $sub->where('code', 'ILIKE', "%{$q}%")
                    ->orWhere('name', 'ILIKE', "%{$q}%")
                    ->orWhere('sale_model', 'ILIKE', "%{$q}%")
                    ->orWhere('fulfillment_type', 'ILIKE', "%{$q}%")
                    ->orWhereHas('product', function ($productQuery) use ($q) {
                        $productQuery->where('name', 'ILIKE', "%{$q}%")
                            ->orWhere('slug', 'ILIKE', "%{$q}%");
                    });
            });
        }

        if ($categoryId !== '') {
            $skusQuery->whereHas('product', function ($productQuery) use ($categoryId) {
                $productQuery->where('category_id', $categoryId);
            });
        }

        return $skusQuery;
    }

    public function store(CatalogSkuStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if (!isset($data['sort_order']) || $data['sort_order'] === null) {
            $data['sort_order'] = 0;
        }
        $data['limits'] = null;
        $data['metadata'] = null;
        CatalogSku::create($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha registrado el SKU',
            ]);
    }

    public function update(
        CatalogSkuStoreRequest $request,
        CatalogSku $catalog_sku,
    ): RedirectResponse {
        $data = $request->validated();
        if (!isset($data['sort_order']) || $data['sort_order'] === null) {
            $data['sort_order'] = 0;
        }
        $catalog_sku->update($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha actualizado el SKU',
            ]);
    }

    public function destroy(CatalogSku $catalog_sku): RedirectResponse
    {
        $blockers = [];
        if ($catalog_sku->orderLines()->exists()) {
            $blockers[] = 'líneas de pedido';
        }
        if ($catalog_sku->subscriptionItems()->exists()) {
            $blockers[] = 'suscripciones';
        }
        if ($catalog_sku->entitlements()->exists()) {
            $blockers[] = 'derechos de uso (entitlements)';
        }
        if ($catalog_sku->licenseKeys()->exists()) {
            $blockers[] = 'licencias emitidas';
        }

        if ($blockers !== []) {
            $detail = 'Este SKU está vinculado a: '.implode(', ', $blockers).'.';

            return redirect()
                ->to(url()->previous())
                ->with(
                    'toast',
                    AdminFlashToast::error(
                        'No se puede eliminar el SKU',
                        $detail.' Desactívalo o revisa esos registros antes de borrarlo.',
                    ),
                );
        }

        try {
            $catalog_sku->delete();
        } catch (QueryException $e) {
            $sqlState = $e->errorInfo[0] ?? '';
            $driverCode = (int) ($e->errorInfo[1] ?? 0);
            $isFk =
                in_array($sqlState, ['23001', '23503', '23000'], true)
                || $driverCode === 1451;

            if ($isFk) {
                return redirect()
                    ->to(url()->previous())
                    ->with(
                        'toast',
                        AdminFlashToast::error(
                            'No se puede eliminar el SKU',
                            'Sigue referenciado por otros datos (pedidos, facturación, etc.).',
                        ),
                    );
            }

            throw $e;
        }

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha eliminado el SKU',
            ]);
    }
}

