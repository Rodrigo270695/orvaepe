<?php

use App\Services\Payments\PayPalClient;
use App\Services\Access\SubscriptionEntitlementSyncService;
use App\Services\Notifications\ExpiringAccessNotifier;
use App\Services\WhatsApp\UltraMsgClient;
use App\Support\WhatsAppPhoneNormalizer;
use App\Models\Subscription;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('paypal:test-connection', function (PayPalClient $paypal): int {
    try {
        $token = $paypal->getAccessToken();
        $this->info('PayPal: conexión OK (modo '.config('paypal.mode').').');
        $this->line('Token (prefijo): '.substr($token, 0, 12).'…');

        return 0;
    } catch (Throwable $e) {
        $this->error($e->getMessage());

        return 1;
    }
})->purpose('Comprueba PAYPAL_CLIENT_ID / PAYPAL_SECRET contra la API de PayPal');

Artisan::command('ultramsg:test-send', function (UltraMsgClient $ultraMsg): int {
    try {
        $toRaw = '976709811';
        $to = WhatsAppPhoneNormalizer::toUltraMsgTo($toRaw) ?? $toRaw;
        $message = 'Prueba ORVAE por UltraMsg - '.now()->format('Y-m-d H:i:s');

        $ultraMsg->sendText($to, $message);

        $this->info('Mensaje de prueba enviado.');
        $this->line('Destino: '.$to.' (input: '.$toRaw.')');
        $this->line('Texto: '.$message);

        return 0;
    } catch (Throwable $e) {
        $this->error('Fallo al enviar: '.$e->getMessage());

        return 1;
    }
})->purpose('Envía WhatsApp de prueba a 976709811 por UltraMsg');

Artisan::command('subscriptions:sync-entitlements', function (SubscriptionEntitlementSyncService $sync): int {
    $count = 0;

    Subscription::query()
        ->with('items.catalogSku')
        ->orderBy('created_at')
        ->chunkById(100, function ($subscriptions) use ($sync, &$count): void {
            foreach ($subscriptions as $subscription) {
                if (! $subscription instanceof Subscription) {
                    continue;
                }
                $sync->sync($subscription);
                $count++;
            }
        });

    $this->info("Entitlements sincronizados para {$count} suscripciones.");

    return 0;
})->purpose('Sincroniza entitlements según estado de suscripciones');

Artisan::command('alerts:expiring-access', function (ExpiringAccessNotifier $notifier): int {
    $sent = $notifier->notifyExpiring(7);
    $this->info("Alertas de vencimiento enviadas: {$sent}");

    return 0;
})->purpose('Notifica accesos/suscripciones por vencer (7 días)');
