<?php

namespace App\Http\Requests\Sunat;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceDocumentSequenceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_type_code' => ['sometimes', 'required', 'string', 'max:4'],
            'serie' => ['sometimes', 'required', 'string', 'max:10'],
            'establishment_code' => ['sometimes', 'required', 'string', 'max:10'],
            'next_correlative' => ['sometimes', 'required', 'integer', 'min:1'],
            'correlative_from' => ['nullable', 'integer', 'min:1'],
            'correlative_to' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
