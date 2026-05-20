<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\CompleteGoogleProfile;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProfile;
use App\Support\AuthRedirect;
use App\Support\GoogleOAuth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse|HttpResponse|View
    {
        if (! GoogleOAuth::isConfigured()) {
            return $this->oauthError($request, 'El inicio de sesión con Google no está configurado.');
        }

        if ($request->boolean('popup')) {
            $request->session()->put('google_oauth_popup', true);
        }

        try {
            return Socialite::driver('google')->redirect();
        } catch (\Throwable $e) {
            report($e);

            return $this->oauthError(
                $request,
                'No se pudo iniciar la conexión con Google. Revisa la configuración del servidor.',
            );
        }
    }

    public function callback(Request $request): RedirectResponse|HttpResponse|View
    {
        if (! GoogleOAuth::isConfigured()) {
            return $this->oauthError($request, 'El inicio de sesión con Google no está configurado.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            report($e);

            return $this->oauthError(
                $request,
                'No se pudo completar el inicio de sesión con Google. Intenta de nuevo.',
            );
        }

        $googleId = (string) $googleUser->getId();
        $email = Str::lower((string) $googleUser->getEmail());

        if ($email === '') {
            return $this->oauthError($request, 'Google no proporcionó un correo electrónico válido.');
        }

        $user = User::query()->where('google_id', $googleId)->first();

        if ($user) {
            return $this->loginAndRedirect($request, $user);
        }

        $existingByEmail = User::query()->where('email', $email)->first();

        if ($existingByEmail) {
            if (filled($existingByEmail->google_id)) {
                return $this->loginAndRedirect($request, $existingByEmail);
            }

            if (filled($existingByEmail->password)) {
                return $this->oauthError(
                    $request,
                    'Ya existe una cuenta con este correo. Inicia sesión con tu usuario y contraseña.',
                );
            }

            $existingByEmail->forceFill([
                'google_id' => $googleId,
                'avatar' => $googleUser->getAvatar() ?? $existingByEmail->avatar,
                'email_verified_at' => $existingByEmail->email_verified_at ?? now(),
            ])->save();

            return $this->loginAndRedirect($request, $existingByEmail);
        }

        [$name, $lastname] = $this->splitName((string) ($googleUser->getName() ?: $googleUser->getNickname() ?: 'Usuario'));
        $username = $this->uniqueUsername(Str::before($email, '@'));

        $user = User::create([
            'google_id' => $googleId,
            'username' => $username,
            'name' => $name,
            'lastname' => $lastname,
            'email' => $email,
            'password' => null,
            'avatar' => $googleUser->getAvatar(),
            'email_verified_at' => now(),
        ]);

        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'user_id' => $user->id,
                'billing_email' => $user->email,
                'country' => 'PE',
            ],
        );

        $user->assignRole('client');

        return $this->loginAndRedirect($request, $user);
    }

    public function showComplete(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user->needsProfileCompletion()) {
            return redirect()->intended(AuthRedirect::homeFor($user));
        }

        return Inertia::render('auth/google-complete', [
            'user' => [
                'name' => $user->name,
                'lastname' => $user->lastname,
                'email' => $user->email,
            ],
        ]);
    }

    public function storeComplete(Request $request, CompleteGoogleProfile $completeGoogleProfile): RedirectResponse
    {
        $user = $request->user();

        if (! $user->needsProfileCompletion()) {
            return redirect()->intended(AuthRedirect::homeFor($user));
        }

        $completeGoogleProfile->complete($user, $request->all());

        return redirect()->intended(AuthRedirect::homeFor($user->fresh()));
    }

    private function loginAndRedirect(Request $request, User $user): RedirectResponse|View
    {
        Auth::login($user, remember: true);

        $redirect = $user->needsProfileCompletion()
            ? redirect()->route('auth.google.complete')
            : redirect()->intended(AuthRedirect::homeFor($user));

        return $this->finishOAuth($request, $redirect);
    }

    private function oauthError(Request $request, string $message): RedirectResponse|View
    {
        return $this->finishOAuth(
            $request,
            redirect()->route('login')->withErrors(['login' => $message]),
            $message,
        );
    }

    private function finishOAuth(Request $request, RedirectResponse $redirect, ?string $error = null): RedirectResponse|View
    {
        if ($request->session()->pull('google_oauth_popup')) {
            return view('auth.google-oauth-popup', [
                'status' => $error ? 'error' : 'success',
                'redirectTo' => $error ? route('login') : $redirect->getTargetUrl(),
                'error' => $error,
            ]);
        }

        return $redirect;
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function splitName(string $fullName): array
    {
        $fullName = trim($fullName);

        if ($fullName === '') {
            return ['Usuario', 'ORVAE'];
        }

        $parts = preg_split('/\s+/', $fullName) ?: [];
        $name = array_shift($parts) ?: 'Usuario';
        $lastname = $parts !== [] ? implode(' ', $parts) : '—';

        return [$name, $lastname];
    }

    private function uniqueUsername(string $base): string
    {
        $candidate = Str::lower(Str::slug($base, '.'));
        $candidate = preg_replace('/[^a-z0-9_.-]/', '', $candidate) ?: 'user';
        $candidate = Str::limit($candidate, 50, '');

        if (! User::query()->where('username', $candidate)->exists()) {
            return $candidate;
        }

        for ($i = 2; $i < 1000; $i++) {
            $try = Str::limit($candidate, 45, '').$i;
            if (! User::query()->where('username', $try)->exists()) {
                return $try;
            }
        }

        return $candidate.Str::random(6);
    }
}
