<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\WebhookEvent;
use App\Services\Checkout\OrderPaidEntitlementProvisioner;
use App\Services\Checkout\OrderPaidLicenseProvisioner;
use App\Services\Checkout\OrderPaidNotifier;
use App\Services\Checkout\OrderPaidSubscriptionProvisioner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CulqiWebhookController extends Controller
{
    public function __construct(
        private readonly OrderPaidNotifier $notifier,
        private readonly OrderPaidSubscriptionProvisioner $subscriptionProvisioner,
        private readonly OrderPaidEntitlementProvisioner $entitlementProvisioner,
        private readonly OrderPaidLicenseProvisioner $licenseProvisioner,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        if (! $this->passesBasicAuth($request)) {
            return response()->json(['ok' => false, 'message' => 'Unauthorized'], 401);
        }

        $payload = $request->all();
        $eventType = $this->resolveEventType($request, $payload);
        $gatewayEventId = $this->resolveGatewayEventId($request, $payload, $eventType);

        $event = WebhookEvent::query()->firstOrCreate(
            [
                'gateway' => 'culqi',
                'gateway_event_id' => $gatewayEventId,
            ],
            [
                'event_type' => $eventType,
                'payload' => $payload,
                'processed' => false,
                'attempts' => 0,
            ],
        );

        if (! $event->wasRecentlyCreated) {
            return response()->json(['ok' => true, 'duplicate' => true]);
        }

        try {
            $this->processChargeEvent($payload);
            $event->markProcessed();

            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            $event->markFailed($e->getMessage());

            return response()->json(['ok' => false], 500);
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function processChargeEvent(array $payload): void
    {
        $chargeId = (string) data_get($payload, 'data.id', '');
        $outcomeType = strtolower((string) data_get($payload, 'data.outcome.type', ''));
        $orderId = (string) data_get($payload, 'data.metadata.order_id', '');

        if ($chargeId === '' || $orderId === '') {
            return;
        }

        if ($outcomeType !== 'venta_exitosa') {
            return;
        }

        $order = Order::query()->whereKey($orderId)->first();
        if (! $order || $order->status === Order::STATUS_PAID) {
            return;
        }

        $user = $order->user;
        if (! $user) {
            return;
        }

        $wasPaid = $order->status === Order::STATUS_PAID;

        DB::transaction(function () use ($order, $user, $chargeId, $payload): void {
            $existing = Payment::query()->where('gateway_payment_id', $chargeId)->first();
            if ($existing !== null) {
                if ($order->status !== Order::STATUS_PAID) {
                    $order->update([
                        'status' => Order::STATUS_PAID,
                        'placed_at' => now(),
                    ]);
                }

                return;
            }

            $order->update([
                'status' => Order::STATUS_PAID,
                'placed_at' => now(),
            ]);

            Payment::query()->create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'gateway' => 'culqi',
                'gateway_payment_id' => $chargeId,
                'amount' => $order->grand_total,
                'currency' => $order->currency,
                'status' => 'completed',
                'raw_response' => $payload,
                'paid_at' => now(),
            ]);
        });

        if (! $wasPaid && $order->fresh()?->status === Order::STATUS_PAID) {
            $freshOrder = $order->fresh(['user', 'lines.sku.product', 'payments']);
            if ($freshOrder && $user instanceof User) {
                $this->notifier->notifyCustomer($freshOrder, $user);
                $this->notifier->notifyAdmin($freshOrder, $user);
                $this->subscriptionProvisioner->provision($freshOrder);
                $this->entitlementProvisioner->provision($freshOrder);
                $this->licenseProvisioner->provision($freshOrder);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveEventType(Request $request, array $payload): string
    {
        $resource = strtolower((string) ($request->query('resource')
            ?: data_get($payload, 'resource')
            ?: data_get($payload, 'data.object')
            ?: 'unknown'));

        $action = strtolower((string) ($request->query('action')
            ?: data_get($payload, 'action')
            ?: data_get($payload, 'type')
            ?: 'unknown'));

        $result = strtolower((string) ($request->query('result')
            ?: data_get($payload, 'result')
            ?: data_get($payload, 'data.outcome.type')
            ?: 'unknown'));

        return trim($resource.'.'.$action.'.'.$result, '.');
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveGatewayEventId(Request $request, array $payload, string $eventType): string
    {
        $candidate = (string) ($request->header('x-culqi-event-id')
            ?: data_get($payload, 'id')
            ?: data_get($payload, 'event_id')
            ?: data_get($payload, 'data.id')
            ?: '');

        if ($candidate !== '') {
            return $candidate;
        }

        return $eventType.':'.sha1((string) $request->getContent());
    }

    private function passesBasicAuth(Request $request): bool
    {
        $expectedUser = trim((string) config('culqi.webhook_basic_user'));
        $expectedPass = trim((string) config('culqi.webhook_basic_password'));

        if ($expectedUser === '' && $expectedPass === '') {
            return true;
        }

        $user = (string) ($request->getUser() ?? '');
        $pass = (string) ($request->getPassword() ?? '');

        return hash_equals($expectedUser, $user) && hash_equals($expectedPass, $pass);
    }
}

