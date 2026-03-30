<?php

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\OrderLine;
use Illuminate\Support\Str;

/**
 * Tras un pago confirmado, crea filas en license_keys en estado pendiente para SKUs OEM
 * (una fila por unidad comprada). Idempotente si se vuelve a ejecutar el mismo pedido.
 */
final class OrderPaidLicenseProvisioner
{
    public function provision(Order $order): void
    {
        $order->loadMissing(['lines.sku']);

        foreach ($order->lines as $line) {
            $sku = $line->sku;
            if ($sku === null || ! $this->isOemLicenseSku($sku)) {
                continue;
            }

            $qty = max(1, (int) $line->quantity);
            for ($slot = 1; $slot <= $qty; $slot++) {
                if ($this->slotExists($order->id, $line->id, $slot)) {
                    continue;
                }

                $this->createPendingLicense($order, $line, $sku, $slot);
            }
        }
    }

    private function isOemLicenseSku(CatalogSku $sku): bool
    {
        return in_array((string) $sku->sale_model, [
            'oem_license_one_time',
            'oem_license_subscription',
        ], true);
    }

    private function slotExists(string $orderId, string $orderLineId, int $slot): bool
    {
        return LicenseKey::query()
            ->where('order_id', $orderId)
            ->where('metadata->order_line_id', $orderLineId)
            ->where('metadata->line_slot', $slot)
            ->exists();
    }

    private function createPendingLicense(Order $order, OrderLine $line, CatalogSku $sku, int $slot): void
    {
        $limits = is_array($sku->limits) ? $sku->limits : [];
        $maxActivations = isset($limits['usuarios']) && is_numeric($limits['usuarios'])
            ? max(1, (int) $limits['usuarios'])
            : 1;
        $expiresAt = $this->expiresAtForSku($sku);

        LicenseKey::query()->create([
            'key' => $this->uniquePlaceholderKey(),
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'catalog_sku_id' => $sku->id,
            'status' => LicenseKey::STATUS_PENDING,
            'max_activations' => $maxActivations,
            'activation_count' => 0,
            'expires_at' => $expiresAt,
            'metadata' => [
                'created_via' => LicenseKey::CREATED_VIA_ORDER_PAYMENT,
                'order_line_id' => $line->id,
                'line_slot' => $slot,
                'awaiting_provider_key' => true,
                'sku_code' => $sku->code,
                'sku_name' => $line->sku_name_snapshot ?? $sku->name,
                'modelo_venta' => $sku->sale_model,
            ],
        ]);
    }

    private function expiresAtForSku(CatalogSku $sku): ?\DateTimeInterface
    {
        if ((string) $sku->sale_model !== 'oem_license_subscription') {
            return null;
        }

        $interval = strtolower(trim((string) ($sku->billing_interval ?? '')));
        return match ($interval) {
            'annual' => now()->addYear(),
            'custom' => now()->addDays(max(1, (int) ($sku->rental_days ?? 30))),
            default => now()->addMonth(),
        };
    }

    private function uniquePlaceholderKey(): string
    {
        do {
            $key = 'PEND-'.strtoupper(str_replace('-', '', (string) Str::uuid()));
        } while (LicenseKey::query()->where('key', $key)->exists());

        return $key;
    }
}
