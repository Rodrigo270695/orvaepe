<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CatalogSkuExtrasUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'limits_pairs' => $this->normalizePairs('limits_pairs'),
            'metadata_pairs' => $this->normalizePairs('metadata_pairs'),
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function normalizePairs(string $field): array
    {
        $pairs = $this->input($field, []);
        if (!is_array($pairs)) {
            return [];
        }

        $filtered = [];
        foreach ($pairs as $pair) {
            if (!is_array($pair)) {
                continue;
            }

            $code = trim((string) ($pair['code'] ?? ''));
            if ($code === '') {
                continue;
            }

            $kind = ($pair['value_kind'] ?? 'text') === 'list' ? 'list' : 'text';
            $values = $pair['values'] ?? [];
            if (!is_array($values)) {
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
            'limits_pairs' => ['nullable', 'array'],
            'limits_pairs.*.code' => ['required', 'string', 'max:200'],
            'limits_pairs.*.value_kind' => ['required', 'string', Rule::in(['text', 'list'])],
            'limits_pairs.*.value' => ['nullable', 'string', 'max:10000'],
            'limits_pairs.*.values' => ['nullable', 'array'],
            'limits_pairs.*.values.*' => ['nullable', 'string', 'max:2000'],

            'metadata_pairs' => ['nullable', 'array'],
            'metadata_pairs.*.code' => ['required', 'string', 'max:200'],
            'metadata_pairs.*.value_kind' => ['required', 'string', Rule::in(['text', 'list'])],
            'metadata_pairs.*.value' => ['nullable', 'string', 'max:10000'],
            'metadata_pairs.*.values' => ['nullable', 'array'],
            'metadata_pairs.*.values.*' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function limitsObject(): array
    {
        return $this->pairsToObject($this->validated('limits_pairs') ?? []);
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function metadataObject(): array
    {
        $meta = $this->pairsToObject($this->validated('metadata_pairs') ?? []);

        return $this->coerceSingleImageMetadata($meta);
    }

    /**
     * `imagen_item` (y aliases) debe persistirse como un solo string URL para la vista /licencias.
     *
     * @param  array<string, array<int, string>|string>  $meta
     * @return array<string, array<int, string>|string>
     */
    private function coerceSingleImageMetadata(array $meta): array
    {
        $imageKeys = ['imagen_item', 'imagen_url', 'image_item', 'image_url'];

        foreach ($imageKeys as $key) {
            if (!array_key_exists($key, $meta)) {
                continue;
            }
            $v = $meta[$key];
            if (!is_array($v)) {
                continue;
            }
            $first = '';
            foreach ($v as $item) {
                $t = trim((string) $item);
                if ($t !== '') {
                    $first = $t;
                    break;
                }
            }
            $meta[$key] = $first;
        }

        return $meta;
    }

    /**
     * @param  list<array<string, mixed>>  $pairs
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
