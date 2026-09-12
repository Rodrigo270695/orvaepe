<?php

declare(strict_types=1);

namespace App\Support\Checkout;

use App\Models\Order;
use App\Models\User;
use App\Support\WhatsAppPhoneNormalizer;

/**
 * Evita mandar el mismo WhatsApp dos veces al mismo número en un checkout
 * (p. ej. cliente y superadmin de prueba con el mismo celular).
 */
final class WhatsAppRecipientDeduper
{
    /** @var array<string, true> */
    private array $seen = [];

    public function remember(?string $normalizedTo): void
    {
        $key = $this->normalizeKey($normalizedTo);
        if ($key !== null) {
            $this->seen[$key] = true;
        }
    }

    public function alreadySent(?string $normalizedTo): bool
    {
        $key = $this->normalizeKey($normalizedTo);

        return $key !== null && isset($this->seen[$key]);
    }

    /**
     * @return array{0: string|null, 1: bool} [to, should_skip]
     */
    public function claim(?string $normalizedTo): array
    {
        $to = $this->normalizeKey($normalizedTo);
        if ($to === null) {
            return [null, true];
        }

        if (isset($this->seen[$to])) {
            return [$to, true];
        }

        $this->seen[$to] = true;

        return [$to, false];
    }

    public function resolveFromUser(User $user, ?Order $order = null): ?string
    {
        return CheckoutCustomerPhone::ultraMsgTo($user, $order);
    }

    public static function forOrder(Order $order): self
    {
        // Una instancia por ciclo de notificaciones del pedido (request actual).
        return new self;
    }

    private function normalizeKey(?string $to): ?string
    {
        if (! is_string($to) || trim($to) === '') {
            return null;
        }

        $normalized = WhatsAppPhoneNormalizer::toUltraMsgTo($to);

        return is_string($normalized) && $normalized !== '' ? $normalized : null;
    }
}
