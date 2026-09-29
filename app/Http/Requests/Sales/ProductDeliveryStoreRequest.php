<?php

namespace App\Http\Requests\Sales;

use App\Models\ProductDelivery;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ProductDeliveryStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $ruc = $this->input('ruc');
        if (is_string($ruc)) {
            $this->merge([
                'ruc' => preg_replace('/\D/', '', $ruc) ?? '',
            ]);
        }

        $legalName = $this->input('legal_name');
        if (is_string($legalName)) {
            $this->merge(['legal_name' => trim($legalName)]);
        }

        $description = $this->input('product_description');
        if (is_string($description)) {
            $this->merge(['product_description' => trim($description)]);
        }

        $igv = $this->input('includes_igv');
        if (is_string($igv)) {
            $this->merge([
                'includes_igv' => in_array(strtolower($igv), ['1', 'true', 'on', 'si', 'yes'], true),
            ]);
        }

        $amount = $this->input('sale_amount');
        if (is_string($amount)) {
            $amount = str_replace(' ', '', trim($amount));
            if (str_contains($amount, ',') && str_contains($amount, '.')) {
                $amount = str_replace('.', '', $amount);
                $amount = str_replace(',', '.', $amount);
            } elseif (str_contains($amount, ',')) {
                $amount = str_replace(',', '.', $amount);
            }
            $this->merge(['sale_amount' => $amount]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'ruc' => ['required', 'string', 'regex:/^\d{11}$/'],
            'legal_name' => ['required', 'string', 'max:255'],
            'product_description' => ['required', 'string', 'max:2000'],
            'includes_igv' => ['required', 'boolean'],
            'sale_amount' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'delivered_at' => ['required', 'date'],
            'plan_period' => ['required', 'string', Rule::in(ProductDelivery::periods())],
            'plan_ends_at' => ['required', 'date', 'after_or_equal:delivered_at'],
            'invoice_file' => ['nullable', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,webp'],
            'xml_file' => ['nullable', 'file', 'max:20480'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $xml = $this->file('xml_file');
            if (! $xml instanceof UploadedFile) {
                return;
            }

            $ext = strtolower($xml->getClientOriginalExtension());
            if (! in_array($ext, ['xml', 'zip', 'rar'], true)) {
                $validator->errors()->add('xml_file', 'Sube un archivo .xml, .zip o .rar.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ruc.required' => 'Indica el RUC.',
            'ruc.regex' => 'El RUC debe tener 11 dígitos.',
            'legal_name.required' => 'Indica la razón social.',
            'product_description.required' => 'Describe el producto o servicio.',
            'includes_igv.required' => 'Indica si el monto incluye IGV.',
            'sale_amount.required' => 'Indica el monto de la venta.',
            'sale_amount.numeric' => 'El monto debe ser un número.',
            'sale_amount.min' => 'El monto no puede ser negativo.',
            'delivered_at.required' => 'Indica la fecha de entrega.',
            'plan_period.required' => 'Indica si el plan es mensual, anual, de 2 años o de 3 años.',
            'plan_period.in' => 'El periodo del plan no es válido.',
            'plan_ends_at.required' => 'Indica la fecha de finalización del plan.',
            'plan_ends_at.after_or_equal' => 'La finalización del plan no puede ser anterior a la entrega.',
            'invoice_file.mimes' => 'La factura debe ser PDF o imagen (JPG, PNG, WEBP).',
            'invoice_file.max' => 'La factura no puede superar 10 MB.',
            'xml_file.max' => 'El archivo no puede superar 20 MB.',
        ];
    }
}
