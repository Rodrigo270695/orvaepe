<?php

namespace App\Http\Requests\Sunat;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SunatEmitterSettingsUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $def = $this->input('default_certificate_id');
        if ($def === '_none_' || $def === '') {
            $this->merge(['default_certificate_id' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'emission_mode'          => ['required', Rule::in(['sunat_direct', 'ose', 'pse'])],
            'environment'            => ['required', Rule::in(['beta', 'production'])],

            // Credenciales SUNAT directa
            'sol_username'           => ['nullable', 'string', 'max:100'],
            'sol_password'           => ['nullable', 'string', 'max:255'],

            // Credenciales OSE / PSE
            'ose_provider_code'      => ['nullable', 'string', 'max:100'],
            'api_base_url'           => ['nullable', 'string', 'url'],

            'default_certificate_id' => ['nullable', 'uuid', 'exists:digital_certificates,id'],
            'is_active'              => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'api_base_url.url' => 'La URL base debe ser una URL válida (https://…).',
        ];
    }
}
