<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Models\WebhookEvent;
use App\Services\WhatsAppCloud\WebhookProcessor;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Eventos recibidos en /webhooks/whatsapp (WhatsApp Cloud API de Meta).
 * El gateway_event_id es "wamid:estado" (o "wamid:in" para entrantes); se cruza con wa_messages por el wamid.
 */
class WhatsAppCloudWebhooksController extends Controller
{
    private const TIPOS = ['status', 'message', 'failed'];

    public function index(Request $request): Response|RedirectResponse
    {
        $q = trim((string) $request->query('q', ''));
        $processed = trim((string) $request->query('processed', ''));
        $tipo = trim((string) $request->query('tipo', ''));
        $producto = trim((string) $request->query('producto', ''));

        $perPage = (int) $request->query('per_page', 25);
        if (! in_array($perPage, [10, 15, 20, 25, 30, 40, 50], true)) {
            $perPage = 25;
        }

        $dateFrom = trim((string) $request->query('date_from', ''));
        $dateTo = trim((string) $request->query('date_to', ''));
        $datePattern = '/^\d{4}-\d{2}-\d{2}$/';

        if (! preg_match($datePattern, $dateFrom) || ! preg_match($datePattern, $dateTo)) {
            return redirect()->route('panel.operacion-whatsapp-cloud.index', array_merge($request->query(), [
                'date_from' => now()->startOfMonth()->format('Y-m-d'),
                'date_to' => now()->endOfMonth()->format('Y-m-d'),
            ]));
        }

        $query = WebhookEvent::query()
            ->where('gateway', WebhookProcessor::GATEWAY)
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo);

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function (Builder $outer) use ($like): void {
                $outer->where('gateway_event_id', 'ILIKE', $like)
                    ->orWhere('event_type', 'ILIKE', $like)
                    ->orWhereIn(DB::raw("split_part(gateway_event_id, ':', 1)"), WaMessage::query()
                        ->select('provider_msg_id')
                        ->whereNotNull('provider_msg_id')
                        ->where(fn (Builder $m) => $m->where('telefono', 'ILIKE', $like)
                            ->orWhere('tenant_id', 'ILIKE', $like)
                            ->orWhere('reminder_id', 'ILIKE', $like)));
            });
        }

        if (in_array($producto, WaChannel::productos(), true)) {
            $query->whereIn(DB::raw("split_part(gateway_event_id, ':', 1)"), WaMessage::query()
                ->select('provider_msg_id')
                ->whereNotNull('provider_msg_id')
                ->where('producto', $producto));
        }

        if ($tipo === 'status') {
            $query->where('event_type', 'LIKE', 'status.%');
        } elseif ($tipo === 'message') {
            $query->where('event_type', 'LIKE', 'message.%');
        } elseif ($tipo === 'failed') {
            $query->where('event_type', 'status.failed');
        }

        $stats = (clone $query)
            ->toBase()
            ->selectRaw('count(*) as total')
            ->selectRaw('count(*) filter (where processed) as procesados')
            ->selectRaw("count(*) filter (where error is not null and error <> '') as con_error")
            ->selectRaw("count(*) filter (where event_type = 'status.failed') as fallidos")
            ->selectRaw("count(*) filter (where event_type like 'message.%') as entrantes")
            ->first();

        if ($processed === '1') {
            $query->where('processed', true);
        } elseif ($processed === '0') {
            $query->where('processed', false);
        }

        $events = $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        $wamids = $events->getCollection()
            ->map(fn (WebhookEvent $e) => Str::beforeLast($e->gateway_event_id, ':'))
            ->unique()
            ->values();

        $messages = WaMessage::query()
            ->whereIn('provider_msg_id', $wamids)
            ->get(['provider_msg_id', 'producto', 'tenant_id', 'reminder_id', 'telefono', 'direccion', 'plantilla', 'estado', 'error_code', 'error_msg'])
            ->keyBy('provider_msg_id');

        $events->through(function (WebhookEvent $e) use ($messages): array {
            $wamid = Str::beforeLast($e->gateway_event_id, ':');
            $message = $messages->get($wamid);

            return [
                'id' => $e->id,
                'event_type' => $e->event_type,
                'wamid' => $wamid,
                'processed' => $e->processed,
                'processed_at' => $e->processed_at?->toIso8601String(),
                'error' => $e->error,
                'attempts' => $e->attempts,
                'meta_error' => $this->metaError($e->payload),
                'created_at' => $e->created_at?->toIso8601String(),
                'mensaje' => $message instanceof WaMessage ? [
                    'producto' => $message->producto,
                    'tenant_id' => $message->tenant_id,
                    'reminder_id' => $message->reminder_id,
                    'telefono' => $message->telefono,
                    'direccion' => $message->direccion,
                    'plantilla' => $message->plantilla,
                    'estado' => $message->estado,
                ] : null,
            ];
        });

        return Inertia::render('admin/operacion-whatsapp-cloud/index', [
            'webhookEvents' => $events,
            'stats' => [
                'total' => (int) ($stats->total ?? 0),
                'procesados' => (int) ($stats->procesados ?? 0),
                'con_error' => (int) ($stats->con_error ?? 0),
                'fallidos' => (int) ($stats->fallidos ?? 0),
                'entrantes' => (int) ($stats->entrantes ?? 0),
            ],
            'productos' => WaChannel::productos(),
            'webhookUrl' => route('webhooks.whatsapp'),
            'filters' => [
                'q' => $q,
                'processed' => $processed,
                'tipo' => in_array($tipo, self::TIPOS, true) ? $tipo : '',
                'producto' => $producto,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * @return array{code: string|null, message: string|null}|null
     */
    private function metaError(mixed $payload): ?array
    {
        $error = data_get($payload, 'errors.0');
        if (! is_array($error)) {
            return null;
        }

        return [
            'code' => isset($error['code']) ? (string) $error['code'] : null,
            'message' => Str::limit((string) (data_get($error, 'error_data.details') ?: ($error['message'] ?? $error['title'] ?? '')), 300),
        ];
    }
}
