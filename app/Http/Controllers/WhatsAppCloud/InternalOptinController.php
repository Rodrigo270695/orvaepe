<?php

namespace App\Http\Controllers\WhatsAppCloud;

use App\Http\Controllers\Controller;
use App\Models\WaOptin;
use App\Services\WhatsAppCloud\Phone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Registro (store) y retiro (destroy) del consentimiento de un teléfono para un tenant.
 */
class InternalOptinController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => ['required', 'string', 'max:64'],
            'telefono' => ['required', 'string', 'max:32'],
            'origen' => ['required', 'string', 'max:40'],
            'fecha' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return response()->json(['ok' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $telefono = Phone::normalize($data['telefono']);

        if ($telefono === null) {
            return response()->json(['ok' => false, 'error_code' => 'invalid_phone', 'message' => 'Teléfono inválido.'], 422);
        }

        $optin = WaOptin::query()->updateOrCreate(
            [
                'producto' => (string) $request->attributes->get('internal_producto'),
                'tenant_id' => $data['tenant_id'],
                'telefono' => $telefono,
            ],
            [
                'fecha' => $data['fecha'] ?? now(),
                'origen' => $data['origen'],
            ],
        );

        return response()->json(['ok' => true, 'id' => $optin->id, 'telefono' => $telefono]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => ['required', 'string', 'max:64'],
            'telefono' => ['required', 'string', 'max:32'],
        ]);

        if ($validator->fails()) {
            return response()->json(['ok' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $deleted = WaOptin::query()
            ->where('producto', (string) $request->attributes->get('internal_producto'))
            ->where('tenant_id', $data['tenant_id'])
            ->where('telefono', Phone::normalize($data['telefono']) ?? '')
            ->delete();

        return response()->json(['ok' => true, 'deleted' => $deleted > 0]);
    }
}
