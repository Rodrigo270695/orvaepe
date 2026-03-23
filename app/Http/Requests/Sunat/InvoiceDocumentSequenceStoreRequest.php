<?php

namespace App\Http\Requests\Sunat;

use App\Models\CompanyLegalProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InvoiceDocumentSequenceStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $profile = CompanyLegalProfile::query()->first();

        return [
            'document_type_code' => [
                'required',
                'string',
                'max:4',
                Rule::unique('invoice_document_sequences', 'document_type_code')->where(
                    function ($query) use ($profile) {
                        if (!$profile) {
                            return $query->whereRaw('1 = 0');
                        }

                        return $query
                            ->where('company_legal_profile_id', $profile->id)
                            ->where('serie', $this->input('serie'))
                            ->where('establishment_code', $this->input('establishment_code'));
                    },
                ),
            ],
            'serie' => ['required', 'string', 'max:10'],
            'establishment_code' => ['required', 'string', 'max:10'],
            'next_correlative' => ['required', 'integer', 'min:1'],
            'correlative_from' => ['nullable', 'integer', 'min:1'],
            'correlative_to' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
