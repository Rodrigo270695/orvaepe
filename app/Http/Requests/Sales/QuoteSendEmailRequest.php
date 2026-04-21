<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class QuoteSendEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Indica un correo de destino.',
            'email.email' => 'El correo no es válido.',
        ];
    }
}
