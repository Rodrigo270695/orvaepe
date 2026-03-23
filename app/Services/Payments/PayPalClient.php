<?php

namespace App\Services\Payments;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cliente mínimo para PayPal REST API v2 (OAuth2 + órdenes de checkout).
 *
 * @see https://developer.paypal.com/docs/api/orders/v2/
 */
final class PayPalClient
{
    private function baseUrl(): string
    {
        return config('paypal.mode') === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    private function cacheKey(): string
    {
        $id = (string) config('paypal.client_id');

        return 'paypal.access_token.'.hash('sha256', $id.'|'.(string) config('paypal.mode'));
    }

    /**
     * @throws RequestException
     */
    public function getAccessToken(): string
    {
        $clientId = (string) config('paypal.client_id');
        $secret = (string) config('paypal.secret');
        if ($clientId === '' || $secret === '') {
            throw new \RuntimeException('Configura PAYPAL_CLIENT_ID y PAYPAL_SECRET en .env');
        }

        return Cache::remember($this->cacheKey(), now()->addMinutes(25), function () use ($clientId, $secret) {
            $response = Http::asForm()
                ->withBasicAuth($clientId, $secret)
                ->post($this->baseUrl().'/v1/oauth2/token', [
                    'grant_type' => 'client_credentials',
                ]);

            $response->throw();

            $token = $response->json('access_token');
            if (! is_string($token) || $token === '') {
                throw new \RuntimeException('PayPal no devolvió access_token.');
            }

            return $token;
        });
    }

    /**
     * Crea una orden de pago (intent CAPTURE). Devuelve el JSON completo; incluye `id` y `links`.
     *
     * @param  array<string, mixed>  $extraPurchaseUnit  Se fusiona en purchase_units[0]
     * @return array<string, mixed>
     *
     * @throws RequestException
     */
    public function createOrder(
        string $amount,
        ?string $currency,
        string $returnUrl,
        string $cancelUrl,
        string $referenceId = 'orvae-checkout',
        array $extraPurchaseUnit = [],
    ): array {
        $currencyCode = strtoupper($currency ?? (string) config('paypal.checkout_currency', 'USD'));

        $purchaseUnit = array_merge([
            'reference_id' => $referenceId,
            'amount' => [
                'currency_code' => $currencyCode,
                'value' => $amount,
            ],
        ], $extraPurchaseUnit);

        $payload = [
            'intent' => 'CAPTURE',
            'purchase_units' => [$purchaseUnit],
            'application_context' => [
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
                'shipping_preference' => 'NO_SHIPPING',
                'user_action' => 'PAY_NOW',
                'locale' => 'es-PE',
            ],
        ];

        $response = Http::withToken($this->getAccessToken())
            ->acceptJson()
            ->asJson()
            ->post($this->baseUrl().'/v2/checkout/orders', $payload);

        $response->throw();

        /** @var array<string, mixed> */
        return $response->json();
    }

    /**
     * Tras el usuario aprobar en PayPal, captura el pago.
     *
     * @return array<string, mixed>
     *
     * @throws RequestException
     */
    public function captureOrder(string $paypalOrderId): array
    {
        // PayPal exige Content-Type: application/json; un cuerpo vacío debe ser {} (objeto), no omitir el body.
        $response = Http::withToken($this->getAccessToken())
            ->acceptJson()
            ->asJson()
            ->post(
                $this->baseUrl().'/v2/checkout/orders/'.rawurlencode($paypalOrderId).'/capture',
                new \stdClass,
            );

        $response->throw();

        /** @var array<string, mixed> */
        return $response->json();
    }

    /**
     * Intenta capturar la orden. Si POST /capture falla pero la orden ya está COMPLETED
     * (p. ej. doble clic, recarga en return, o captura previa), devuelve GET order.
     *
     * @return array<string, mixed>
     *
     * @throws RequestException
     */
    public function captureOrderOrSyncCompleted(string $paypalOrderId): array
    {
        try {
            return $this->captureOrder($paypalOrderId);
        } catch (RequestException $e) {
            try {
                $order = $this->getOrder($paypalOrderId);
            } catch (RequestException) {
                throw $e;
            }

            if (($order['status'] ?? '') === 'COMPLETED') {
                Log::info('paypal.capture_fell_back_to_get_order', [
                    'paypal_order_id' => $paypalOrderId,
                    'capture_error' => $e->getMessage(),
                ]);

                return $order;
            }

            throw $e;
        }
    }

    /**
     * Consulta una orden existente (útil para depuración o reconciliación).
     *
     * @return array<string, mixed>
     *
     * @throws RequestException
     */
    public function getOrder(string $paypalOrderId): array
    {
        $response = Http::withToken($this->getAccessToken())
            ->acceptJson()
            ->get($this->baseUrl().'/v2/checkout/orders/'.rawurlencode($paypalOrderId));

        $response->throw();

        /** @var array<string, mixed> */
        return $response->json();
    }

    public static function forgetCachedToken(): void
    {
        $id = (string) config('paypal.client_id');
        $key = 'paypal.access_token.'.hash('sha256', $id.'|'.(string) config('paypal.mode'));
        Cache::forget($key);
    }
}
