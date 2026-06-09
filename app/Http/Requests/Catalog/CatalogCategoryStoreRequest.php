<?php

namespace App\Http\Requests\Catalog;

use App\Models\CatalogCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CatalogCategoryStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Convertimos valores "vacíos" del form a `null` para que `nullable|uuid|integer`
     * funcione bien cuando viene una string vacía desde selects/inputs.
     */
    protected function prepareForValidation(): void
    {
        $parentId = $this->input('parent_id');

        $parentIdNormalized = $parentId;
        if ($parentIdNormalized === '' || $parentIdNormalized === '_none_') {
            $parentIdNormalized = null;
        }

        $this->merge([
            'parent_id' => $parentIdNormalized,
        ]);
    }

    public function rules(): array
    {
        $revenueLine = $this->input('revenue_line');

        /** @var CatalogCategory|string|null $category */
        $category = $this->route('catalog_category');
        $categoryId = $category instanceof CatalogCategory ? $category->id : $category;

        $slugUniqueForRevenueLine = Rule::unique('catalog_categories', 'slug')
            ->where(fn ($q) => $q->where('revenue_line', $revenueLine));

        // En modo edición: ignora el registro actual (para permitir cambiar otros campos).
        if ($categoryId) {
            $slugUniqueForRevenueLine = $slugUniqueForRevenueLine->ignore($categoryId, 'id');
        }

        return [
            'parent_id' => ['nullable', 'uuid', 'exists:catalog_categories,id'],
            'slug' => [
                'required',
                'string',
                'max:200',
                $slugUniqueForRevenueLine,
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'revenue_line' => [
                'required',
                'string',
                'max:80',
                Rule::in(['software_system', 'oem_license', 'service']),
            ],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}

