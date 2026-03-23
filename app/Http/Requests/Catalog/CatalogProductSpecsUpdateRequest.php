<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CatalogProductSpecsUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $pairs = $this->input('pairs', []);
        if (!is_array($pairs)) {
            $this->merge(['pairs' => []]);

            return;
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

        $this->merge(['pairs' => $filtered]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'pairs' => ['nullable', 'array'],
            'pairs.*.code' => ['required', 'string', 'max:200'],
            'pairs.*.value_kind' => ['required', 'string', Rule::in(['text', 'list'])],
            'pairs.*.value' => ['nullable', 'string', 'max:10000'],
            'pairs.*.values' => ['nullable', 'array'],
            'pairs.*.values.*' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Objeto specs: cada clave apunta a string o a lista de strings.
     *
     * @return array<string, array<int, string>|string>
     */
    public function specsObject(): array
    {
        $pairs = $this->validated('pairs') ?? [];
        $specs = [];

        foreach ($pairs as $pair) {
            $code = $pair['code'];
            if (($pair['value_kind'] ?? 'text') === 'list') {
                $items = [];
                foreach ($pair['values'] ?? [] as $v) {
                    $t = trim((string) $v);
                    if ($t !== '') {
                        $items[] = $t;
                    }
                }
                $specs[$code] = $items;
            } else {
                $specs[$code] = (string) ($pair['value'] ?? '');
            }
        }

        return $specs;
    }
}
