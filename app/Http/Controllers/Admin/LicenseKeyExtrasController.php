<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LicenseKeyExtrasUpdateRequest;
use App\Models\LicenseActivation;
use App\Models\LicenseKey;
use App\Support\AdminFlashToast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class LicenseKeyExtrasController extends Controller
{
    public function index(LicenseKey $license_key): Response
    {
        $license_key->loadMissing([
            'user:id,name,lastname,email',
            'catalogSku:id,code,name,catalog_product_id',
            'catalogSku.product:id,name',
            'order:id,order_number',
            'activations:id,license_key_id,domain,ip_address,server_fingerprint,last_ping_at,is_active,created_at',
        ]);

        return Inertia::render('admin/acceso-licencias/extras', [
            'license' => [
                'id' => $license_key->id,
                'key' => $license_key->key,
                'status' => $license_key->status,
                'max_activations' => $license_key->max_activations,
                'activation_count' => $license_key->activation_count,
                'expires_at' => optional($license_key->expires_at)?->toDateString(),
                'user' => $license_key->user,
                'catalog_sku' => $license_key->catalogSku,
                'order' => $license_key->order,
            ],
            'metadataPairs' => $this->objectToPairs(is_array($license_key->metadata) ? $license_key->metadata : []),
            'latestActivation' => $license_key->activations
                ->sortByDesc('created_at')
                ->map(static fn (LicenseActivation $row): array => [
                    'domain' => $row->domain,
                    'ip_address' => $row->ip_address,
                    'server_fingerprint' => $row->server_fingerprint,
                    'last_ping_at' => $row->last_ping_at?->toIso8601String(),
                    'is_active' => (bool) $row->is_active,
                ])->first(),
        ]);
    }

    public function update(LicenseKeyExtrasUpdateRequest $request, LicenseKey $license_key): RedirectResponse
    {
        $metadata = $request->metadataObject();
        $hasEvidenceImage = $this->hasEvidenceImage($metadata);

        $license_key->metadata = $metadata === [] ? null : $metadata;

        $markActivated = $request->boolean('mark_as_activated');
        if ($markActivated) {
            $domain = trim((string) $request->input('activation_domain', ''));
            $ip = trim((string) $request->input('activation_ip', ''));
            $fingerprint = trim((string) $request->input('activation_fingerprint', ''));

            $activation = LicenseActivation::query()
                ->where('license_key_id', $license_key->id)
                ->where('domain', $domain)
                ->where('ip_address', $ip)
                ->first();

            if ($activation === null) {
                LicenseActivation::query()->create([
                    'license_key_id' => $license_key->id,
                    'domain' => $domain,
                    'ip_address' => $ip,
                    'server_fingerprint' => $fingerprint !== '' ? $fingerprint : null,
                    'last_ping_at' => now(),
                    'is_active' => true,
                ]);
            } else {
                $activation->forceFill([
                    'is_active' => true,
                    'last_ping_at' => now(),
                    'server_fingerprint' => $fingerprint !== '' ? $fingerprint : $activation->server_fingerprint,
                ])->save();
            }

            $activeCount = LicenseActivation::query()
                ->where('license_key_id', $license_key->id)
                ->where('is_active', true)
                ->count();

            $license_key->activation_count = $activeCount;
            if (in_array($license_key->status, [LicenseKey::STATUS_DRAFT, LicenseKey::STATUS_PENDING], true)) {
                $license_key->status = LicenseKey::STATUS_ACTIVE;
            }
        } elseif ($hasEvidenceImage && in_array($license_key->status, [LicenseKey::STATUS_DRAFT, LicenseKey::STATUS_PENDING], true)) {
            $license_key->status = LicenseKey::STATUS_ACTIVE;
        }

        $license_key->save();

        return redirect()
            ->route('panel.acceso-licencias.extras.index', $license_key)
            ->with('toast', AdminFlashToast::success('Metadatos de licencia guardados.'));
    }

    public function storeEvidenceImage(Request $request, LicenseKey $license_key): JsonResponse
    {
        $file = $request->file('file');
        if (! $file instanceof UploadedFile) {
            $filesRaw = $request->file('files');
            if ($filesRaw === null) {
                $filesRaw = $request->file('files[]');
            }
            if ($filesRaw instanceof UploadedFile) {
                $file = $filesRaw;
            } elseif (is_array($filesRaw)) {
                $first = $filesRaw[0] ?? null;
                if ($first instanceof UploadedFile) {
                    $file = $first;
                }
            }
        }

        if (! $file instanceof UploadedFile) {
            return response()->json(['message' => 'No se recibió archivo.'], 422);
        }

        $mime = $file->getMimeType() ?? '';
        if (! str_starts_with($mime, 'image/')) {
            return response()->json(['message' => 'Solo se permiten imágenes.'], 422);
        }

        $maxBytes = 10 * 1024 * 1024;
        if (($file->getSize() ?: 0) > $maxBytes) {
            return response()->json(['message' => 'La imagen excede 10MB.'], 422);
        }

        $path = $file->store("license_keys/{$license_key->id}/evidence", 'public');
        $url = '/storage/'.ltrim(str_replace('\\', '/', $path), '/');

        return response()->json(['url' => $url]);
    }

    /**
     * @param array<string, mixed> $data
     * @return list<array<string, mixed>>
     */
    private function objectToPairs(array $data): array
    {
        $pairs = [];
        foreach ($data as $code => $value) {
            if (! is_string($code)) {
                continue;
            }

            if (is_array($value)) {
                $pairs[] = [
                    'code' => $code,
                    'label' => $this->humanLabel($code),
                    'value_kind' => 'list',
                    'value' => '',
                    'values' => array_map(static fn ($v) => (string) $v, $value),
                ];
                continue;
            }

            $pairs[] = [
                'code' => $code,
                'label' => $this->humanLabel($code),
                'value_kind' => 'text',
                'value' => $value === null ? '' : (string) $value,
                'values' => [''],
            ];
        }

        return $pairs;
    }

    private function humanLabel(string $code): string
    {
        $map = [
            'created_via' => 'Creado vía',
            'order_line_id' => 'ID de línea de pedido',
            'line_slot' => 'Nro. de unidad',
            'awaiting_provider_key' => 'Pendiente de clave del proveedor',
            'sku_code' => 'Código SKU',
            'sku_name' => 'Nombre SKU',
            'fulfilled_at' => 'Completado en',
            'evidencia_activacion_imagen' => 'Evidencia de activación (imagen)',
            'evidence_image_url' => 'Evidencia de activación (imagen)',
            'activation_notes' => 'Notas de activación',
        ];

        if (isset($map[$code])) {
            return $map[$code];
        }

        return ucfirst(str_replace('_', ' ', $code));
    }

    /**
     * @param array<string, array<int, string>|string> $metadata
     */
    private function hasEvidenceImage(array $metadata): bool
    {
        $keys = ['evidencia_activacion_imagen', 'evidence_image_url'];
        foreach ($keys as $key) {
            $value = $metadata[$key] ?? null;
            if (is_string($value) && trim($value) !== '') {
                return true;
            }
        }

        return false;
    }
}
