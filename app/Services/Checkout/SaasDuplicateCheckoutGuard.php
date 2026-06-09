<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\User;
use App\Support\Checkout\SaasCatalogSku;
use App\Support\Checkout\SaasSubscriptionLookup;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Impide pedidos duplicados de alta SaaS; en su lugar reenvía acceso existente.
 */
final class SaasDuplicateCheckoutGuard
{
    public function __construct(
        private readonly SaasExistingAccountNotifier $existingAccountNotifier,
        private readonly SaasTenantAccessResolver $accessResolver,
    ) {}

    /**
     * @param  Collection<int, CatalogSku>  $skus
     */
    public function assertCanCheckout(User $user, Collection $skus): void
    {
        foreach ($skus as $sku) {
            if (! SaasCatalogSku::isSaasSubscription($sku)) {
                continue;
            }

            if (SaasSubscriptionLookup::isMarketingRenewalCheckout($sku)) {
                continue;
            }

            $productKey = SaasCatalogSku::isVetsaas($sku) ? 'vetsaas' : 'aulavirtual';

            if (! $this->accessResolver->userAlreadyHasSaasProduct($user, $productKey)) {
                continue;
            }

            $access = $productKey === 'vetsaas'
                ? $this->accessResolver->resolveVetsaas($user)
                : $this->accessResolver->resolveAulaVirtual($user);

            if ($access === null) {
                Log::warning('saas.duplicate_checkout_blocked_without_access', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'product' => $productKey,
                    'sku_code' => $sku->code,
                ]);

                throw ValidationException::withMessages([
                    'lines' => 'Ya tienes una cuenta activa con nosotros. '
                        .'Contacta a soporte para recuperar tu acceso.',
                ]);
            }

            $this->existingAccountNotifier->notify($user, $access);

            Log::info('saas.duplicate_checkout_blocked', [
                'user_id' => $user->id,
                'email' => $user->email,
                'product' => $productKey,
                'tenant_slug' => $access['tenant_slug'] ?? null,
            ]);

            $productLabel = $productKey === 'vetsaas' ? 'VetSaaS' : 'Aula Virtual';

            throw ValidationException::withMessages([
                'lines' => "Ya tienes una cuenta activa de {$productLabel}. "
                    .'Te enviamos por WhatsApp y correo tu subdominio y datos de acceso. '
                    .'Si olvidaste tu contraseña, usa «Olvidé mi contraseña» en la pantalla de login.',
            ]);
        }
    }
}
