<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\LookupSunatRucRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class LookupSunatRucController extends Controller
{
    public function __invoke(LookupSunatRucRequest $request): JsonResponse
    {
        $token = config('services.apiperu.token');
        $base = rtrim((string) config('services.apiperu.base_url'), '/');

        if ($token === '' || $token === null || $base === '') {
            return response()->json(
                ['message' => 'Consulta SUNAT no configurada (token o URL APIPERU).'],
                503,
            );
        }

        $ruc = $request->validated('ruc');
        $url = $base.'/ruc';

        try {
            $response = Http::timeout(20)
                ->acceptJson()
                ->withToken((string) $token)
                ->post($url, ['ruc' => $ruc]);
        } catch (Throwable $e) {
            Log::warning('apiperu.ruc_unreachable', ['ruc' => $ruc, 'error' => $e->getMessage()]);

            return response()->json(
                ['message' => 'No se pudo contactar el servicio de consulta RUC. Intenta más tarde.'],
                502,
            );
        }

        if (! $response->successful()) {
            Log::warning('apiperu.ruc_http_error', [
                'ruc' => $ruc,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json(
                ['message' => 'El servicio de consulta RUC no respondió correctamente.'],
                502,
            );
        }

        $payload = $response->json();

        if (! is_array($payload) || (($payload['success'] ?? false) !== true)) {
            $msg = is_string($payload['message'] ?? null)
                ? $payload['message']
                : 'No se encontraron datos para ese RUC o la consulta no fue exitosa.';

            return response()->json(['message' => $msg], 422);
        }

        $data = $payload['data'] ?? null;
        if (! is_array($data)) {
            return response()->json(
                ['message' => 'Respuesta del servicio RUC incompleta.'],
                502,
            );
        }

        $legalName = $data['nombre_o_razon_social'] ?? $data['razon_social'] ?? '';
        $legalName = is_string($legalName) ? trim($legalName) : '';

        $addrFull = $data['direccion_completa'] ?? '';
        $addrFull = is_string($addrFull) ? trim($addrFull) : '';
        $addr = $data['direccion'] ?? '';
        $addr = is_string($addr) ? trim($addr) : '';
        $address = $addrFull !== '' ? $addrFull : $addr;

        if ($legalName === '' || $address === '') {
            return response()->json(
                ['message' => 'La consulta no devolvió razón social o dirección.'],
                422,
            );
        }

        $phone = '';
        foreach (['telefono', 'telefono_celular', 'telefono_fijo', 'celular', 'numero_celular'] as $key) {
            $candidate = $data[$key] ?? null;
            if (! is_string($candidate)) {
                continue;
            }
            $candidate = trim($candidate);
            if ($candidate !== '') {
                $phone = $candidate;
                break;
            }
        }

        if ($phone === '') {
            $many = $data['telefonos'] ?? null;
            if (is_string($many)) {
                $phone = trim($many);
            } elseif (is_array($many)) {
                foreach ($many as $item) {
                    if (is_string($item) && trim($item) !== '') {
                        $phone = trim($item);
                        break;
                    }
                }
            }
        }

        $out = [
            'legal_name' => $legalName,
            'address' => $address,
            'estado' => is_string($data['estado'] ?? null) ? $data['estado'] : null,
            'condicion' => is_string($data['condicion'] ?? null) ? $data['condicion'] : null,
        ];

        /** Consulta SUNAT habitual no incluye teléfono; si la API lo envía en otro campo, se reusa aquí. */
        if ($phone !== '') {
            $out['phone'] = $phone;
        }

        return response()->json($out);
    }
}
