<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $email = (string) ($input['email'] ?? '');
        $username = isset($input['username']) && is_string($input['username']) && $input['username'] !== ''
            ? $input['username']
            : Str::lower(Str::before($email, '@'));

        $data = $input + ['username' => $username];

        Validator::make($data, [
            'name' => $this->nameRules(),
            'lastname' => ['required', 'string', 'max:255'],
            'email' => $this->emailRules(null),
            'password' => $this->passwordRules(),
            'document_number' => [
                'required',
                'string',
                'max:20',
                'regex:/^[0-9]{8}$|^[0-9]{11}$/',
            ],
            'phone' => ['nullable', 'string', 'size:9', 'regex:/^9[0-9]{8}$/'],
            'username' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9_.-]+$/',
                Rule::unique(User::class, 'username'),
            ],
        ])->validate();

        $user = User::create([
            'username' => $username,
            'name' => $input['name'],
            'lastname' => $input['lastname'],
            'email' => $input['email'],
            'password' => $input['password'],
            'document_number' => $input['document_number'],
            'phone' => $input['phone'] ?? null,
        ]);

        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'user_id' => $user->id,
                'phone' => $user->phone,
                'billing_email' => $user->email,
                'country' => 'PE',
            ],
        );

        $user->assignRole('client');

        return $user;
    }
}
