<?php

declare(strict_types=1);

namespace App\Services\OpenWaLines;

use App\Models\OpenWaLine;
use App\Services\SalesHub\OutgoingEcho;
use Illuminate\Support\Carbon;

final class OpenWaLineManager
{
    public function __construct(
        private readonly OpenWaLinesClient $client,
        private readonly OutgoingEcho $echo,
    ) {}

    /**
     * Trae la sesión remota (la crea si no existe) y actualiza la línea local.
     *
     * @return array<string, mixed> sesión remota tal como la devuelve OpenWA
     */
    public function sync(OpenWaLine $line): array
    {
        $remote = $line->openwa_session_id
            ? $this->client->getSession($line->openwa_session_id)
            : null;

        $remote ??= $this->client->findSessionByName($line->session_name)
            ?? $this->client->createSession($line->session_name);

        $this->apply($line, $remote);

        return $remote;
    }

    /**
     * Estado para el panel; arranca la sesión si no tiene motor y devuelve el QR cuando lo hay.
     *
     * @return array{status: string, ready: bool, phone: string|null, qr_code: string|null, message: string|null}
     */
    public function connectionState(OpenWaLine $line): array
    {
        $remote = $this->sync($line);

        if ($line->isReady()) {
            return $this->state($line);
        }

        $engineLoaded = ($remote['engineLoaded'] ?? false) === true;

        if (! $engineLoaded || $line->status === 'failed') {
            try {
                if ($engineLoaded) {
                    $this->client->stopSession($line->openwa_session_id);
                }
                $this->apply($line, $this->client->startSession($line->openwa_session_id));
            } catch (OpenWaLinesException $e) {
                if (! $e->isBadRequest()) {
                    throw $e;
                }
            }

            return $this->state($line, message: 'Iniciando WhatsApp, el QR aparecerá en unos segundos…');
        }

        if ($line->status !== 'qr_ready') {
            return $this->state($line, message: $this->waitingMessage($line->status));
        }

        try {
            $qr = $this->client->getQrCode($line->openwa_session_id);
        } catch (OpenWaLinesException $e) {
            if ($e->isBadRequest()) {
                return $this->state($line, message: 'Generando el QR, espera unos segundos…');
            }

            throw $e;
        }

        $code = is_string($qr['qrCode'] ?? null) && $qr['qrCode'] !== '' ? $qr['qrCode'] : null;

        return $this->state($line, $code, $code === null ? 'Generando el QR, espera unos segundos…' : null);
    }

    /**
     * Arranca el motor de una línea ya vinculada si OpenWA lo tiene apagado (p. ej. tras reiniciar el contenedor).
     *
     * @return 'ok'|'iniciada'|'sin_vincular'
     */
    public function keepAlive(OpenWaLine $line): string
    {
        $remote = $this->sync($line);

        if (($remote['engineLoaded'] ?? false) === true) {
            return 'ok';
        }

        if ($line->connected_at === null) {
            return 'sin_vincular';
        }

        try {
            $this->apply($line, $this->client->startSession((string) $line->openwa_session_id));
        } catch (OpenWaLinesException $e) {
            if (! $e->isBadRequest()) {
                throw $e;
            }
        }

        return 'iniciada';
    }

    /**
     * Desvincula el número en WhatsApp; si la sesión no está en marcha solo la detiene.
     */
    public function disconnect(OpenWaLine $line): void
    {
        $remote = $this->sync($line);

        try {
            $remote = ($remote['engineLoaded'] ?? false) === true
                ? $this->client->logoutSession($line->openwa_session_id)
                : $remote;
        } catch (OpenWaLinesException $e) {
            // 502 = desvinculado localmente aunque WhatsApp no confirmó; la sesión queda caída igual.
            if ($e->status !== 502) {
                throw $e;
            }
        }

        $this->apply($line, array_merge($remote, ['status' => 'disconnected', 'phone' => null, 'pushName' => null]));
    }

    public function delete(OpenWaLine $line): void
    {
        $sessionId = $line->openwa_session_id
            ?? ($this->client->findSessionByName($line->session_name)['id'] ?? null);

        if (is_string($sessionId) && $sessionId !== '') {
            $this->client->deleteSession($sessionId);
        }

        $line->delete();
    }

    /**
     * Línea marcada para notificaciones; si ninguna lo está, la primera conectada.
     */
    public function notificationLine(): ?OpenWaLine
    {
        return OpenWaLine::query()
            ->orderByDesc('envia_notificaciones')
            ->orderByRaw('case when status = ? then 0 else 1 end', [OpenWaLine::STATUS_READY])
            ->orderBy('created_at')
            ->first();
    }

    public function sendText(OpenWaLine $line, string $chatId, string $text): void
    {
        if (! $line->isReady()) {
            $this->sync($line);
        }

        if (! $line->isReady() || ! $line->openwa_session_id) {
            throw new OpenWaLinesException(
                'La línea «'.$line->nombre.'» no está conectada. Entra a Panel → Ops → OpenWA y vincúlala con el QR.',
            );
        }

        $this->echo->remember($line->id, $chatId, $text);
        $this->client->sendText($line->openwa_session_id, $chatId, $text);
    }

    public function sendVoice(OpenWaLine $line, string $chatId, string $publicUrl): void
    {
        if (! $line->isReady() || ! $line->openwa_session_id) {
            throw new OpenWaLinesException('La línea «'.$line->nombre.'» no está conectada.');
        }

        $this->echo->remember($line->id, $chatId, '');
        $this->client->sendAudioUrl($line->openwa_session_id, $chatId, $publicUrl);
    }

    /**
     * @param  array<string, mixed>  $remote
     */
    private function apply(OpenWaLine $line, array $remote): void
    {
        $line->forceFill([
            'openwa_session_id' => (string) ($remote['id'] ?? $line->openwa_session_id),
            'status' => strtolower((string) ($remote['status'] ?? $line->status)),
            'phone' => $remote['phone'] ?? null,
            'push_name' => $remote['pushName'] ?? null,
            'connected_at' => filled($remote['connectedAt'] ?? null) ? Carbon::parse($remote['connectedAt']) : null,
            'last_error' => $remote['lastError'] ?? null,
            'last_synced_at' => now(),
        ])->save();
    }

    /**
     * @return array{status: string, ready: bool, phone: string|null, qr_code: string|null, message: string|null}
     */
    private function state(OpenWaLine $line, ?string $qrCode = null, ?string $message = null): array
    {
        return [
            'status' => $line->status,
            'ready' => $line->isReady(),
            'phone' => $line->phone,
            'qr_code' => $qrCode,
            'message' => $message ?? $line->last_error,
        ];
    }

    private function waitingMessage(string $status): string
    {
        return match ($status) {
            'authenticating' => 'QR escaneado, terminando de vincular…',
            'disconnected' => 'Reconectando con WhatsApp…',
            'action_required' => 'WhatsApp pide una acción en el teléfono. Revisa el celular.',
            default => 'Preparando WhatsApp, espera unos segundos…',
        };
    }
}
