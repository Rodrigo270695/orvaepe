<?php

namespace App\Http\Requests\Catalog;

use App\Models\Coupon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CouponStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $code = trim((string) $this->input('code', ''));
        $startsAt = $this->input('starts_at');
        $expiresAt = $this->input('expires_at');
        $maxUses = $this->input('max_uses');

        $merge = [
            'code' => $code !== '' ? mb_strtoupper($code) : $code,
            'starts_at' => $startsAt === '' || $startsAt === null ? null : $startsAt,
            'expires_at' => $expiresAt === '' || $expiresAt === null ? null : $expiresAt,
            'max_uses' => $maxUses === '' || $maxUses === null ? null : $maxUses,
        ];

        if (filter_var($this->input('restrict_skus'), FILTER_VALIDATE_BOOLEAN)
            && !$this->has('applicable_sku_ids')) {
            $merge['applicable_sku_ids'] = [];
        }

        $this->merge($merge);
    }

    public function rules(): array
    {
        /** @var Coupon|string|null $coupon */
        $coupon = $this->route('coupon');
        $couponId = $coupon instanceof Coupon ? $coupon->id : null;

        return [
            'code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('coupons', 'code')->ignore($couponId),
            ],
            'discount_type' => [
                'required',
                'string',
                Rule::in([Coupon::DISCOUNT_PERCENT, Coupon::DISCOUNT_FIXED]),
            ],
            'discount_value' => [
                'required',
                'numeric',
                'min:0',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $type = $this->input('discount_type');
                    if ($type === Coupon::DISCOUNT_PERCENT && (float) $value > 100) {
                        $fail('El porcentaje no puede superar 100.');
                    }
                },
            ],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'restrict_skus' => ['nullable', 'boolean'],
            'applicable_sku_ids' => ['nullable', 'array'],
            'applicable_sku_ids.*' => ['uuid', 'exists:catalog_skus,id'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => [
                'nullable',
                'date',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $start = $this->input('starts_at');
                    if ($start === null || $start === '' || $value === null || $value === '') {
                        return;
                    }
                    if (strtotime((string) $value) < strtotime((string) $start)) {
                        $fail('La fecha de fin debe ser posterior o igual a la de inicio.');
                    }
                },
            ],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function couponPayload(): array
    {
        $data = $this->validated();
        unset($data['restrict_skus']);

        if (!$this->boolean('restrict_skus')) {
            $data['applicable_sku_ids'] = null;
        } else {
            $ids = $this->input('applicable_sku_ids', []);
            $data['applicable_sku_ids'] = is_array($ids)
                ? array_values(array_unique(array_filter($ids, fn ($id) => is_string($id) && $id !== '')))
                : [];
        }

        return $data;
    }
}
