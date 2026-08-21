<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClientUserUpdateRequest extends FormRequest
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
        /** @var User $client */
        $client = $this->route('user');
        $client->loadMissing('profile');

        return [
            'name' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class, 'email')->ignore($client->id),
            ],
            'username' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9_.-]+$/',
                Rule::unique(User::class, 'username')->ignore($client->id),
            ],
            'document_number' => [
                'nullable',
                'string',
                'regex:/^[0-9]{8}$|^[0-9]{11}$/',
                Rule::unique(User::class, 'document_number')->ignore($client->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'ruc' => [
                'nullable',
                'string',
                'size:11',
                'regex:/^[0-9]{11}$/',
                Rule::unique(UserProfile::class, 'ruc')->ignore($client->profile?->id),
            ],
            'billing_email' => ['nullable', 'string', 'email', 'max:255'],
            'city' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'lastname' => 'apellidos',
            'email' => 'correo',
            'username' => 'usuario',
            'document_number' => 'documento',
            'phone' => 'teléfono',
            'company_name' => 'nombre comercial',
            'legal_name' => 'razón social',
            'ruc' => 'RUC',
            'billing_email' => 'correo de facturación',
            'city' => 'ciudad',
            'address' => 'dirección',
        ];
    }

    protected function prepareForValidation(): void
    {
        $nullable = [
            'document_number',
            'phone',
            'company_name',
            'legal_name',
            'ruc',
            'billing_email',
            'city',
            'address',
        ];

        $merged = [];
        foreach ($nullable as $field) {
            if (! $this->exists($field)) {
                continue;
            }
            $value = $this->input($field);
            $merged[$field] = is_string($value) && trim($value) === ''
                ? null
                : (is_string($value) ? trim($value) : $value);
        }

        if ($merged !== []) {
            $this->merge($merged);
        }
    }
}
