<?php

use App\Models\OpenWaLine;
use App\Models\SalesHubConversation;
use App\Models\Subscription;
use App\Services\Access\SubscriptionEntitlementSyncService;
use App\Services\Notifications\ExpiringAccessNotifier;
use App\Services\OpenWaLines\OpenWaLineManager;
use App\Services\OpenWaLines\SaasDirectory;
use App\Services\Payments\CulqiClient;
use App\Services\Payments\MercadoPagoClient;
use App\Services\Payments\PayPalClient;
use App\Services\SalesHub\SaasKnowledgeClient;
use App\Services\SalesHub\WebhookRegistrar;
use App\Services\WhatsApp\OrvaeWhatsAppSender;
use App\Services\WhatsApp\UltraMsgClient;
use App\Support\WhatsAppPhoneNormalizer;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

Artisan::command('saleshub:bot {linea : Nombre, session_name o id de la línea} {estado : on|off}', function (WebhookRegistrar $webhooks): int {
    $ref = (string) $this->argument('linea');
    $line = OpenWaLine::query()
        ->where(fn ($q) => $q->where('session_name', $ref)->orWhere('nombre', $ref)->when(Str::isUuid($ref), fn ($q) => $q->orWhere('id', $ref)))
        ->first();

    if ($line === null) {
        $this->error("No existe la línea «{$ref}».");

        return 1;
    }

    $on = strtolower((string) $this->argument('estado')) === 'on';

    if ($on) {
        try {
            $this->line('Webhook '.$webhooks->ensure($line).': '.$webhooks->url($line));
        } catch (Throwable $e) {
            $this->error('No se pudo registrar el webhook: '.$e->getMessage());

            return 1;
        }
    }

    $line->forceFill(['bot_activo' => $on])->save();
    $this->info('Bot '.($on ? 'ENCENDIDO' : 'APAGADO')." en «{$line->nombre}».");

    if ($on && ! config('saleshub.enabled')) {
        $this->warn('SALESHUB_BOT_ENABLED=false: el bot no responderá hasta activarlo en el .env.');
    }

    return 0;
})->purpose('Enciende o apaga el bot de ventas IA en una línea OpenWA');

Artisan::command('openwa-lines:keepalive', function (OpenWaLineManager $lines): int {
    foreach (OpenWaLine::query()->orderBy('nombre')->get() as $line) {
        try {
            $estado = $lines->keepAlive($line);
        } catch (Throwable $e) {
            $estado = 'error: '.$e->getMessage();
        }

        if ($estado !== 'ok') {
            Log::warning('openwa_lines.keepalive', ['line' => $line->nombre, 'estado' => $estado]);
        }
        $this->line("{$line->nombre}: {$estado}");
    }

    return 0;
})->purpose('Vuelve a arrancar las líneas OpenWA vinculadas que quedaron apagadas');

Artisan::command('saleshub:webhooks', function (WebhookRegistrar $webhooks): int {
    $rows = [];

    foreach (OpenWaLine::query()->orderBy('nombre')->get() as $line) {
        try {
            $estado = $webhooks->ensure($line);
        } catch (Throwable $e) {
            $estado = 'error: '.$e->getMessage();
        }
        $rows[] = [$line->nombre, $line->bot_activo ? 'sí' : 'no', $estado];
    }

    $this->table(['Línea', 'Bot', 'Webhook'], $rows);

    return 0;
})->purpose('Registra en OpenWA el webhook de mensajes de cada línea de ORVAE');

Artisan::command('saleshub:pause {telefono} {--resume : Reanuda el bot en vez de pausarlo}', function (): int {
    $digits = preg_replace('/\D/', '', (string) $this->argument('telefono')) ?? '';
    $conversations = SalesHubConversation::query()->where('phone', 'like', '%'.$digits)->get();

    if ($digits === '' || $conversations->isEmpty()) {
        $this->error('No hay conversaciones con ese teléfono.');

        return 1;
    }

    foreach ($conversations as $conversation) {
        $this->option('resume')
            ? $conversation->resume()
            : $conversation->pause(SalesHubConversation::PAUSA_MANUAL, 'pausa manual');
    }

    $this->info(($this->option('resume') ? 'Reanudadas' : 'Pausadas').": {$conversations->count()} conversación(es).");

    return 0;
})->purpose('Pausa (o reanuda con --resume) el bot de ventas para un teléfono');
