<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\SoftwareReleaseAssetStoreRequest;
use App\Models\SoftwareRelease;
use App\Models\SoftwareReleaseAsset;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SoftwareReleaseAssetsController extends Controller
{
    public function index(SoftwareRelease $software_release): Response
    {
        $software_release->load([
            'product:id,name,slug',
        ]);

        $assets = $software_release->assets()
            ->orderBy('label')
            ->orderBy('created_at')
            ->get()
            ->map(fn (SoftwareReleaseAsset $a) => [
                'id' => $a->id,
                'label' => $a->label,
                'path' => $a->path,
                'sha256' => $a->sha256,
                'created_at' => $a->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/catalogo-releases/assets/index', [
            'release' => [
                'id' => $software_release->id,
                'version' => $software_release->version,
                'catalog_product_id' => $software_release->catalog_product_id,
                'product' => $software_release->product,
            ],
            'assets' => $assets,
        ]);
    }

    public function store(
        SoftwareReleaseAssetStoreRequest $request,
        SoftwareRelease $software_release,
    ): RedirectResponse {
        $software_release->assets()->create($request->validated());

        return redirect()
            ->route('panel.catalogo-releases.assets.index', $software_release)
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha añadido el archivo',
            ]);
    }

    public function update(
        SoftwareReleaseAssetStoreRequest $request,
        SoftwareRelease $software_release,
        SoftwareReleaseAsset $software_release_asset,
    ): RedirectResponse {
        $this->assertAssetBelongsToRelease($software_release, $software_release_asset);

        $software_release_asset->update($request->validated());

        return redirect()
            ->route('panel.catalogo-releases.assets.index', $software_release)
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha actualizado el archivo',
            ]);
    }

    public function destroy(
        SoftwareRelease $software_release,
        SoftwareReleaseAsset $software_release_asset,
    ): RedirectResponse {
        $this->assertAssetBelongsToRelease($software_release, $software_release_asset);

        $software_release_asset->delete();

        return redirect()
            ->route('panel.catalogo-releases.assets.index', $software_release)
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Se ha eliminado el archivo',
            ]);
    }

    private function assertAssetBelongsToRelease(
        SoftwareRelease $release,
        SoftwareReleaseAsset $asset,
    ): void {
        if ($asset->software_release_id !== $release->id) {
            abort(404);
        }
    }
}
