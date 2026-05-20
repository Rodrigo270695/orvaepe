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
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse|HttpResponse
    {
        if (! GoogleOAuth::isConfigured()) {
            return redirect()
                ->route('login')
                ->withErrors(['login' => 'El inicio de sesión con Google no está configurado.']);
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        if (! GoogleOAuth::isConfigured()) {
            return redirect()
                ->route('login')
                ->withErrors(['login' => 'El inicio de sesión con Google no está configurado.']);
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            report($e);

            return redirect()
                ->route('login')
                ->withErrors(['login' => 'No se pudo completar el inicio de sesión con Google. Intenta de nuevo.']);
        }

        $googleId = (string) $googleUser->getId();
        $email = Str::lower((string) $googleUser->getEmail());

        if ($email === '') {
            return redirect()
                ->route('login')
                ->withErrors(['login' => 'Google no proporcionó un correo electrónico válido.']);
        }

        $user = User::query()->where('google_id', $googleId)->first();

        if ($user) {
            return $this->loginAndRedirect($user);
        }

        $existingByEmail = User::query()->where('email', $email)->first();

        if ($existingByEmail) {
            return redirect()
                ->route('login')
                ->withErrors([
                    'login' => 'Ya existe una cuenta con este correo. Inicia sesión con tu usuario y contraseña.',
                ]);
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

        return $this->loginAndRedirect($user);
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

    private function loginAndRedirect(User $user): RedirectResponse
    {
        Auth::login($user, remember: true);

        if ($user->needsProfileCompletion()) {
            return redirect()->route('auth.google.complete');
        }

        return redirect()->intended(AuthRedirect::homeFor($user));
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
