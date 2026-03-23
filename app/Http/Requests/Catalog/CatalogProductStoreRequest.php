<?php

namespace App\Http\Requests\Catalog;

use App\Models\CatalogProduct;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CatalogProductStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $categoryId = $this->input('category_id');
        if ($categoryId === '' || $categoryId === '_none_') {
            $categoryId = null;
        }

        $this->merge([
            'category_id' => $categoryId,
        ]);
    }

    public function rules(): array
    {
        /** @var CatalogProduct|string|null $product */
        $product = $this->route('catalog_product');
        $productId = $product instanceof CatalogProduct ? $product->id : $product;

        $slugUnique = Rule::unique('catalog_products', 'slug');
        if ($productId) {
            $slugUnique = $slugUnique->ignore($productId, 'id');
        }

        return [
            'category_id' => ['nullable', 'uuid', 'exists:catalog_categories,id'],
            'slug' => ['required', 'string', 'max:200', $slugUnique],
            'name' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}

