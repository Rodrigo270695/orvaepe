<?php

use App\Models\Subscription;
use App\Services\Access\SubscriptionEntitlementSyncService;
use App\Services\Notifications\ExpiringAccessNotifier;
use App\Services\OpenWa\PlatformWhatsAppSessionSync;
use App\Services\Payments\CulqiClient;
use App\Services\Payments\MercadoPagoClient;
use App\Services\Payments\PayPalClient;
use App\Services\WhatsApp\OrvaeWhatsAppSender;
use App\Services\WhatsApp\UltraMsgClient;
use App\Support\WhatsAppPhoneNormalizer;
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

Artisan::command('mercadopago:test-connection', function (MercadoPagoClient $mp): int {
    try {
        // Hacemos una llamada ligera para validar el access token.
        // Usamos un ID obviamente inválido solo para comprobar autenticación.
        $mp->getPayment('test-connection-invalid-id');

        return 0;
    } catch (RuntimeException $e) {
        // Si la autenticación es válida, Mercado Pago responderá 404 (u otro error de recurso),
        // pero nuestro cliente ya habrá lanzado una RuntimeException con el mensaje HTTP.
        // Consideramos conexión OK si el mensaje NO es por falta de token.
        if (str_contains($e->getMessage(), 'Configura MP_ACCESS_TOKEN')) {
            $this->error($e->getMessage());

            return 1;
        }

        $this->info('Mercado Pago: conexión OK (access token configurado).');
        $this->line('Detalle de respuesta: '.substr($e->getMessage(), 0, 120).'…');

        return 0;
    } catch (Throwable $e) {
        $this->error($e->getMessage());

        return 1;
    }
})->purpose('Comprueba MP_ACCESS_TOKEN contra la API de Mercado Pago');

Artisan::command('culqi:test-connection', function (CulqiClient $culqi): int {
    try {
        $culqi->ping();
        $this->info('Culqi: conexión OK (secret key configurada).');

        return 0;
    } catch (Throwable $e) {
        $this->error($e->getMessage());

        return 1;
    }
})->purpose('Comprueba CULQI_SECRET_KEY contra la API de Culqi');

Artisan::command('openwa:test-send', function (OrvaeWhatsAppSender $sender): int {
    try {
        $status = $sender->status();
        $this->line('Estado: '.$status['detail']);

        $toRaw = (string) config('openwa.admin_notification_number', '976709811');
        $message = 'Prueba ORVAE por OpenWA - '.now()->format('Y-m-d H:i:s');

        $sender->sendText($toRaw, $message);

        $via = $sender->prefersOpenWa() ? 'OpenWA' : 'UltraMsg';
        $this->info('Mensaje de prueba enviado vía '.$via.'.');
        $this->line('Destino: '.$toRaw);

        return 0;
    } catch (Throwable $e) {
        $this->error('Fallo al enviar: '.$e->getMessage());

        if (! (bool) config('openwa.enabled')) {
            $this->warn('Agrega OPENWA_ENABLED=true y OPENWA_API_KEY en /var/www/orvaepe/.env');
        }

        return 1;
    }
})->purpose('Envía WhatsApp de prueba (OpenWA; UltraMsg solo si OPENWA_ENABLED=false)');

Artisan::command('openwa:reset-platform', function (PlatformWhatsAppSessionSync $sync): int {
    if (! (bool) config('openwa.enabled')) {
        $this->error('OPENWA_ENABLED=false. Actívalo en .env primero.');

        return 1;
    }

    try {
        $session = $sync->reset();
    } catch (Throwable $e) {
        $this->error('Fallo al reiniciar: '.$e->getMessage());

        return 1;
    }

    if ($session === null) {
        $this->error('No se pudo reiniciar. Revisa OPENWA_API_KEY / OPENWA_API_URL.');

        return 1;
    }

    $this->info('Sesión reiniciada: '.$session->openwa_session_name.' ('.$session->openwa_session_id.')');
    $this->line('Estado: '.$session->status);
    $this->comment('Entra al panel → Vincular WhatsApp y escanea el QR.');

    return 0;
})->purpose('Reinicia la sesión OpenWA de plataforma Orvae (borra/recrea para nuevo QR)');

Artisan::command('ultramsg:test-send', function (UltraMsgClient $ultraMsg): int {
    try {
        $toRaw = '976709811';
        $to = WhatsAppPhoneNormalizer::toUltraMsgTo($toRaw) ?? $toRaw;
        $message = 'Prueba ORVAE por UltraMsg - '.now()->format('Y-m-d H:i:s');

        $ultraMsg->sendText($to, $message);

        $this->info('Mensaje de prueba enviado.');
        $this->line('Destino: '.$to.' (input: '.$toRaw.')');

        return 0;
    } catch (Throwable $e) {
        $this->error('Fallo al enviar: '.$e->getMessage());

        return 1;
    }
})->purpose('Envía WhatsApp de prueba por UltraMsg (legacy)');

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
