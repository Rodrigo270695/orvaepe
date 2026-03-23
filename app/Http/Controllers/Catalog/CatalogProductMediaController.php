<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CatalogMediaStoreRequest;
use App\Models\CatalogMedia;
use App\Models\CatalogProduct;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogProductMediaController extends Controller
{
    public function index(Request $request, CatalogProduct $catalog_product): Response
    {
        $catalog_product->load(['category:id,name,revenue_line']);

        $media = $catalog_product->media()
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CatalogMedia $m) => [
                'id' => $m->id,
                'kind' => $m->kind,
                'original_filename' => $m->original_filename,
                'mime_type' => $m->mime_type,
                'size_bytes' => $m->size_bytes,
                'sort_order' => $m->sort_order,
                // Ruta relativa al origen actual (evita roturas si APP_URL no coincide con el host).
                'url' => '/storage/'.ltrim(str_replace('\\', '/', $m->storage_path), '/'),
                'created_at' => $m->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/catalogo-productos/medios', [
            'product' => [
                'id' => $catalog_product->id,
                'name' => $catalog_product->name,
                'slug' => $catalog_product->slug,
                'tagline' => $catalog_product->tagline,
                'category' => $catalog_product->category,
            ],
            'media' => $media,
        ]);
    }

    public function store(
        CatalogMediaStoreRequest $request,
        CatalogProduct $catalog_product,
    ): RedirectResponse {
        $uploaded = $request->file('file');
        if (!$uploaded) {
            return redirect()
                ->back()
                ->withErrors(['file' => 'No se recibió ningún archivo.'])
                ->with('toast', AdminFlashToast::error('Error al subir'));
        }

        $mime = $uploaded->getMimeType() ?? '';
        $kind = $this->inferKind($mime);

        $path = $uploaded->store("catalog_media/{$catalog_product->id}", 'public');

        $nextOrder = (int) $catalog_product->media()->max('sort_order') + 1;

        CatalogMedia::create([
            'catalog_product_id' => $catalog_product->id,
            'kind' => $kind,
            'storage_path' => $path,
            'original_filename' => $uploaded->getClientOriginalName(),
            'mime_type' => $mime !== '' ? $mime : null,
            'size_bytes' => $uploaded->getSize() ?: null,
            'sort_order' => $nextOrder,
        ]);

        return redirect()
            ->route('panel.catalogo-productos.medios.index', $catalog_product)
            ->with('toast', AdminFlashToast::success('Archivo subido'));
    }

    public function destroy(
        CatalogProduct $catalog_product,
        CatalogMedia $catalog_media,
    ): RedirectResponse {
        if ($catalog_media->catalog_product_id !== $catalog_product->id) {
            abort(404);
        }

        $catalog_media->delete();

        return redirect()
            ->route('panel.catalogo-productos.medios.index', $catalog_product)
            ->with('toast', AdminFlashToast::success('Archivo eliminado'));
    }

    private function inferKind(string $mime): string
    {
        if (str_starts_with($mime, 'image/')) {
            return 'image';
        }
        if (str_starts_with($mime, 'video/')) {
            return 'video';
        }
        if ($mime === 'application/pdf' || str_ends_with(strtolower($mime), 'pdf')) {
            return 'pdf';
        }

        return 'other';
    }
}
