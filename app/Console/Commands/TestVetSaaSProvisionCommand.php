<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\Checkout\VetSaaSPlanProvisioner;
use Illuminate\Console\Command;

/**
 * Reintenta la provisión VetSaaS de un pedido ya pagado (soporte / diagnóstico).
 */
class TestVetSaaSProvisionCommand extends Command
{
    protected $signature = 'orvae:test-vetsaas-provision
                            {order : UUID o número de pedido (order_number)}
                            {--dry : Solo muestra configuración, no llama a la API}';

    protected $description = 'Ejecuta VetSaaSPlanProvisioner para un pedido pagado (diagnóstico Orvae → VetSaaS)';

    public function handle(VetSaaSPlanProvisioner $provisioner): int
    {
        $ref = (string) $this->argument('order');

        $enabled = (bool) config('services.vetsaas.enabled');
        $url = trim((string) config('services.vetsaas.provision_url'));
        $secret = (string) config('services.vetsaas.hmac_secret');

        $this->line('VETSAAS_PROVISIONING_ENABLED: '.($enabled ? 'true' : 'false'));
        $this->line('VETSAAS_PROVISION_URL: '.($url !== '' ? $url : '(vacío)'));
        $this->line('VETSAAS_PROVISION_HMAC_SECRET: '.($secret !== '' ? '***configurado***' : '(vacío)'));

        if (! $enabled || $url === '' || $secret === '') {
            $this->error('Configura VETSAAS_* en .env antes de provisionar.');

            return self::FAILURE;
        }

        if ($this->option('dry')) {
            return self::SUCCESS;
        }

        $order = $this->findOrder($ref);

        if ($order === null) {
            $this->error("Pedido no encontrado: {$ref}");

            return self::FAILURE;
        }

        if ($order->status !== Order::STATUS_PAID) {
            $this->warn("El pedido {$order->order_number} no está en estado paid (actual: {$order->status}).");
        }

        $sku = $order->lines->first()?->sku;
        if ($sku === null) {
            $this->error('El pedido no tiene líneas con SKU.');

            return self::FAILURE;
        }

        $this->info("Provisionando pedido {$order->order_number}…");
        $provisioner->provision($order, $sku);

        $snapshot = is_array($order->fresh()->billing_snapshot) ? $order->fresh()->billing_snapshot : [];
        $loginUrl = $snapshot['vetsaas_login_url'] ?? null;

        if (is_string($loginUrl) && $loginUrl !== '') {
            $this->info("OK — login_url: {$loginUrl}");

            return self::SUCCESS;
        }

        if (isset($snapshot['vetsaas_provision_skipped'])) {
            $this->error('Provisión omitida: '.$snapshot['vetsaas_provision_skipped']);
        }

        if (isset($snapshot['vetsaas_provision_error']) && is_array($snapshot['vetsaas_provision_error'])) {
            $err = $snapshot['vetsaas_provision_error'];
            $this->error('Error API VetSaaS HTTP '.($err['http_status'] ?? '?'));
            $this->line((string) ($err['body'] ?? ''));
        }

        $this->warn('Sin vetsaas_login_url en billing_snapshot. Revisa storage/logs/laravel.log (vetsaas.provision_*).');

        return self::FAILURE;
    }

    private function findOrder(string $ref): ?Order
    {
        $query = Order::query()->with(['user', 'lines.sku', 'payments']);

        if ($this->looksLikeUuid($ref)) {
            return $query->where('id', $ref)->first();
        }

        return $query->where('order_number', $ref)->first();
    }

    private function looksLikeUuid(string $value): bool
    {
        return preg_match(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $value,
        ) === 1;
    }
}
