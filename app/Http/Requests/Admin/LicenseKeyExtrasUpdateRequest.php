<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LicenseKeyExtrasUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'metadata_pairs' => $this->normalizePairs('metadata_pairs'),
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function normalizePairs(string $field): array
    {
        $pairs = $this->input($field, []);
        if (! is_array($pairs)) {
            return [];
        }

        $filtered = [];
        foreach ($pairs as $pair) {
            if (! is_array($pair)) {
                continue;
            }

            $code = trim((string) ($pair['code'] ?? ''));
            if ($code === '') {
                continue;
            }

            $kind = ($pair['value_kind'] ?? 'text') === 'list' ? 'list' : 'text';
            $values = $pair['values'] ?? [];
            if (! is_array($values)) {
                $values = [];
            }

            $filtered[] = [
                'code' => $code,
                'value_kind' => $kind,
                'value' => (string) ($pair['value'] ?? ''),
                'values' => $values,
            ];
        }

        return $filtered;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'metadata_pairs' => ['nullable', 'array'],
            'metadata_pairs.*.code' => ['required', 'string', 'max:200'],
            'metadata_pairs.*.value_kind' => ['required', 'string', Rule::in(['text', 'list'])],
            'metadata_pairs.*.value' => ['nullable', 'string', 'max:10000'],
            'metadata_pairs.*.values' => ['nullable', 'array'],
            'metadata_pairs.*.values.*' => ['nullable', 'string', 'max:2000'],

            'mark_as_activated' => ['nullable', 'boolean'],
            'activation_domain' => ['nullable', 'string', 'max:255', 'required_if_accepted:mark_as_activated'],
            'activation_ip' => ['nullable', 'string', 'max:45', 'required_if_accepted:mark_as_activated'],
            'activation_fingerprint' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function metadataObject(): array
    {
        return $this->normalizeMetadataKeysToSpanish(
            $this->pairsToObject($this->validated('metadata_pairs') ?? []),
        );
    }

    /**
     * Estandariza aliases/keys en inglés hacia claves canónicas en español.
     *
     * @param array<string, array<int, string>|string> $metadata
     * @return array<string, array<int, string>|string>
     */
    private function normalizeMetadataKeysToSpanish(array $metadata): array
    {
        $out = [];

        foreach ($metadata as $code => $value) {
            $k = strtolower(trim((string) $code));
            $canonical = match ($k) {
                'created_via' => 'creado_via',
                'order_line_id' => 'linea_pedido_id',
                'line_slot' => 'nro_unidad',
                'awaiting_provider_key' => 'pendiente_clave_proveedor',
                'sku_code' => 'codigo_sku',
                'sku_name' => 'nombre_sku',
                'fulfilled_at' => 'completado_en',
                'activation_notes' => 'notas_activacion',
                'evidence_image_url',
                'evidencia_activacion_imagen',
                'imagen_activacion',
                'imagen_evidencia',
                'captura_activacion',
                'screenshot_activacion',
                'img',
                'imagen',
                'image',
                'foto',
                'captura',
                'evidencia',
                'evidence' => 'evidencia_activacion_imagen',
                default => $k,
            };

            $out[$canonical] = $value;
        }

        return $out;
    }

    /**
     * @param list<array<string, mixed>> $pairs
     * @return array<string, array<int, string>|string>
     */
    private function pairsToObject(array $pairs): array
    {
        $out = [];

        foreach ($pairs as $pair) {
            $code = (string) ($pair['code'] ?? '');
            if ($code === '') {
                continue;
            }

            if (($pair['value_kind'] ?? 'text') === 'list') {
                $items = [];
                foreach ($pair['values'] ?? [] as $v) {
                    $t = trim((string) $v);
                    if ($t !== '') {
                        $items[] = $t;
                    }
                }
                $out[$code] = $items;
            } else {
                $out[$code] = (string) ($pair['value'] ?? '');
            }
        }

        return $out;
    }
}
