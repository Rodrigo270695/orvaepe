<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['username', 'name', 'lastname', 'email', 'password', 'document_number', 'phone', 'google_id', 'avatar'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function entitlements(): HasMany
    {
        return $this->hasMany(Entitlement::class);
    }

    public function licenseKeys(): HasMany
    {
        return $this->hasMany(LicenseKey::class);
    }

    /**
     * @return HasMany<AuditLog, $this>
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Notificaciones persistidas (tabla notifications con user_id + channel).
     * No sustituye a la relación polimórfica `notifications()` del trait Notifiable.
     *
     * @return HasMany<Notification, $this>
     */
    public function userNotifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Cotizaciones donde este usuario es el cliente (cuenta registrada).
     *
     * @return HasMany<Quote, $this>
     */
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class, 'user_id');
    }

    /**
     * Cotizaciones creadas por este usuario (staff / vendedor).
     *
     * @return HasMany<Quote, $this>
     */
    public function quotesAuthored(): HasMany
    {
        return $this->hasMany(Quote::class, 'created_by');
    }

    public function needsProfileCompletion(): bool
    {
        return blank($this->document_number);
    }

    public function usesGoogleAuth(): bool
    {
        return filled($this->google_id);
    }
}
