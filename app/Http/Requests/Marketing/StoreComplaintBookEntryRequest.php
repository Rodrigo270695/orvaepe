<?php

namespace App\Http\Requests\Marketing;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreComplaintBookEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:160'],
            'document_type' => ['required', 'string', Rule::in(['dni', 'ce', 'pasaporte', 'ruc', 'otro'])],
            'document_number' => ['required', 'string', 'max:32'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['required', 'string', 'max:2000'],
            'is_minor' => ['sometimes', 'boolean'],
            'representative_full_name' => ['nullable', 'string', 'max:160', Rule::requiredIf(fn () => $this->boolean('is_minor'))],
            'product_service_description' => ['required', 'string', 'max:512'],
            'claim_detail' => ['required', 'string', 'max:12000'],
            'request_detail' => ['required', 'string', 'max:8000'],
            'declares_truthful' => ['accepted'],
            'website' => ['nullable', 'string', 'max:0'],
        ];
    }

    public function attributes(): array
    {
        return [
            'full_name' => 'nombre completo',
            'document_type' => 'tipo de documento',
            'document_number' => 'número de documento',
            'email' => 'correo',
            'phone' => 'teléfono',
            'address' => 'domicilio',
            'is_minor' => 'menor de edad',
            'representative_full_name' => 'nombre del padre, madre o tutor',
            'product_service_description' => 'producto o servicio',
            'claim_detail' => 'detalle del reclamo',
            'request_detail' => 'pedido concreto',
            'declares_truthful' => 'declaración de veracidad',
        ];
    }
}
