<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class LookupSunatRucRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $raw = $this->input('ruc');
        if (! is_string($raw)) {
            return;
        }
        $digits = preg_replace('/\D/', '', $raw);
        $this->merge(['ruc' => $digits]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'ruc' => ['required', 'string', 'regex:/^\d{11}$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ruc.required' => 'Indica el RUC a consultar.',
            'ruc.regex' => 'El RUC debe tener exactamente 11 dígitos.',
        ];
    }
}
