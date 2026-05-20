<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'services.google.client_id' => 'test-client-id',
        'services.google.client_secret' => 'test-client-secret',
        'services.google.redirect' => 'http://localhost/auth/google/callback',
    ]);

    Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
});

function mockGoogleUser(string $id = 'google-123', string $email = 'google@example.com', string $name = 'Ana García'): SocialiteUser
{
    $user = Mockery::mock(SocialiteUser::class);
    $user->shouldReceive('getId')->andReturn($id);
    $user->shouldReceive('getEmail')->andReturn($email);
    $user->shouldReceive('getName')->andReturn($name);
    $user->shouldReceive('getNickname')->andReturn(null);
    $user->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');

    return $user;
}

test('login page shows google button when oauth is configured', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/login')
            ->where('googleOAuthEnabled', true));
});

test('google redirect requires guest and sends user to google', function () {
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('redirect')->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->get(route('auth.google.redirect'))
        ->assertRedirect('https://accounts.google.com/o/oauth2/auth');
});

test('google redirect with popup flag stores session', function () {
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('redirect')->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->get(route('auth.google.redirect', ['popup' => 1]))
        ->assertRedirect('https://accounts.google.com/o/oauth2/auth')
        ->assertSessionHas('google_oauth_popup', true);
});

test('google callback in popup mode returns close view', function () {
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn(mockGoogleUser());

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->withSession(['google_oauth_popup' => true])
        ->get(route('auth.google.callback'))
        ->assertOk()
        ->assertViewIs('auth.google-oauth-popup')
        ->assertViewHas('status', 'success');

    $this->assertAuthenticated();
});

test('google callback creates client and redirects to complete profile', function () {
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn(mockGoogleUser());

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('auth.google.complete'));
    $this->assertAuthenticated();

    $user = User::query()->where('email', 'google@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->google_id)->toBe('google-123')
        ->and($user->document_number)->toBeNull()
        ->and($user->password)->toBeNull()
        ->and($user->hasRole('client'))->toBeTrue();
});

test('google callback logs in existing google user', function () {
    $user = User::factory()->client()->create([
        'google_id' => 'google-999',
        'email' => 'existing@example.com',
        'document_number' => '12345678',
        'password' => null,
        'email_verified_at' => now(),
    ]);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn(mockGoogleUser('google-999', 'existing@example.com'));

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect('/cliente');

    $this->assertAuthenticatedAs($user);
});

test('google callback rejects email already used by password account', function () {
    User::factory()->client()->create([
        'email' => 'taken@example.com',
        'password' => Hash::make('password'),
        'google_id' => null,
    ]);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn(mockGoogleUser('new-google', 'taken@example.com'));

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});

test('client can complete google profile', function () {
    $user = User::factory()->client()->create([
        'google_id' => 'g-1',
        'document_number' => null,
        'password' => null,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->post(route('auth.google.complete.store'), [
            'document_number' => '87654321',
            'phone' => '987654321',
            'accept_privacy' => '1',
        ])
        ->assertRedirect('/cliente');

    $user->refresh();
    expect($user->document_number)->toBe('87654321')
        ->and($user->phone)->toBe('987654321');
});

test('incomplete client profile is redirected from cliente portal', function () {
    $user = User::factory()->client()->create([
        'google_id' => 'g-2',
        'document_number' => null,
        'password' => null,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('cliente.home'))
        ->assertRedirect(route('auth.google.complete'));
});
