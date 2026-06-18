<?php

declare(strict_types=1);

namespace App\Support\Invoices;

use App\Models\Order;
use App\Models\User;
use App\Models\UserProfile;

/**
 * Resuelve qué usuario del portal cliente corresponde al adquirente de un comprobante.
 */
final class InvoiceClientResolver
{
    /**
     * @param  array<string, mixed>  $buyerSnapshot
     */
    public function resolve(?string $orderId, array $buyerSnapshot): ?int
    {
        if ($orderId !== null && $orderId !== '') {
            $orderUserId = Order::query()
                ->whereKey($orderId)
                ->value('user_id');

            if ($orderUserId !== null) {
                return (int) $orderUserId;
            }
        }

        $tipoDoc = (string) ($buyerSnapshot['tipo_doc'] ?? '');
        $numDoc = preg_replace('/\D+/', '', (string) ($buyerSnapshot['num_doc'] ?? ''));

        if ($numDoc === '') {
            return null;
        }

        if ($tipoDoc === '6') {
            $userId = UserProfile::query()
                ->where('ruc', $numDoc)
                ->value('user_id');

            return $userId !== null ? (int) $userId : null;
        }

        if ($tipoDoc === '1') {
            $userId = User::query()
                ->where('document_number', $numDoc)
                ->value('id');

            return $userId !== null ? (int) $userId : null;
        }

        return null;
    }
}
