<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        $rules = [
            'name' => $this->nameRules(),
            'lastname' => ['required', 'string', 'max:255'],
            'email' => $this->emailRules($userId),
            'document_number' => ['required', 'string', 'max:20', 'regex:/^[0-9]{8}$|^[0-9]{11}$/'],
            'phone' => ['nullable', 'string', 'size:9', 'regex:/^9[0-9]{8}$/'],
        ];

        if ($userId !== null) {
            $rules['username'] = ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z0-9_.-]+$/', Rule::unique(User::class)->ignore($userId)];
        }

        return $rules;
    }

    protected function usernameRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'max:255',
            'regex:/^[a-zA-Z0-9_.-]+$/',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }
}
