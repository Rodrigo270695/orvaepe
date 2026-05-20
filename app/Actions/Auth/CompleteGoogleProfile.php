<?php

namespace App\Actions\Auth;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Validator;

class CompleteGoogleProfile
{
    /**
     * @param  array<string, mixed>  $input
     */
    public function complete(User $user, array $input): User
    {
        Validator::make(
            $input,
            [
                'document_number' => [
                    'required',
                    'string',
                    'max:20',
                    'regex:/^[0-9]{8}$|^[0-9]{11}$/',
                ],
                'phone' => ['nullable', 'string', 'size:9', 'regex:/^9[0-9]{8}$/'],
                'accept_privacy' => ['required', 'accepted'],
            ],
            [
                'accept_privacy.required' => 'Debes aceptar la política de privacidad.',
                'accept_privacy.accepted' => 'Debes aceptar la política de privacidad.',
            ],
            [
                'accept_privacy' => 'política de privacidad',
            ],
        )->validate();

        $user->forceFill([
            'document_number' => $input['document_number'],
            'phone' => $input['phone'] ?? null,
        ])->save();

        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'user_id' => $user->id,
                'phone' => $user->phone,
                'billing_email' => $user->email,
                'country' => 'PE',
            ],
        );

        if (! $user->hasAnyRole(['client', 'superadmin'])) {
            $user->assignRole('client');
        }

        return $user->fresh();
    }
}
