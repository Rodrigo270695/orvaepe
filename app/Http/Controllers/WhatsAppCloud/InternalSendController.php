<?php

namespace App\Http\Controllers\WhatsAppCloud;

use App\Http\Controllers\Controller;
use App\Services\WhatsAppCloud\MessageSender;
use App\Services\WhatsAppCloud\Templates;
use App\Services\WhatsAppCloud\WhatsAppCloudException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * POST /internal/whatsapp/send — VetSaaS / TallerSaaS encolan un recordatorio.
 * El resultado del envío (sent / failed + error de Meta) llega al producto por su endpoint de eventos.
 */
class InternalSendController extends Controller
{
    public function __invoke(Request $request, MessageSender $sender): JsonResponse
    {
        $plantilla = (string) $request->input('plantilla', '');
        $expectedVariables = Templates::variableCount($plantilla) ?? 0;

        $validator = Validator::make($request->all(), [
            'tenant_id' => ['required', 'string', 'max:64'],
            'telefono' => ['required', 'string', 'max:32'],
            'plantilla' => ['required', 'string', Rule::in(Templates::names())],
            'variables' => ['present', 'array', 'size:'.$expectedVariables],
            'variables.*' => ['required', 'string', 'max:1024'],
            'reminder_id' => ['nullable', 'string', 'max:64'],
        ]);

        if ($validator->fails()) {
            return response()->json(['ok' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        try {
            $message = $sender->queue(
                producto: (string) $request->attributes->get('internal_producto'),
                tenantId: $data['tenant_id'],
                telefono: $data['telefono'],
                plantilla: $data['plantilla'],
                variables: array_values($data['variables']),
                reminderId: $data['reminder_id'] ?? null,
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
            'estado' => $message->estado,
            'telefono' => $message->telefono,
        ], 202);
    }
}
