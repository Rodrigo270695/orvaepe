<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\SoftwareReleaseStoreRequest;
use App\Models\CatalogProduct;
use App\Models\SoftwareRelease;
use App\Services\Catalog\SoftwareArtifactStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SoftwareReleasesController extends Controller
{
    public function __construct(
        private readonly SoftwareArtifactStorage $artifactStorage,
    ) {}

    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $sortBy = (string) $request->query('sort_by', '');
        $sortDir = strtolower((string) $request->query('sort_dir', 'asc'));
        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'asc';
        }

        $catalogProductId = trim((string) $request->query('catalog_product_id', ''));

        $perPage = (int) $request->query('per_page', 10);
        $allowedPerPage = [10, 20, 30, 40, 50];
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        $releasesQuery = SoftwareRelease::query()
            ->with([
                'product:id,name,slug,category_id',
                'product.category:id,name,revenue_line',
            ]);

        if ($catalogProductId !== '') {
            $releasesQuery->where('catalog_product_id', $catalogProductId);
        }

        if ($q !== '') {
            $releasesQuery->where(function ($sub) use ($q) {
                $sub->where('version', 'ILIKE', "%{$q}%")
                    ->orWhere('changelog', 'ILIKE', "%{$q}%")
                    ->orWhere('artifact_path', 'ILIKE', "%{$q}%")
                    ->orWhere('min_php_version', 'ILIKE', "%{$q}%");
            });
        }

        $allowedSortBy = ['version', 'is_latest', 'released_at', 'min_php_version'];
        if (in_array($sortBy, $allowedSortBy, true)) {
            $releasesQuery
                ->orderBy($sortBy, $sortDir)
                ->orderBy('created_at');
        } else {
            $releasesQuery->orderByDesc('released_at')->orderByDesc('created_at');
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
        if ($catalogProductId !== '') {
            $append['catalog_product_id'] = $catalogProductId;
        }

        $releases = $releasesQuery
            ->paginate($perPage)
            ->appends($append);

        $productsForSelect = $this->softwareSystemProductsForSelect();

        return Inertia::render('admin/catalogo-releases/index', [
            'releases' => $releases,
            'productsForSelect' => $productsForSelect,
            'filters' => [
                'q' => $q,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'catalog_product_id' => $catalogProductId,
            ],
        ]);
    }

    public function store(SoftwareReleaseStoreRequest $request): RedirectResponse
    {
        $data = $request->releasePayload();

        if ($request->hasFile('artifact_file')) {
            $stored = $this->artifactStorage->storeReleaseMain(
                $request->file('artifact_file'),
                $data['catalog_product_id'],
            );
            $data['artifact_path'] = $stored['path'];
            $data['artifact_sha256'] = $stored['sha256'];
        }

        DB::transaction(function () use ($data) {
            if ($data['is_latest']) {
                $this->clearLatestForProduct($data['catalog_product_id'], null);
            }
            SoftwareRelease::create($data);
        });

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha registrado la versión',
            ]);
    }

    public function update(
        SoftwareReleaseStoreRequest $request,
        SoftwareRelease $software_release,
    ): RedirectResponse {
        $data = $request->releasePayload();

        if ($request->hasFile('artifact_file')) {
            $this->artifactStorage->deleteIfManaged($software_release->artifact_path);
            $stored = $this->artifactStorage->storeReleaseMain(
                $request->file('artifact_file'),
                $data['catalog_product_id'],
            );
            $data['artifact_path'] = $stored['path'];
            $data['artifact_sha256'] = $stored['sha256'];
        }

        DB::transaction(function () use ($data, $software_release) {
            if ($data['is_latest']) {
                $this->clearLatestForProduct(
                    $data['catalog_product_id'],
                    $software_release->id,
                );
            }
            $software_release->update($data);
        });

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha actualizado la versión',
            ]);
    }

    public function destroy(SoftwareRelease $software_release): RedirectResponse
    {
        foreach ($software_release->assets as $asset) {
            $this->artifactStorage->deleteIfManaged($asset->path);
        }
        $this->artifactStorage->deleteIfManaged($software_release->artifact_path);
        $software_release->delete();

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha eliminado la versión',
            ]);
    }

    /**
     * @return Collection<int, array{id: string, name: string, slug: string}>
     */
    private function softwareSystemProductsForSelect()
    {
        return CatalogProduct::query()
            ->whereHas('category', function ($q) {
                $q->where('revenue_line', 'software_system');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (CatalogProduct $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
            ]);
    }

    private function clearLatestForProduct(string $catalogProductId, ?string $exceptReleaseId): void
    {
        SoftwareRelease::query()
            ->where('catalog_product_id', $catalogProductId)
            ->when($exceptReleaseId, fn ($q) => $q->where('id', '!=', $exceptReleaseId))
            ->update(['is_latest' => false]);
    }
}
