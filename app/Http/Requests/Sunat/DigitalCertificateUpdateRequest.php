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
            'label'                => ['sometimes', 'required', 'string', 'max:255'],
            'certificate_file'     => ['nullable', 'file', 'max:512'],
            'certificate_password' => ['nullable', 'string', 'max:255'],
            'is_active'            => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'certificate_file.file' => 'Debes subir un archivo válido.',
            'certificate_file.max'  => 'El certificado no debe superar 512 KB.',
        ];
    }
}
