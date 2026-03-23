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
            'emission_mode' => ['required', Rule::in(['sunat_direct', 'ose', 'pse'])],
            'ose_provider_code' => ['nullable', 'string', 'max:100'],
            'api_base_url' => ['nullable', 'string'],
            'sunat_username_hint' => ['nullable', 'string', 'max:32'],
            'credentials_secret_ref' => ['nullable', 'string', 'max:255'],
            'default_certificate_id' => ['nullable', 'uuid', 'exists:digital_certificates,id'],
            'environment' => ['required', Rule::in(['beta', 'production'])],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
