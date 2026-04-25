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
            'cc_emails' => ['nullable', 'array', 'max:10'],
            'cc_emails.*' => ['required', 'string', 'email:rfc', 'max:255', 'different:email'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('email');
        if (is_string($email)) {
            $this->merge(['email' => strtolower(trim($email))]);
        }

        $cc = $this->input('cc_emails');
        if (is_array($cc)) {
            $normalized = [];
            foreach ($cc as $item) {
                if (! is_string($item)) {
                    continue;
                }
                $t = strtolower(trim($item));
                if ($t === '') {
                    continue;
                }
                $normalized[] = $t;
            }
            $normalized = array_values(array_unique($normalized));
            $this->merge(['cc_emails' => $normalized]);
        }
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Indica un correo de destino.',
            'email.email' => 'El correo no es válido.',
            'cc_emails.array' => 'Las copias (CC) deben enviarse como lista.',
            'cc_emails.max' => 'Solo puedes agregar hasta 10 correos en copia.',
            'cc_emails.*.email' => 'Uno de los correos en copia no es válido.',
            'cc_emails.*.different' => 'El correo en copia no puede ser igual al destinatario.',
        ];
    }
}
