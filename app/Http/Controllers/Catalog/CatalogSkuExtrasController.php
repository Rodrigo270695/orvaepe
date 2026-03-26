<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CatalogSkuExtrasUpdateRequest;
use App\Models\CatalogSku;
use App\Support\AdminFlashToast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class CatalogSkuExtrasController extends Controller
{
    public function index(CatalogSku $catalog_sku): Response
    {
        $catalog_sku->load(['product:id,name,slug,category_id', 'product.category:id,name,revenue_line']);

        $revenueLine = $catalog_sku->product?->category?->revenue_line;

        /**
         * Plantilla para panel “Límites y metadata” (OEM/Servicios).
         *
         * En marketing, `MarketingOemLicensesPresenter` espera estas claves en `catalog_skus.metadata`:
         * - sku_line
         * - list_number
         * - detail
         * - icon_key
         * - image_url
         *
         * `limits` hoy no se usa en el storefront, pero lo dejamos precargado para que el panel tenga
         * una estructura consistente y fácil de editar.
         */
        $templateSkuLine = $revenueLine === 'service' ? 'service' : 'oem';

        $templateLimits = [
            'usuarios' => 10,
            'modulos' => [],
        ];

        $limits = $catalog_sku->limits;
        $metadata = $catalog_sku->metadata;

        $mergedLimits = is_array($limits) && $limits !== []
            ? array_replace($templateLimits, $limits)
            : $templateLimits;

        $metadataPairs = $this->metadataPairsFromTemplateAndExisting(
            is_array($metadata) ? $metadata : [],
            $templateSkuLine,
        );

        return Inertia::render('admin/catalogo-skus/extras', [
            'sku' => [
                'id' => $catalog_sku->id,
                'code' => $catalog_sku->code,
                'name' => $catalog_sku->name,
                'product' => $catalog_sku->product,
            ],
            'limitsPairs' => $this->objectToPairs($mergedLimits),
            'metadataPairs' => $metadataPairs,
        ]);
    }

    public function update(
        CatalogSkuExtrasUpdateRequest $request,
        CatalogSku $catalog_sku,
    ): RedirectResponse {
        $limits = $request->limitsObject();
        $metadata = $request->metadataObject();

        $catalog_sku->update([
            'limits' => $limits === [] ? null : $limits,
            'metadata' => $metadata === [] ? null : $metadata,
        ]);

        return redirect()
            ->route('panel.catalogo-skus.extras.index', $catalog_sku)
            ->with('toast', AdminFlashToast::success('Límites y metadata guardados'));
    }

    /**
     * Sube imágenes para usarlas en metadata del SKU (ej: imagen_item).
     * Responde con `urls` para setear directamente el valor en la fila.
     */
    public function storeManyForExtrasImages(
        Request $request,
        CatalogSku $catalog_sku,
    ): JsonResponse {
        $filesRaw = $request->file('files');
        if ($filesRaw === null) {
            $filesRaw = $request->file('files[]');
        }

        if ($filesRaw instanceof UploadedFile) {
            $files = [$filesRaw];
        } elseif (is_array($filesRaw)) {
            $files = $filesRaw;
        } else {
            $files = [];
        }

        if ($files === []) {
            return response()->json(['message' => 'No se recibieron archivos.'], 422);
        }

        $urls = [];

        foreach ($files as $uploaded) {
            if (! $uploaded) {
                continue;
            }

            $mime = $uploaded->getMimeType() ?? '';
            if (! str_starts_with($mime, 'image/')) {
                return response()->json(
                    ['message' => 'Solo se permiten imágenes (image/*).'],
                    422,
                );
            }

            $maxBytes = 51200 * 1024;
            $size = $uploaded->getSize() ?: 0;
            if ($size > $maxBytes) {
                return response()->json(
                    ['message' => 'El archivo excede el tamaño máximo (50MB).'],
                    422,
                );
            }

            $path = $uploaded->store("catalog_skus/{$catalog_sku->id}/extras", 'public');
            $urls[] = '/storage/' . ltrim(str_replace('\\', '/', $path), '/');
        }

        if ($urls === []) {
            return response()->json(['message' => 'No se subieron imágenes.'], 422);
        }

        return response()->json(['urls' => $urls]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<array<string, mixed>>
     */
    private function objectToPairs(array $data): array
    {
        $pairs = [];

        foreach ($data as $code => $value) {
            if (!is_string($code)) {
                continue;
            }

            if (is_array($value)) {
                $items = [];
                foreach ($value as $v) {
                    if (is_scalar($v) || $v === null) {
                        $items[] = $v === null ? '' : (string) $v;
                    } else {
                        $items[] = json_encode($v, JSON_UNESCAPED_UNICODE);
                    }
                }
                $pairs[] = [
                    'code' => $code,
                    'value_kind' => 'list',
                    'value' => '',
                    'values' => $items !== [] ? $items : [''],
                ];

                continue;
            }

            $pairs[] = [
                'code' => $code,
                'value_kind' => 'text',
                'value' => $value === null
                    ? ''
                    : (is_scalar($value) ? (string) $value : json_encode($value)),
                'values' => [''],
            ];
        }

        return $pairs;
    }

    /**
     * @param  array<string, mixed>  $existing
     * @return list<array<string, mixed>>
     */
    private function metadataPairsFromTemplateAndExisting(array $existing, string $templateSkuLine): array
    {
        $existingPairs = [];
        $existingOrder = [];

        foreach ($existing as $code => $value) {
            if (!is_string($code)) {
                continue;
            }
            $existingPairs[$code] = $this->singlePairFromValue($code, $value);
            $existingOrder[] = $code;
        }

        $template = [
            ['code' => 'linea_sku', 'value_kind' => 'text', 'default' => $templateSkuLine, 'aliases' => ['linea_sku', 'sku_line']],
            ['code' => 'numero_lista', 'value_kind' => 'text', 'default' => '', 'aliases' => ['numero_lista', 'list_number']],
            ['code' => 'detalle', 'value_kind' => 'text', 'default' => '', 'aliases' => ['detalle', 'detail']],
            ['code' => 'clave_icono', 'value_kind' => 'text', 'default' => 'generic', 'aliases' => ['clave_icono', 'icon_key']],
            ['code' => 'imagen_item', 'value_kind' => 'text', 'default' => '', 'aliases' => ['imagen_item', 'imagen_url', 'image_item', 'image_url']],
        ];

        $pairs = [];
        $used = [];

        foreach ($template as $item) {
            $selected = null;
            foreach ($item['aliases'] as $alias) {
                if (isset($existingPairs[$alias])) {
                    $selected = $existingPairs[$alias];
                    $used[] = $alias;
                    break;
                }
            }

            if ($selected !== null) {
                $pairs[] = [
                    'code' => $item['code'],
                    'value_kind' => $selected['value_kind'],
                    'value' => $selected['value'],
                    'values' => $selected['values'],
                ];
            } else {
                $pairs[] = [
                    'code' => $item['code'],
                    'value_kind' => $item['value_kind'],
                    'value' => (string) $item['default'],
                    'values' => [''],
                ];
            }
        }

        foreach ($existingOrder as $code) {
            if (!in_array($code, $used, true)) {
                $pairs[] = $existingPairs[$code];
            }
        }

        return $pairs;
    }

    /**
     * @return array<string, mixed>
     */
    private function singlePairFromValue(string $code, mixed $value): array
    {
        if (is_array($value)) {
            $items = [];
            foreach ($value as $v) {
                if (is_scalar($v) || $v === null) {
                    $items[] = $v === null ? '' : (string) $v;
                } else {
                    $items[] = json_encode($v, JSON_UNESCAPED_UNICODE);
                }
            }

            return [
                'code' => $code,
                'value_kind' => 'list',
                'value' => '',
                'values' => $items !== [] ? $items : [''],
            ];
        }

        return [
            'code' => $code,
            'value_kind' => 'text',
            'value' => $value === null
                ? ''
                : (is_scalar($value) ? (string) $value : json_encode($value)),
            'values' => [''],
        ];
    }
}
