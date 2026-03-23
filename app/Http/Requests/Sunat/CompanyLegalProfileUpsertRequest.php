<?php

namespace App\Http\Requests\Sunat;

use App\Models\CompanyLegalProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompanyLegalProfileUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var CompanyLegalProfile|null $profile */
        $profile = $this->route('company_legal_profile');

        // Modo singleton: si no llega el parámetro por ruta, usamos
        // el primer registro existente para ignorar unicidad al actualizar.
        if (!$profile) {
            $profile = CompanyLegalProfile::query()->first();
        }

        $profileId = $profile?->id;

        $slugUnique = Rule::unique('company_legal_profiles', 'slug');
        if ($profileId) {
            $slugUnique = $slugUnique->ignore($profileId);
        }

        $rucUnique = Rule::unique('company_legal_profiles', 'ruc');
        if ($profileId) {
            $rucUnique = $rucUnique->ignore($profileId);
        }

        return [
            'slug' => [
                'required',
                'string',
                'max:100',
                $slugUnique,
            ],
            'legal_name' => ['required', 'string', 'max:255'],
            'trade_name' => ['nullable', 'string', 'max:255'],
            'ruc' => [
                'required',
                'string',
                'size:11',
                $rucUnique,
            ],
            'tax_regime' => ['nullable', 'string', 'max:100'],
            'address_line' => ['nullable', 'string'],

            'district' => ['nullable', 'string', 'max:150'],
            'province' => ['nullable', 'string', 'max:150'],
            'department' => ['nullable', 'string', 'max:150'],
            'ubigeo' => ['nullable', 'string', 'size:6'],

            'country' => ['nullable', 'string', 'size:2'],
            'phone' => ['nullable', 'string', 'max:20'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],

            'is_default_issuer' => ['nullable', 'boolean'],
        ];
    }
}

