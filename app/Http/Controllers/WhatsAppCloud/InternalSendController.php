<?php

namespace App\Http\Controllers\WhatsAppCloud;

use App\Http\Controllers\Controller;
use App\Models\WaChannel;
use App\Services\WhatsAppCloud\MessageSender;
use App\Services\WhatsAppCloud\WhatsAppCloudException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * POST /internal/whatsapp/send — usado por VetSaaS / TallerSaaS. Nunca devuelve credenciales del canal.
 */
class InternalSendController extends Controller
{
    public function __invoke(Request $request, MessageSender $sender): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'producto' => ['required', 'string', Rule::in(WaChannel::productos())],
            'tenant_id' => ['required', 'string', 'max:64'],
            'telefono' => ['required', 'string', 'max:32'],
            'plantilla' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
            'variables' => ['present', 'array', 'max:20'],
            'variables.*' => ['required', 'string', 'max:1024'],
            'reminder_id' => ['nullable', 'string', 'max:64'],
            'categoria' => ['nullable', 'string', 'max:40'],
            'idioma' => ['nullable', 'string', 'max:10'],
        ]);

        if ($validator->fails()) {
            return response()->json(['ok' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($data['producto'] !== $request->attributes->get('internal_producto')) {
            return response()->json(['ok' => false, 'message' => 'La API key no corresponde a este producto.'], 403);
        }

        try {
            $message = $sender->send(
                producto: $data['producto'],
                tenantId: $data['tenant_id'],
                telefono: $data['telefono'],
                plantilla: $data['plantilla'],
                variables: array_values($data['variables']),
                reminderId: $data['reminder_id'] ?? null,
                categoria: $data['categoria'] ?? null,
                idioma: $data['idioma'] ?? null,
            );
        } catch (WhatsAppCloudException $e) {
            return response()->json([
                'ok' => false,
                'error_code' => $e->errorCode,
                'message' => $e->getMessage(),
            ], $e->httpStatus);
        }

        return response()->json([
            'ok' => true,
            'id' => $message->id,
            'provider' => WaChannel::PROVIDER_CLOUD,
            'provider_msg_id' => $message->provider_msg_id,
            'estado' => $message->estado,
        ]);
    }
}
