<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class StorePayPalCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.plan_id' => ['required', 'uuid'],
            'lines.*.qty' => ['required', 'integer', 'min:1'],
            'coupon_code' => ['nullable', 'string', 'max:120'],
        ];
    }
}
