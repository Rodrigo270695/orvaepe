<?php

namespace App\Http\Requests\Catalog;

use App\Models\CatalogSku;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CatalogSkuStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $billingInterval = $this->input('billing_interval');
        if ($billingInterval === '' || $billingInterval === '_none_') {
            $billingInterval = null;
        }

        $rentalDays = $this->input('rental_days');
        if ($rentalDays === '') {
            $rentalDays = null;
        }

        $merge = [
            'billing_interval' => $billingInterval,
            'rental_days' => $rentalDays,
        ];
        if (! $this->has('igv_applies')) {
            $merge['igv_applies'] = true;
        }

        $this->merge($merge);
    }

    public function rules(): array
    {
        /** @var CatalogSku|string|null $sku */
        $sku = $this->route('catalog_sku');
        $skuId = $sku instanceof CatalogSku ? $sku->id : $sku;

        $codeUnique = Rule::unique('catalog_skus', 'code');
        if ($skuId) {
            $codeUnique = $codeUnique->ignore($skuId, 'id');
        }

        $saleModelAllowed = [
            'source_perpetual',
            'source_rental',
            'saas_subscription',
            'oem_license_one_time',
            'oem_license_subscription',
            'service_project',
            'service_subscription',
        ];

        $billingAllowed = ['one_time', 'monthly', 'annual', 'custom'];
        $fulfillmentAllowed = [
            'download',
            'manual_provision',
            'saas_url',
            'external_vendor',
        ];

        return [
            'catalog_product_id' => ['required', 'uuid', 'exists:catalog_products,id'],
            'code' => ['required', 'string', 'max:120', $codeUnique],
            'name' => ['required', 'string', 'max:255'],
            'sale_model' => ['required', 'string', Rule::in($saleModelAllowed)],
            'billing_interval' => ['nullable', 'string', Rule::in($billingAllowed)],
            'rental_days' => ['nullable', 'integer', 'min:1', 'max:3650'],
            'list_price' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'tax_included' => ['nullable', 'boolean'],
            'igv_applies' => ['nullable', 'boolean'],
            'fulfillment_type' => ['required', 'string', Rule::in($fulfillmentAllowed)],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}

