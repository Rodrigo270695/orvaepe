<?php

namespace App\Http\Requests\Marketing;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $allowed = array_column(config('contact.product_interest_options'), 'value');

        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'company' => ['nullable', 'string', 'max:160'],
            'product_interest' => ['required', 'string', Rule::in($allowed)],
            'message' => ['required', 'string', 'max:8000'],
            'website' => ['nullable', 'string', 'max:0'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'email' => 'correo',
            'phone' => 'teléfono',
            'company' => 'empresa',
            'product_interest' => 'producto o servicio',
            'message' => 'mensaje',
        ];
    }
}
