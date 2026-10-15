<?php

namespace Database\Seeders;

use App\Models\WaChannel;
use App\Models\WaTemplate;
use Illuminate\Database\Seeder;

/**
 * Plantillas globales (aprobadas en la WABA de ORVAE) y canal inicial de ORVAE.
 * El token solo se lee de WHATSAPP_ACCESS_TOKEN_DEFAULT y se guarda cifrado.
 * Idempotente: se puede volver a correr para rotar el token.
 */
class WhatsAppCloudSeeder extends Seeder
{
    public function run(): void
    {
        $default = (array) config('whatsapp_cloud.default_channel', []);
        $wabaId = trim((string) ($default['waba_id'] ?? '')) ?: null;
        $idioma = (string) config('whatsapp_cloud.template_language', 'es_PE');

        foreach ((array) config('whatsapp_cloud.templates', []) as $nombre => $definition) {
            WaTemplate::query()->updateOrCreate(
                ['tenant_id' => null, 'nombre' => $nombre, 'idioma' => $idioma],
                [
                    'producto' => null,
                    'waba_id' => $wabaId,
                    'tipo' => (string) $definition['tipo'],
                    'estado' => WaTemplate::ESTADO_APROBADA,
                    'categoria' => (string) ($definition['categoria'] ?? 'utility'),
                    'num_variables' => (int) $definition['variables'],
                    'cuerpo' => $definition['cuerpo'] ?? null,
                ],
            );
        }

        $tenantId = trim((string) ($default['tenant_id'] ?? ''));
        $phoneNumberId = trim((string) ($default['phone_number_id'] ?? ''));
        $token = trim((string) ($default['access_token'] ?? ''));

        if ($tenantId === '' || $phoneNumberId === '' || $token === '') {
            $this->command?->warn('Canal inicial omitido: define WHATSAPP_DEFAULT_TENANT_ID y WHATSAPP_ACCESS_TOKEN_DEFAULT en .env.');

            return;
        }

        WaChannel::query()->updateOrCreate(
            [
                'producto' => (string) ($default['producto'] ?? WaChannel::PRODUCTO_VETSAAS),
                'tenant_id' => $tenantId,
            ],
            [
                'phone_number_id' => $phoneNumberId,
                'provider' => WaChannel::PROVIDER_CLOUD,
                'waba_id' => $wabaId,
                'access_token' => $token,
                'estado' => WaChannel::ESTADO_ACTIVO,
            ],
        );

        $this->command?->info("Canal WhatsApp Cloud listo para el tenant {$tenantId}.");
    }
}
