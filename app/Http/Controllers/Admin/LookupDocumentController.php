<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Consulta de RUC o DNI vía apiperu.dev.
 * Usado desde el formulario de emisión de comprobantes.
 */
class LookupDocumentController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'document' => ['required', 'string', 'regex:/^\d{8,11}$/'],
        ]);

        $document = preg_replace('/\D/', '', $request->string('document')->toString());
        $len      = strlen($document);

        if ($len !== 8 && $len !== 11) {
            return response()->json(['message' => 'El documento debe tener 8 dígitos (DNI) u 11 dígitos (RUC).'], 422);
        }

        $token   = config('services.apiperu.token');
        $baseUrl = rtrim((string) config('services.apiperu.base_url'), '/');

        if (empty($token) || empty($baseUrl)) {
            return response()->json(['message' => 'Servicio de consulta no configurado (apiperu).'], 503);
        }

        $endpoint = $len === 11 ? '/ruc' : '/dni';
        $payload  = $len === 11 ? ['ruc' => $document] : ['dni' => $document];

        try {
            $response = Http::timeout(15)
                ->acceptJson()
                ->withToken((string) $token)
                ->post($baseUrl . $endpoint, $payload);
        } catch (Throwable $e) {
            Log::warning('apiperu.lookup_unreachable', ['doc' => $document, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'No se pudo contactar el servicio de consulta. Intenta más tarde.'], 502);
        }

        if (!$response->successful()) {
            return response()->json(['message' => 'El servicio de consulta no respondió correctamente.'], 502);
        }

        $data = $response->json();

        if (!is_array($data) || ($data['success'] ?? false) !== true) {
            $msg = is_string($data['message'] ?? null)
                ? $data['message']
                : 'No se encontraron datos para ese documento.';
            return response()->json(['message' => $msg], 422);
        }

        $info = $data['data'] ?? [];
        if (!is_array($info)) {
            return response()->json(['message' => 'Respuesta del servicio incompleta.'], 502);
        }

        if ($len === 11) {
            // RUC
            $name    = trim((string) ($info['nombre_o_razon_social'] ?? $info['razon_social'] ?? ''));
            $address = trim((string) ($info['direccion_completa'] ?? $info['direccion'] ?? ''));
            $estado  = $info['estado'] ?? null;
            $condicion = $info['condicion'] ?? null;

            if ($name === '') {
                return response()->json(['message' => 'No se encontró razón social para ese RUC.'], 422);
            }

            return response()->json([
                'tipo_doc'    => '6',
                'name'        => $name,
                'address'     => $address,
                'estado'      => is_string($estado) ? $estado : null,
                'condicion'   => is_string($condicion) ? $condicion : null,
            ]);
        } else {
            // DNI
            $nombre    = trim((string) ($info['nombres'] ?? ''));
            $apellidos = trim((string) ($info['apellido_paterno'] ?? '')) . ' ' . trim((string) ($info['apellido_materno'] ?? ''));
            $fullName  = trim($nombre . ' ' . trim($apellidos));

            if ($fullName === '') {
                return response()->json(['message' => 'No se encontró nombre para ese DNI.'], 422);
            }

            return response()->json([
                'tipo_doc' => '1',
                'name'     => $fullName,
                'address'  => '',
            ]);
        }
    }
}
