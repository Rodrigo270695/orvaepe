<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformWhatsAppSession;
use App\Services\OpenWa\OpenWaClient;
use App\Services\OpenWa\PlatformWhatsAppMessenger;
use App\Services\OpenWa\PlatformWhatsAppSessionSync;
use App\Support\AdminFlashToast;
use App\Support\OpenWa\PlatformWhatsAppPresenter;
use App\Support\WhatsApp\WhatsAppChatId;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformWhatsAppController extends Controller
{
    public function index(PlatformWhatsAppPresenter $presenter): Response
    {
        return Inertia::render('admin/operacion-whatsapp/index', [
            'whatsapp' => $presenter->present(),
            'apiRoutes' => [
                'sync' => route('panel.operacion-whatsapp.sync'),
                'qr' => route('panel.operacion-whatsapp.qr'),
                'logout' => route('panel.operacion-whatsapp.logout'),
                'test' => route('panel.operacion-whatsapp.test'),
            ],
        ]);
    }

    public function sync(
        Request $request,
        PlatformWhatsAppSessionSync $sync,
        PlatformWhatsAppPresenter $presenter,
    ): RedirectResponse|JsonResponse {
        $session = $sync->ensure();

        if ($request->expectsJson()) {
            return response()->json([
                'whatsapp' => $presenter->present(),
            ]);
        }

        if ($session?->isReady()) {
            return back()->with('toast', AdminFlashToast::success(
                'WhatsApp conectado',
                'La sesión de Orvae está lista para enviar notificaciones.',
            ));
        }

        return back()->with('toast', AdminFlashToast::success(
            'Sesión sincronizada',
            'Escanea el código QR con tu WhatsApp para vincular el número.',
        ));
    }

    public function qr(
        OpenWaClient $client,
        PlatformWhatsAppSessionSync $sync,
    ): JsonResponse {
        abort_unless($client->isConfigured(), 503, 'OpenWA no está configurado en el servidor.');

        $session = $sync->ensure();
        abort_if($session === null, 422, 'No se pudo crear la sesión de WhatsApp de Orvae.');

        if (! $session->isReady()) {
            try {
                $remote = $client->getSession($session->openwa_session_id);
                $status = (string) ($remote['status'] ?? $session->status);

                if (in_array($status, ['created', 'disconnected', 'failed'], true)) {
                    $client->startSession($session->openwa_session_id);
                }
            } catch (\Throwable) {
                // Continúa e intenta obtener QR.
            }
        }

        $session = $sync->refresh($session);

        if ($session->isReady()) {
            return response()->json([
                'ready' => true,
                'phone' => $session->phone,
                'status' => $session->status,
            ]);
        }

        $qr = $client->getQrCode($session->openwa_session_id);

        return response()->json([
            'ready' => false,
            'status' => (string) ($qr['status'] ?? $session->status),
            'qr_code' => $qr['qrCode'] ?? null,
            'session_id' => $session->openwa_session_id,
        ]);
    }

    public function logout(PlatformWhatsAppSessionSync $sync): RedirectResponse
    {
        $session = PlatformWhatsAppSession::query()
            ->where('openwa_session_name', $sync->sessionName())
            ->first();

        abort_if($session === null || ! $session->isReady(), 422, 'No hay WhatsApp de Orvae conectado.');

        try {
            $sync->disconnect($session);
        } catch (\Throwable $e) {
            report($e);

            return back()->with('toast', AdminFlashToast::error(
                'No se pudo desvincular',
                'Intenta de nuevo en unos segundos.',
            ));
        }

        return back()->with('toast', AdminFlashToast::success(
            'WhatsApp desvinculado',
            'La sesión de Orvae fue cerrada correctamente.',
        ));
    }

    public function sendTest(
        Request $request,
        PlatformWhatsAppMessenger $messenger,
    ): RedirectResponse {
        $data = $request->validate([
            'destinatario' => ['required', 'string', 'max:30'],
            'mensaje' => ['required', 'string', 'max:1000'],
        ]);

        $chatId = WhatsAppChatId::fromPhone($data['destinatario']);
        if ($chatId === null) {
            return back()
                ->withErrors(['destinatario' => 'Ingresa un número válido (ej. 987654321 o 51987654321).'])
                ->withInput();
        }

        try {
            $messenger->sendText($chatId, $data['mensaje']);
        } catch (\Throwable $e) {
            report($e);

            return back()->with('toast', AdminFlashToast::error(
                'Error al enviar',
                $e->getMessage(),
            ));
        }

        return back()->with('toast', AdminFlashToast::success(
            'Mensaje enviado',
            'Prueba de WhatsApp enviada correctamente.',
        ));
    }
}
