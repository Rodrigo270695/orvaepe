<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class CatalogSkuExtrasUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'limits' => $this->decodeJsonField('limits_json'),
            'metadata' => $this->decodeJsonField('metadata_json'),
        ]);
    }

    private function decodeJsonField(string $field): ?array
    {
        $raw = trim((string) $this->input($field, ''));
        if ($raw === '') {
            return null;
        }

        $decoded = json_decode($raw, true);

        return is_array($decoded) ? $decoded : ['_raw' => $raw];
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'limits_json' => ['nullable', 'string', 'max:50000'],
            'metadata_json' => ['nullable', 'string', 'max:50000'],
            'limits' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
