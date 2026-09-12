<?php

declare(strict_types=1);

namespace App\Support\Checkout;

use App\Models\Order;
use App\Models\User;
use App\Support\WhatsAppPhoneNormalizer;

/**
 * Celular del comprador para WhatsApp de acceso SaaS.
 * No usar el de superadmin/env: ese es solo alerta operativa.
 */
final class CheckoutCustomerPhone
{
    public static function raw(?User $user, ?Order $order = null): ?string
    {
        if ($user instanceof User) {
            if ($user->exists || $user->relationLoaded('profile')) {
                $user->loadMissing('profile');
            }

            foreach ([$user->phone, $user->profile?->phone] as $candidate) {
                $trimmed = self::trimPhone($candidate);
                if ($trimmed !== null) {
                    return $trimmed;
                }
            }
        }

        if ($order instanceof Order) {
            $snapshot = is_array($order->billing_snapshot) ? $order->billing_snapshot : [];
            foreach (['phone', 'telefono', 'customer_phone', 'whatsapp', 'billing_phone'] as $key) {
                $trimmed = self::trimPhone($snapshot[$key] ?? null);
                if ($trimmed !== null) {
                    return $trimmed;
                }
            }
        }

        return null;
    }

    public static function ultraMsgTo(?User $user, ?Order $order = null): ?string
    {
        return WhatsAppPhoneNormalizer::toUltraMsgTo(self::raw($user, $order));
    }

    public static function persistOnUser(User $user, ?Order $order = null): ?string
    {
        $raw = self::raw($user, $order);
        if ($raw === null) {
            return null;
        }

        if (trim((string) $user->phone) === '') {
            $user->forceFill(['phone' => $raw])->save();
        }

        return $raw;
    }

    private static function trimPhone(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed !== '' ? $trimmed : null;
    }
}
