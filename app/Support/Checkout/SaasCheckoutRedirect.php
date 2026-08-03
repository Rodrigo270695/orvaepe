<?php

declare(strict_types=1);

namespace App\Support\Checkout;

use App\Models\Order;
use Illuminate\Http\RedirectResponse;

/**
 * URL de ingreso post-checkout (VetSaaS bootstrap o login; Aula Virtual login).
 */
final class SaasCheckoutRedirect
{
    public static function urlForOrder(Order $order): ?string
    {
        $order->refresh();
        $snapshot = is_array($order->billing_snapshot) ? $order->billing_snapshot : [];

        foreach (['vetsaas_bootstrap_url', 'vetsaas_login_url', 'aulavirtual_login_url'] as $key) {
            $url = $snapshot[$key] ?? null;
            if (is_string($url) && trim($url) !== '') {
                return trim($url);
            }
        }

        return null;
    }

    /**
     * Tras pago con pasarela: puente Inertia que limpia carrito y redirige al SaaS.
     */
    public static function responseForOrder(Order $order): ?RedirectResponse
    {
        $url = self::urlForOrder($order);
        if ($url === null) {
            return null;
        }

        return redirect()
            ->route('checkout.saas-exit')
            ->with('saas_redirect_url', $url);
    }
}
