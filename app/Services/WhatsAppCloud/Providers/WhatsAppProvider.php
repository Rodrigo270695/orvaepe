<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud\Providers;

use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Services\WhatsAppCloud\WhatsAppCloudException;

/**
 * Proveedor de envío de un canal (wa_channels.provider). Pasar un tenant de OpenWA a
 * Cloud API es solo cambiar ese campo.
 */
interface WhatsAppProvider
{
    /**
     * Envía la plantilla del mensaje ya registrado.
     *
     * @param  list<string>  $variables
     * @return string|null id del mensaje en el proveedor (wamid en Cloud API)
     *
     * @throws WhatsAppCloudException temporary=true si conviene reintentar
     */
    public function sendTemplate(WaChannel $channel, WaMessage $message, array $variables): ?string;

    /**
     * Traduce el payload del webhook del proveedor a eventos normalizados.
     *
     * @param  array<string, mixed>  $payload
     * @return list<ProviderEvent>
     */
    public function parseWebhook(array $payload): array;
}
