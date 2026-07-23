<?php

declare(strict_types=1);

namespace App\Services\Payments;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Culqi One Click: guarda customer + card cuando el medio es tarjeta.
 * Yape / billeteras no se pueden tokenizar para cobros futuros.
 */
final class CulqiRememberCardService
{
    public function __construct(
        private readonly CulqiClient $culqi,
    ) {}

    /**
     * @return array{
     *     source_id: string,
     *     remembered: bool,
     *     skipped_reason: string|null,
     *     customer_id: string|null,
     *     card_id: string|null
     * }
     */
    public function resolveChargeSource(User $user, string $tokenId, bool $rememberCard): array
    {
        $tokenId = trim($tokenId);

        if (! $rememberCard || $tokenId === '') {
            return [
                'source_id' => $tokenId,
                'remembered' => false,
                'skipped_reason' => $rememberCard ? null : 'opt_out',
                'customer_id' => null,
                'card_id' => null,
            ];
        }

        try {
            $token = $this->culqi->getToken($tokenId);
        } catch (\Throwable $e) {
            Log::warning('Culqi: no se pudo inspeccionar token; cobro one-shot', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'source_id' => $tokenId,
                'remembered' => false,
                'skipped_reason' => 'token_lookup_failed',
                'customer_id' => null,
                'card_id' => null,
            ];
        }

        if (! $this->isCardToken($token, $tokenId)) {
            return [
                'source_id' => $tokenId,
                'remembered' => false,
                'skipped_reason' => 'not_card',
                'customer_id' => null,
                'card_id' => null,
            ];
        }

        try {
            $customerId = $this->resolveCustomerId($user);
            $card = $this->culqi->createCard([
                'customer_id' => $customerId,
                'token_id' => $tokenId,
            ]);
            $cardId = trim((string) ($card['id'] ?? ''));

            if ($cardId === '' || ! str_starts_with($cardId, 'crd_')) {
                throw new \RuntimeException('Culqi no devolvió card_id válido.');
            }

            return [
                'source_id' => $cardId,
                'remembered' => true,
                'skipped_reason' => null,
                'customer_id' => $customerId,
                'card_id' => $cardId,
            ];
        } catch (\Throwable $e) {
            Log::warning('Culqi: no se pudo guardar tarjeta; cobro one-shot con token', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'source_id' => $tokenId,
                'remembered' => false,
                'skipped_reason' => 'vault_failed',
                'customer_id' => null,
                'card_id' => null,
            ];
        }
    }

    /**
     * @param  array<string, mixed>  $token
     */
    private function isCardToken(array $token, string $tokenId): bool
    {
        $type = strtolower(trim((string) ($token['type'] ?? '')));

        if (in_array($type, ['yape', 'billetera', 'wallet', 'qr'], true)) {
            return false;
        }

        if (str_starts_with(strtolower($tokenId), 'ype_')) {
            return false;
        }

        if ($type === 'card' || str_starts_with($tokenId, 'tkn_')) {
            return true;
        }

        // Si Culqi no manda type claro pero el id es tkn_, asumimos tarjeta.
        return str_starts_with($tokenId, 'tkn_');
    }

    private function resolveCustomerId(User $user): string
    {
        $existing = Subscription::query()
            ->where('user_id', $user->id)
            ->whereNotNull('gateway_customer_id')
            ->where('gateway_customer_id', '!=', '')
            ->orderByDesc('updated_at')
            ->value('gateway_customer_id');

        if (is_string($existing) && str_starts_with($existing, 'cus_')) {
            return $existing;
        }

        $nameParts = preg_split('/\s+/', trim((string) $user->name), 2) ?: [];
        $firstName = trim((string) ($nameParts[0] ?? ''));
        $lastName = trim((string) ($user->lastname ?: ($nameParts[1] ?? '')));

        if ($firstName === '') {
            $firstName = 'Cliente';
        }
        if ($lastName === '') {
            $lastName = 'ORVAE';
        }

        $phone = preg_replace('/\D+/', '', (string) ($user->phone ?? '')) ?: '999999999';
        $phone = Str::limit($phone, 15, '');

        $customer = $this->culqi->createCustomer([
            'first_name' => Str::limit($firstName, 50, ''),
            'last_name' => Str::limit($lastName, 50, ''),
            'email' => (string) $user->email,
            'address' => 'Peru',
            'address_city' => 'Lima',
            'country_code' => 'PE',
            'phone_number' => $phone,
            'metadata' => [
                'user_id' => (string) $user->id,
            ],
        ]);

        $customerId = trim((string) ($customer['id'] ?? ''));

        if ($customerId === '' || ! str_starts_with($customerId, 'cus_')) {
            throw new \RuntimeException('Culqi no devolvió customer_id válido.');
        }

        return $customerId;
    }
}
