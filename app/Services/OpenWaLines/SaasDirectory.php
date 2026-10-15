<?php

declare(strict_types=1);

namespace App\Services\OpenWaLines;

use Illuminate\Support\Str;

/**
 * SaaS que ORVAE tiene integrados: los bloques de config/services.php con provision_url.
 * Conectado = provisión habilitada y con URL.
 */
final class SaasDirectory
{
    /**
     * @return array<string, string> clave => nombre visible
     */
    public function connected(): array
    {
        $connected = [];

        foreach ((array) config('services', []) as $key => $service) {
            if (! is_array($service) || ! array_key_exists('provision_url', $service)) {
                continue;
            }

            if (($service['enabled'] ?? false) && filled($service['provision_url'])) {
                $connected[(string) $key] = $this->label((string) $key);
            }
        }

        return $connected;
    }

    /**
     * Conectados más las claves ya asignadas que perdieron la conexión.
     *
     * @param  iterable<mixed>  $assigned
     * @return list<array{key: string, label: string, connected: bool}>
     */
    public function options(iterable $assigned = []): array
    {
        $options = [];

        foreach ($this->connected() as $key => $label) {
            $options[$key] = ['key' => $key, 'label' => $label, 'connected' => true];
        }

        foreach ($assigned as $key) {
            if (is_string($key) && $key !== '' && ! isset($options[$key])) {
                $options[$key] = ['key' => $key, 'label' => $this->label($key), 'connected' => false];
            }
        }

        return array_values($options);
    }

    private function label(string $key): string
    {
        $label = config("services.{$key}.label");

        return is_string($label) && $label !== '' ? $label : Str::headline($key);
    }
}
