<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OpenWaLine;
use App\Services\OpenWaLines\OpenWaLineManager;
use App\Services\OpenWaLines\OpenWaLinesClient;
use App\Services\OpenWaLines\OpenWaLinesException;
use App\Support\AdminFlashToast;
use App\Support\WhatsApp\WhatsAppChatId;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OpenWaLinesController extends Controller
{
    public function index(OpenWaLinesClient $client): Response
    {
        return Inertia::render('admin/operacion-openwa/index', [
            'configured' => $client->isConfigured(),
            'gatewayHost' => parse_url((string) config('openwa_lines.api_url'), PHP_URL_HOST),
            'storeUrl' => route('panel.operacion-openwa.store'),
            'products' => collect($this->products())
                ->map(fn (string $label, string $key) => ['key' => $key, 'label' => $label])
                ->values(),
            'lines' => OpenWaLine::query()
                ->orderBy('created_at')
                ->get()
                ->map(fn (OpenWaLine $line) => $this->present($line))
                ->values(),
        ]);
    }

    public function store(Request $request, OpenWaLinesClient $client, OpenWaLineManager $manager): RedirectResponse
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:80'],
            'session_name' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-z0-9-]+$/', Rule::unique('openwa_lines', 'session_name')],
            ...$this->productRules(),
        ], [
            'session_name.regex' => 'Usa solo minúsculas, números y guiones (ej. orvae-ventas).',
        ]);

        $line = OpenWaLine::query()->create([
            'nombre' => $data['nombre'],
            'session_name' => $data['session_name'],
            'productos' => array_values($data['productos'] ?? []),
        ]);

        if ($client->isConfigured()) {
            try {
                $manager->sync($line);
            } catch (OpenWaLinesException $e) {
                return back()->with('toast', AdminFlashToast::error(
                    'Línea creada, pero OpenWA no respondió',
                    $e->getMessage(),
                ));
            }
        }

        return back()->with('toast', AdminFlashToast::success(
            'Línea creada',
            'Pulsa «Vincular» para escanear el QR con el WhatsApp de esta línea.',
        ));
    }

    public function update(Request $request, OpenWaLine $line): RedirectResponse
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:80'],
            ...$this->productRules(),
        ]);

        $line->update([
            'nombre' => $data['nombre'],
            'productos' => array_values($data['productos'] ?? []),
        ]);

        return back()->with('toast', AdminFlashToast::success('Línea actualizada'));
    }

    public function destroy(OpenWaLine $line, OpenWaLineManager $manager): RedirectResponse
    {
        try {
            $manager->delete($line);
        } catch (OpenWaLinesException $e) {
            return back()->with('toast', AdminFlashToast::error('No se pudo eliminar la línea', $e->getMessage()));
        }

        return back()->with('toast', AdminFlashToast::success('Línea eliminada'));
    }

    public function connection(OpenWaLine $line, OpenWaLinesClient $client, OpenWaLineManager $manager): JsonResponse
    {
        abort_unless($client->isConfigured(), 503, 'OpenWA de ORVAE no está configurado en el servidor.');

        try {
            return response()->json($manager->connectionState($line));
        } catch (OpenWaLinesException $e) {
            $line->forceFill(['last_error' => $e->getMessage(), 'last_synced_at' => now()])->save();

            return response()->json(['error' => $e->getMessage()], 502);
        }
    }

    public function logout(OpenWaLine $line, OpenWaLineManager $manager): RedirectResponse
    {
        try {
            $manager->disconnect($line);
        } catch (OpenWaLinesException $e) {
            return back()->with('toast', AdminFlashToast::error('No se pudo desvincular', $e->getMessage()));
        }

        return back()->with('toast', AdminFlashToast::success(
            'WhatsApp desvinculado',
            'Para volver a usar esta línea, vincúlala de nuevo con el QR.',
        ));
    }

    public function sendTest(Request $request, OpenWaLine $line, OpenWaLineManager $manager): RedirectResponse
    {
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
            $manager->sendText($line, $chatId, $data['mensaje']);
        } catch (OpenWaLinesException $e) {
            return back()->with('toast', AdminFlashToast::error('Error al enviar', $e->getMessage()));
        }

        return back()->with('toast', AdminFlashToast::success('Mensaje enviado', 'La línea envió la prueba correctamente.'));
    }

    /**
     * @return array<string, string>
     */
    private function products(): array
    {
        return (array) config('openwa_lines.products', []);
    }

    /**
     * @return array<string, list<mixed>>
     */
    private function productRules(): array
    {
        return [
            'productos' => ['nullable', 'array'],
            'productos.*' => ['string', Rule::in(array_keys($this->products()))],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function present(OpenWaLine $line): array
    {
        return [
            'id' => $line->id,
            'nombre' => $line->nombre,
            'session_name' => $line->session_name,
            'status' => $line->status,
            'is_ready' => $line->isReady(),
            'phone' => $line->phone,
            'push_name' => $line->push_name,
            'productos' => $line->productos ?? [],
            'connected_at' => $line->connected_at?->toIso8601String(),
            'last_synced_at' => $line->last_synced_at?->toIso8601String(),
            'last_error' => $line->last_error,
            'routes' => [
                'update' => route('panel.operacion-openwa.update', $line),
                'destroy' => route('panel.operacion-openwa.destroy', $line),
                'connection' => route('panel.operacion-openwa.connection', $line),
                'logout' => route('panel.operacion-openwa.logout', $line),
                'test' => route('panel.operacion-openwa.test', $line),
            ],
        ];
    }
}
