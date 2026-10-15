<?php

namespace App\Http\Controllers\WhatsAppCloud;

use App\Http\Controllers\Controller;
use App\Models\WaChannel;
use App\Models\WaTemplate;
use App\Services\WhatsAppCloud\EmbeddedSignup;
use App\Services\WhatsAppCloud\WhatsAppCloudException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Canal WhatsApp de un tenant visto desde el producto (pantalla "Conectar WhatsApp").
 * Nunca devuelve el token ni el PIN.
 */
class InternalChannelController extends Controller
{
    public function show(Request $request, EmbeddedSignup $signup): JsonResponse
    {
        $validator = Validator::make($request->query(), [
            'tenant_id' => ['required', 'string', 'max:64'],
        ]);

        if ($validator->fails()) {
            return response()->json(['ok' => false, 'errors' => $validator->errors()], 422);
        }

        $channel = WaChannel::query()
            ->where('producto', (string) $request->attributes->get('internal_producto'))
            ->where('tenant_id', $validator->validated()['tenant_id'])
            ->first();

        return response()->json([
            'ok' => true,
            'embedded_signup' => $signup->publicConfig(),
            'channel' => $channel instanceof WaChannel ? $this->present($channel) : null,
        ]);
    }

    public function embeddedSignup(Request $request, EmbeddedSignup $signup): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => ['required', 'string', 'max:64'],
            'code' => ['required', 'string', 'max:2048'],
            'waba_id' => ['required', 'string', 'regex:/^\d{5,32}$/'],
            'phone_number_id' => ['required', 'string', 'regex:/^\d{5,32}$/'],
            'coexistencia' => ['sometimes', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['ok' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        try {
            $result = $signup->connect(
                producto: (string) $request->attributes->get('internal_producto'),
                tenantId: $data['tenant_id'],
                code: $data['code'],
                wabaId: $data['waba_id'],
                phoneNumberId: $data['phone_number_id'],
                coexistencia: (bool) ($data['coexistencia'] ?? false),
            );
        } catch (WhatsAppCloudException $e) {
            return response()->json([
                'ok' => false,
                'error_code' => $e->errorCode,
                'message' => $e->getMessage(),
            ], $e->httpStatus >= 500 ? 502 : $e->httpStatus);
        }

        return response()->json([
            'ok' => true,
            'channel' => $this->present($result['channel']),
            'errores_plantillas' => $result['errores'],
        ], 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(WaChannel $channel): array
    {
        $plantillas = WaTemplate::ownTemplatesFor($channel);

        return [
            'provider' => $channel->provider,
            'estado' => $channel->estado,
            'phone_number_id' => $channel->phone_number_id,
            'waba_id' => $channel->waba_id,
            'display_phone_number' => $channel->display_phone_number,
            'verified_name' => $channel->verified_name,
            'plantillas' => $plantillas->map(fn (WaTemplate $t): array => [
                'nombre' => $t->nombre,
                'idioma' => $t->idioma,
                'estado' => $t->estado,
                'motivo' => $t->motivo,
            ])->values()->all(),
        ];
    }
}
