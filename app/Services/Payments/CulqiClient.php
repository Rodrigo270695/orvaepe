<?php

namespace App\Services\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CulqiClient
{
    private function baseUrl(): string
    {
        return rtrim((string) config('culqi.base_url', 'https://api.culqi.com/v2'), '/');
    }

    private function secretKey(): string
    {
        $key = trim((string) config('culqi.secret_key'));

        if ($key === '') {
            throw new \RuntimeException('Configura CULQI_SECRET_KEY en .env para usar Culqi.');
        }

        return $key;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createCharge(array $payload): array
    {
        return $this->postJson('/charges', $payload, 'create charge');
    }

    /**
     * @return array<string, mixed>
     */
    public function getToken(string $tokenId): array
    {
        return $this->getJson('/tokens/'.rawurlencode($tokenId), 'get token');
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createCustomer(array $payload): array
    {
        return $this->postJson('/customers', $payload, 'create customer');
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createCard(array $payload): array
    {
        return $this->postJson('/cards', $payload, 'create card');
    }

    /**
     * Llamada ligera para validar autenticación con la API.
     */
    public function ping(): void
    {
        $response = Http::timeout(15)
            ->acceptJson()
            ->withToken($this->secretKey())
            ->get($this->baseUrl().'/charges?limit=1');

        if (! $response->successful()) {
            throw new \RuntimeException(
                'Culqi ping falló ('.$response->status().'): '.$response->body(),
            );
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function postJson(string $path, array $payload, string $label): array
    {
        $response = Http::timeout(25)
            ->acceptJson()
            ->withToken($this->secretKey())
            ->post($this->baseUrl().$path, $payload);

        if (! $response->successful()) {
            Log::warning('Culqi '.$label.' falló', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new \RuntimeException(
                'Culqi '.$label.' falló ('.$response->status().'): '.$response->body(),
            );
        }

        /** @var array<string, mixed> $json */
        $json = $response->json() ?? [];

        return $json;
    }

    /**
     * @return array<string, mixed>
     */
    private function getJson(string $path, string $label): array
    {
        $response = Http::timeout(25)
            ->acceptJson()
            ->withToken($this->secretKey())
            ->get($this->baseUrl().$path);

        if (! $response->successful()) {
            throw new \RuntimeException(
                'Culqi '.$label.' falló ('.$response->status().'): '.$response->body(),
            );
        }

        /** @var array<string, mixed> $json */
        $json = $response->json() ?? [];

        return $json;
    }
}
