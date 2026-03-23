<?php

namespace App\Http\Requests\Sunat;

use Illuminate\Foundation\Http\FormRequest;

class DigitalCertificateUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['sometimes', 'required', 'string', 'max:255'],
            'storage_disk' => ['sometimes', 'required', 'string', 'max:50'],
            'storage_path' => ['sometimes', 'required', 'string'],
            'certificate_thumbprint' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'issuer_cn' => ['nullable', 'string', 'max:255'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
