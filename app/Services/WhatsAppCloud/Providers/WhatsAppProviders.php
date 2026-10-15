<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud\Providers;

use App\Models\WaChannel;
use App\Services\WhatsAppCloud\WhatsAppCloudException;

/**
 * Resuelve el adaptador según wa_channels.provider.
 */
final class WhatsAppProviders
{
    /** @var array<string, class-string<WhatsAppProvider>> */
    private const MAP = [
        WaChannel::PROVIDER_CLOUD => CloudApiProvider::class,
        WaChannel::PROVIDER_OPENWA => OpenWAProvider::class,
    ];

    public function for(WaChannel $channel): WhatsAppProvider
    {
        $class = self::MAP[$channel->provider] ?? null;

        if ($class === null) {
            throw new WhatsAppCloudException('Proveedor no soportado: '.$channel->provider, 'provider_not_supported');
        }

        return app($class);
    }

    public function cloud(): WhatsAppProvider
    {
        return app(CloudApiProvider::class);
    }
}
