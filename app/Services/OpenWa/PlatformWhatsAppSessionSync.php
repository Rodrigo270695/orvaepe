<?php

declare(strict_types=1);

namespace App\Services\OpenWa;

use App\Models\PlatformWhatsAppSession;
use Illuminate\Support\Carbon;

final class PlatformWhatsAppSessionSync
{
    public function __construct(
        private readonly OpenWaClient $client,
    ) {}

    public function sessionName(): string
    {
        return trim((string) config('openwa.platform_session_name', 'orvae-platform'));
    }

    public function ensure(): ?PlatformWhatsAppSession
    {
        if (! $this->client->isConfigured()) {
            return null;
        }

        $name = $this->sessionName();
        if ($name === '') {
            return null;
        }

        $local = PlatformWhatsAppSession::query()
            ->where('openwa_session_name', $name)
            ->first();

        try {
            $remote = $this->client->findSessionByName($name)
                ?? $this->client->createSession($name);
        } catch (\Throwable $e) {
            if ($local instanceof PlatformWhatsAppSession) {
                $local->forceFill([
                    'last_error' => $e->getMessage(),
                    'last_synced_at' => now(),
                ])->save();
            }

            return $local;
        }

        $sessionId = (string) ($remote['id'] ?? '');
        if ($sessionId === '') {
            return $local;
        }

        $phone = isset($remote['phone']) ? (string) $remote['phone'] : null;
        $payload = [
            'openwa_session_id' => $sessionId,
            'openwa_session_name' => (string) ($remote['name'] ?? $name),
            'status' => self::normalizeStatus($remote['status'] ?? null, $phone),
            'phone' => $phone,
            'push_name' => isset($remote['pushName']) ? (string) $remote['pushName'] : null,
            'connected_at' => filled($remote['connectedAt'] ?? null)
                ? Carbon::parse($remote['connectedAt'])
                : null,
            'last_synced_at' => now(),
            'last_error' => null,
        ];

        if ($local instanceof PlatformWhatsAppSession) {
            $local->forceFill($payload)->save();

            return $local->fresh();
        }

        return PlatformWhatsAppSession::query()->create($payload);
    }

    public function refresh(PlatformWhatsAppSession $session): PlatformWhatsAppSession
    {
        $remote = $this->client->getSession($session->openwa_session_id);

        $phone = isset($remote['phone'])
            ? (string) $remote['phone']
            : $session->phone;

        $session->forceFill([
            'status' => self::normalizeStatus($remote['status'] ?? $session->status, $phone),
            'phone' => $phone,
            'push_name' => isset($remote['pushName']) ? (string) $remote['pushName'] : $session->push_name,
            'connected_at' => filled($remote['connectedAt'] ?? null)
                ? Carbon::parse($remote['connectedAt'])
                : $session->connected_at,
            'last_synced_at' => now(),
            'last_error' => null,
        ])->save();

        return $session->fresh();
    }

    /**
     * Unifica status del gateway OpenWA (WORKING, SCAN_QR_CODE, etc.) al modelo Orvae.
     */
    public static function normalizeStatus(mixed $status, ?string $phone = null): string
    {
        $raw = strtolower(trim((string) $status));
        $raw = str_replace(['-', ' '], '_', $raw);

        if (in_array($raw, ['ready', 'working', 'connected', 'authenticated', 'open', 'online'], true)) {
            return PlatformWhatsAppSession::STATUS_READY;
        }

        if (in_array($raw, ['scan_qr_code', 'qr', 'qrcode', 'qr_ready', 'need_qr'], true)) {
            return 'qr_ready';
        }

        if (in_array($raw, ['starting', 'initializing', 'authenticating'], true)) {
            return 'initializing';
        }

        if (in_array($raw, ['stopped', 'disconnected', 'logout', 'logged_out'], true)) {
            return 'disconnected';
        }

        if ($raw === 'failed' || $raw === 'error') {
            return 'failed';
        }

        // Si hay teléfono vinculado, casi seguro está lista aunque el status sea raro.
        if (filled($phone) && ! in_array($raw, ['created', 'disconnected', 'failed', 'stopped'], true)) {
            return PlatformWhatsAppSession::STATUS_READY;
        }

        return $raw !== '' ? $raw : 'created';
    }

    public function disconnect(PlatformWhatsAppSession $session): PlatformWhatsAppSession
    {
        try {
            $this->client->stopSession($session->openwa_session_id);
            $remote = $this->client->getSession($session->openwa_session_id);

            $session->forceFill([
                'status' => (string) ($remote['status'] ?? 'disconnected'),
                'phone' => null,
                'push_name' => null,
                'connected_at' => null,
                'last_synced_at' => now(),
                'last_error' => null,
            ])->save();
        } catch (\Throwable $e) {
            $session->forceFill([
                'last_error' => $e->getMessage(),
                'last_synced_at' => now(),
            ])->save();

            throw $e;
        }

        return $session->fresh();
    }

    /**
     * Fuerza recrear la sesión remota (útil cuando el QR da 500 o el ID quedó huérfano).
     */
    public function reset(): ?PlatformWhatsAppSession
    {
        if (! $this->client->isConfigured()) {
            return null;
        }

        $name = $this->sessionName();
        if ($name === '') {
            return null;
        }

        $local = PlatformWhatsAppSession::query()
            ->where('openwa_session_name', $name)
            ->first();

        $remoteIds = [];
        if ($local?->openwa_session_id) {
            $remoteIds[] = $local->openwa_session_id;
        }

        try {
            $byName = $this->client->findSessionByName($name);
            if (is_array($byName) && filled($byName['id'] ?? null)) {
                $remoteIds[] = (string) $byName['id'];
            }
        } catch (\Throwable) {
            // Continúa con lo que tengamos.
        }

        foreach (array_unique($remoteIds) as $remoteId) {
            try {
                $this->client->stopSession($remoteId);
            } catch (\Throwable) {
                // ignore
            }
            try {
                $this->client->deleteSession($remoteId);
            } catch (\Throwable) {
                // ignore
            }
        }

        if ($local instanceof PlatformWhatsAppSession) {
            $local->forceFill([
                'status' => 'disconnected',
                'phone' => null,
                'push_name' => null,
                'connected_at' => null,
                'last_synced_at' => now(),
                'last_error' => null,
            ])->save();
        }

        $session = $this->ensure();
        if ($session === null) {
            return null;
        }

        try {
            if (! $session->isReady()) {
                $this->client->startSession($session->openwa_session_id);
                try {
                    $session = $this->refresh($session);
                } catch (\Throwable) {
                    // Si ya está iniciada, el refresh puede seguir; no bloqueamos.
                }
            }
        } catch (\Throwable $e) {
            // "already started" ya se traga en el cliente; otros errores sí se guardan.
            $session->forceFill([
                'last_error' => $e->getMessage(),
                'last_synced_at' => now(),
            ])->save();
        }

        // Limpia errores viejos de "already started" tras un reset exitoso.
        if ($session->last_error && str_contains(strtolower((string) $session->last_error), 'already started')) {
            $session->forceFill([
                'last_error' => null,
                'last_synced_at' => now(),
            ])->save();
        }

        return $session->fresh();
    }
}
