<?php

namespace App\Http\Requests\Admin;

use App\Models\EntitlementSecret;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EntitlementSecretStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $expires = $this->input('expires_at');
        $this->merge([
            'entitlement_id' => is_string($this->input('entitlement_id'))
                ? trim($this->input('entitlement_id'))
                : $this->input('entitlement_id'),
            'expires_at' => (is_string($expires) && trim($expires) === '') ? null : $expires,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'entitlement_id' => ['required', 'uuid', 'exists:entitlements,id'],
            'kind' => ['required', 'string', Rule::in([
                EntitlementSecret::KIND_API_KEY,
                EntitlementSecret::KIND_HMAC_SECRET,
                EntitlementSecret::KIND_OAUTH_REFRESH,
                EntitlementSecret::KIND_CERTIFICATE,
                EntitlementSecret::KIND_CUSTOM,
            ])],
            'label' => ['nullable', 'string', 'max:255'],
            'public_ref' => ['nullable', 'string', 'max:255'],
            'secret_value' => ['required', 'string', 'min:1', 'max:65535'],
            'expires_at' => ['nullable', 'date'],
        ];
    }
}
