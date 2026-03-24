<?php

namespace App\Services\Payments;

use Illuminate\Support\Facades\Http;

class MercadoPagoClient
{
    private function baseUrl(): string
    {
        return 'https://api.mercadopago.com';
    }

    private function accessToken(): string
    {
        $token = trim((string) config('mercadopago.access_token'));

        if ($token === '') {
            throw new \RuntimeException('Configura MP_ACCESS_TOKEN en .env para usar Mercado Pago.');
        }

        return $token;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createPreference(array $payload): array
    {
        $response = Http::timeout(20)
            ->acceptJson()
            ->withToken($this->accessToken())
            ->post($this->baseUrl().'/checkout/preferences', $payload);

        if (! $response->successful()) {
            throw new \RuntimeException(
                'Mercado Pago create preference falló ('.$response->status().'): '.$response->body(),
            );
        }

        /** @var array<string, mixed> $json */
        $json = $response->json() ?? [];

        return $json;
    }

    /**
     * @return array<string, mixed>
     */
    public function getPayment(string $paymentId): array
    {
        $response = Http::timeout(20)
            ->acceptJson()
            ->withToken($this->accessToken())
            ->get($this->baseUrl().'/v1/payments/'.rawurlencode($paymentId));

        if (! $response->successful()) {
            throw new \RuntimeException(
                'Mercado Pago get payment falló ('.$response->status().'): '.$response->body(),
            );
        }

        /** @var array<string, mixed> $json */
        $json = $response->json() ?? [];

        return $json;
    }

    /**
     * @return array<string, mixed>
     */
    public function getMerchantOrder(string $merchantOrderId): array
    {
        $response = Http::timeout(20)
            ->acceptJson()
            ->withToken($this->accessToken())
            ->get($this->baseUrl().'/merchant_orders/'.rawurlencode($merchantOrderId));

        if (! $response->successful()) {
            throw new \RuntimeException(
                'Mercado Pago get merchant order falló ('.$response->status().'): '.$response->body(),
            );
        }

        /** @var array<string, mixed> $json */
        $json = $response->json() ?? [];

        return $json;
    }
}

