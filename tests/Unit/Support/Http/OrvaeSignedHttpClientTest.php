<?php

use App\Support\Http\OrvaeSignedHttpClient;
use Illuminate\Support\Facades\Http;

test('signed post sends the same json bytes used for hmac', function (): void {
    Http::fake([
        'https://vetsaas.test/provision' => Http::response(['status' => 'ok'], 201),
    ]);

    $payload = [
        'external_order_id' => 'ord-1',
        'plan_slug' => 'free',
        'tenant_slug' => 'clinica-demo',
        'razon_social' => 'Clínica Demo',
        'admin_nombres' => 'Ana',
        'admin_apellidos' => 'Demo',
        'admin_email' => 'ana@demo.test',
        'admin_password' => 'ClaveSegura123',
    ];

    $secret = 'test-secret-key';
    $expectedBody = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    OrvaeSignedHttpClient::post(
        'https://vetsaas.test/provision',
        $payload,
        $secret,
        'order:test',
    );

    Http::assertSent(function ($request) use ($expectedBody, $secret): bool {
        $timestamp = $request->header('X-Orvae-Timestamp')[0] ?? '';
        $signature = $request->header('X-Orvae-Signature')[0] ?? '';
        $expectedSig = hash_hmac('sha256', $timestamp.'.'.$expectedBody, $secret);

        return $request->body() === $expectedBody
            && hash_equals($expectedSig, $signature);
    });
});
