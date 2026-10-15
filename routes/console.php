<?php

use App\Models\Subscription;
use App\Services\Access\SubscriptionEntitlementSyncService;
use App\Services\Notifications\ExpiringAccessNotifier;
use App\Services\OpenWaLines\SaasDirectory;
use App\Services\Payments\CulqiClient;
use App\Services\Payments\MercadoPagoClient;
use App\Services\Payments\PayPalClient;
use App\Services\SalesHub\SaasKnowledgeClient;
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

        $toRaw = (string) config('openwa_lines.admin_notification_number', '976709811');
        $message = 'Prueba ORVAE por OpenWA - '.now()->format('Y-m-d H:i:s');

        $sender->sendText($toRaw, $message);

        $via = $sender->usesOpenWa() ? 'OpenWA' : 'UltraMsg';
        $this->info('Mensaje de prueba enviado vía '.$via.'.');
        $this->line('Destino: '.$toRaw);

        return 0;
    } catch (Throwable $e) {
        $this->error('Fallo al enviar: '.$e->getMessage());

        if (! $sender->usesOpenWa()) {
            $this->warn('Agrega ORVAE_OPENWA_ENABLED=true y ORVAE_OPENWA_API_KEY en /var/www/orvaepe/.env');
        }

        return 1;
    }
})->purpose('Envía WhatsApp de prueba por la línea OpenWA de notificaciones (UltraMsg si ORVAE_OPENWA_ENABLED=false)');

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

Artisan::command('saas:knowledge {producto?} {--refresh : Ignora la caché y vuelve a consultar al SaaS}', function (SaasKnowledgeClient $client, SaasDirectory $saas): int {
    $productos = $this->argument('producto') ? [(string) $this->argument('producto')] : array_keys($saas->connected());

    if ($productos === []) {
        $this->warn('No hay SaaS conectados (services.*.enabled + provision_url).');

        return 1;
    }

    $rows = [];
    foreach ($productos as $producto) {
        if ($this->option('refresh')) {
            $client->forget($producto);
        }

        $knowledge = $client->get($producto);
        $rows[] = [
            $producto,
            $client->url($producto) ?? '—',
            $knowledge === null ? 'sin datos' : 'ok',
            $knowledge === null ? 0 : count($knowledge['planes']),
            $knowledge === null ? 0 : count($knowledge['secciones']),
            $knowledge['obtenido_at'] ?? '—',
        ];
    }

    $this->table(['SaaS', 'URL', 'Estado', 'Planes', 'Secciones', 'Obtenido'], $rows);

    return 0;
})->purpose('Muestra el conocimiento de ventas que publica cada SaaS conectado');
