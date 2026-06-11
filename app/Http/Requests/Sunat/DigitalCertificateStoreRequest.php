<?php

namespace App\Http\Requests\Sunat;

use Illuminate\Foundation\Http\FormRequest;

class DigitalCertificateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label'                  => ['required', 'string', 'max:255'],
            'certificate_file'       => ['required', 'file', 'max:512'],
            'certificate_password'   => ['nullable', 'string', 'max:255'],
            'is_active'              => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'certificate_file.required' => 'Selecciona el archivo .p12 del certificado.',
            'certificate_file.file'     => 'Debes subir un archivo válido.',
            'certificate_file.max'      => 'El certificado no debe superar 512 KB.',
        ];
    }
}
