<?php

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\Entitlement;
use App\Models\Order;
use App\Models\OrderLine;

/**
 * Crea/actualiza derechos de uso (entitlements) tras pago confirmado de un pedido.
 * Es idempotente por línea de pedido + usuario.
 */
final class OrderPaidEntitlementProvisioner
{
    public function provision(Order $order): void
    {
        $order->loadMissing(['lines.sku']);

        foreach ($order->lines as $line) {
            $sku = $line->sku;
            if (! $sku instanceof CatalogSku) {
                continue;
            }

            $entitlement = Entitlement::query()
                ->where('user_id', $order->user_id)
                ->where('order_id', $order->id)
                ->where('order_line_id', $line->id)
                ->first();

            if ($entitlement === null) {
                Entitlement::query()->create([
                    'user_id' => $order->user_id,
                    'catalog_product_id' => $sku->catalog_product_id,
                    'catalog_sku_id' => $sku->id,
                    'order_id' => $order->id,
                    'order_line_id' => $line->id,
                    'subscription_id' => null,
                    'status' => Entitlement::STATUS_ACTIVE,
                    'starts_at' => $order->placed_at ?? now(),
                    'ends_at' => null,
                    'suspended_at' => null,
                    'revoked_at' => null,
                    'revoke_reason' => null,
                    'feature_flags' => null,
                    'metadata' => [
                        'origen' => 'pago_pedido',
                        'order_number' => $order->order_number,
                        'sale_model' => $sku->sale_model,
                        'fulfillment_type' => $sku->fulfillment_type,
                        'sku_code' => $sku->code,
                    ],
                ]);

                continue;
            }

            $meta = is_array($entitlement->metadata) ? $entitlement->metadata : [];
            $meta['origen'] = 'pago_pedido';
            $meta['order_number'] = $order->order_number;
            $meta['sale_model'] = $sku->sale_model;
            $meta['fulfillment_type'] = $sku->fulfillment_type;
            $meta['sku_code'] = $sku->code;

            $entitlement->forceFill([
                'catalog_product_id' => $sku->catalog_product_id,
                'catalog_sku_id' => $sku->id,
                'status' => Entitlement::STATUS_ACTIVE,
                'starts_at' => $entitlement->starts_at ?? ($order->placed_at ?? now()),
                'suspended_at' => null,
                'revoked_at' => null,
                'revoke_reason' => null,
                'metadata' => $meta,
            ])->save();
        }
    }
}
