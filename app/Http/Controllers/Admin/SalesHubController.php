<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalesHubConversation;
use App\Models\SalesHubProduct;
use App\Models\SalesHubSection;
use App\Services\OpenWaLines\SaasDirectory;
use App\Services\SalesHub\ConversationDirectory;
use App\Services\SalesHub\SaasKnowledgeClient;
use App\Services\SalesHub\SalesKnowledge;
use App\Support\AdminFlashToast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Centro de Ventas: conocimiento con el que vende el bot (por SaaS) y conversaciones atendidas.
 */
class SalesHubController extends Controller
{
    public function index(
        Request $request,
        SaasDirectory $saas,
        SaasKnowledgeClient $remote,
        ConversationDirectory $conversations,
    ): Response {
        $products = $saas->connected();
        $tab = $request->query('tab') === 'conversaciones' ? 'conversaciones' : 'conocimiento';
        $producto = (string) $request->query('producto', '');
        $producto = array_key_exists($producto, $products) ? $producto : (string) array_key_first($products);

        $filtro = (string) $request->query('filtro', '');
        $filtro = array_key_exists($filtro, $products) ? $filtro : null;
        $estado = (string) $request->query('estado', 'todos');
        $estado = in_array($estado, ConversationDirectory::ESTADOS, true) ? $estado : 'todos';
        $search = (string) $request->query('search', '');

        $page = $conversations->paginate($filtro, $search, $estado);

        return Inertia::render('admin/centro-ventas/index', [
            'tab' => $tab,
            'products' => collect($products)->map(fn (string $label, string $key): array => [
                'key' => $key,
                'label' => $label,
                'editado' => SalesHubProduct::query()->where('producto', $key)->exists(),
                'secciones' => SalesHubSection::query()->where('producto', $key)->count(),
            ])->values(),
            'knowledge' => $producto !== '' ? $this->knowledge($producto, $remote) : null,
            'conversations' => [
                'data' => collect($page->items())->map(fn (SalesHubConversation $c): array => [
                    ...$conversations->present($c),
                    'routes' => [
                        'show' => route('panel.centro-ventas.conversacion', $c),
                        'pausar' => route('panel.centro-ventas.pausar', $c),
                        'reanudar' => route('panel.centro-ventas.reanudar', $c),
                    ],
                ])->values(),
                'meta' => ['total' => $page->total(), 'page' => $page->currentPage(), 'last_page' => $page->lastPage()],
                'stats' => $conversations->stats($filtro),
                'filters' => ['producto' => $filtro, 'estado' => $estado, 'search' => $search],
            ],
            'routes' => [
                'index' => route('panel.centro-ventas.index'),
            ],
        ]);
    }

    public function updateProduct(Request $request, string $producto, SaasDirectory $saas): RedirectResponse
    {
        $this->ensureProduct($producto, $saas);

        $data = $request->validate([
            'nombre' => ['nullable', 'string', 'max:120'],
            'resumen' => ['nullable', 'string', 'max:2000'],
            'publico' => ['nullable', 'string', 'max:500'],
            'palabras_clave' => ['nullable', 'string', 'max:2000'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'demo_usuario' => ['nullable', 'string', 'max:120'],
            'demo_password' => ['nullable', 'string', 'max:120'],
            'registro_url' => ['nullable', 'url', 'max:255'],
            'instrucciones' => ['nullable', 'string', 'max:4000'],
        ]);

        $data['palabras_clave'] = collect(preg_split('/[,\n]+/', (string) ($data['palabras_clave'] ?? '')) ?: [])
            ->map(fn (string $k): string => mb_substr(trim($k), 0, 60))
            ->filter()
            ->unique()
            ->take(50)
            ->values()
            ->all();

        SalesHubProduct::query()->updateOrCreate(['producto' => $producto], $data);

        return back()->with('toast', AdminFlashToast::success('Conocimiento guardado', 'El bot ya responde con estos datos.'));
    }

    public function storeSection(Request $request, string $producto, SaasDirectory $saas): RedirectResponse
    {
        $this->ensureProduct($producto, $saas);

        $data = $this->validateSection($request);
        $data['orden'] = (int) SalesHubSection::query()->where('producto', $producto)->max('orden') + 1;

        SalesHubSection::query()->create(['producto' => $producto, ...$data]);

        return back()->with('toast', AdminFlashToast::success('Bloque agregado'));
    }

    public function updateSection(Request $request, SalesHubSection $section): RedirectResponse
    {
        $section->update($this->validateSection($request));

        return back()->with('toast', AdminFlashToast::success('Bloque actualizado'));
    }

    public function destroySection(SalesHubSection $section): RedirectResponse
    {
        $section->delete();

        return back()->with('toast', AdminFlashToast::success('Bloque eliminado'));
    }

    public function import(string $producto, SaasDirectory $saas, SalesKnowledge $knowledge): RedirectResponse
    {
        $this->ensureProduct($producto, $saas);

        $result = $knowledge->importFromSaas($producto);

        if ($result === null) {
            return back()->with('toast', AdminFlashToast::error('El SaaS no respondió', 'Revisa que publique su conocimiento (saas:knowledge).'));
        }

        return back()->with('toast', AdminFlashToast::success(
            'Importado del SaaS',
            "{$result['campos']} campos y {$result['secciones']} bloques nuevos. Lo que ya tenías en ORVAE no se tocó.",
        ));
    }

    public function conversation(SalesHubConversation $conversation, ConversationDirectory $directory): JsonResponse
    {
        $conversation->load(['line:id,nombre', 'latestMessage']);

        if ($conversation->no_leidos > 0) {
            $conversation->forceFill(['no_leidos' => 0])->save();
        }

        return response()->json([
            'conversation' => $directory->present($conversation),
            'messages' => $directory->messages($conversation),
        ]);
    }

    public function pause(SalesHubConversation $conversation): RedirectResponse
    {
        $conversation->pause(SalesHubConversation::PAUSA_MANUAL, 'pausa manual');

        return back()->with('toast', AdminFlashToast::success('Bot pausado', 'Ahora respondes tú desde el WhatsApp.'));
    }

    public function resume(SalesHubConversation $conversation): RedirectResponse
    {
        $conversation->resume();

        return back()->with('toast', AdminFlashToast::success('Bot reactivado'));
    }

    /**
     * @return array<string, mixed>
     */
    private function knowledge(string $producto, SaasKnowledgeClient $remote): array
    {
        $local = SalesHubProduct::query()->where('producto', $producto)->first();
        $saas = $remote->get($producto);

        return [
            'producto' => $producto,
            'saas_ok' => $saas !== null,
            'saas_obtenido_at' => $saas['obtenido_at'] ?? null,
            'planes' => $saas['planes'] ?? [],
            'saas_secciones' => count($saas['secciones'] ?? []),
            'form' => [
                'nombre' => $local->nombre ?? '',
                'resumen' => $local->resumen ?? '',
                'publico' => $local->publico ?? '',
                'palabras_clave' => implode(', ', $local->palabras_clave ?? []),
                'demo_url' => $local->demo_url ?? '',
                'demo_usuario' => $local->demo_usuario ?? '',
                'demo_password' => $local->demo_password ?? '',
                'registro_url' => $local->registro_url ?? '',
                'instrucciones' => $local->instrucciones ?? '',
            ],
            'placeholders' => [
                'nombre' => $saas['nombre'] ?? null,
                'resumen' => $saas['resumen'] ?? null,
                'publico' => $saas['publico'] ?? null,
                'palabras_clave' => implode(', ', $saas['palabras_clave'] ?? []),
                'demo_url' => $saas['demo']['url'] ?? null,
                'registro_url' => $saas['registro_url'] ?? null,
            ],
            'sections' => SalesHubSection::query()
                ->where('producto', $producto)
                ->orderBy('orden')
                ->orderBy('id')
                ->get()
                ->map(fn (SalesHubSection $s): array => [
                    'id' => $s->id,
                    'tipo' => $s->tipo,
                    'titulo' => $s->titulo,
                    'contenido' => $s->contenido,
                    'activo' => $s->activo,
                    'routes' => [
                        'update' => route('panel.centro-ventas.bloques.update', $s),
                        'destroy' => route('panel.centro-ventas.bloques.destroy', $s),
                    ],
                ])
                ->values(),
            'routes' => [
                'update' => route('panel.centro-ventas.producto', $producto),
                'importar' => route('panel.centro-ventas.importar', $producto),
                'bloques' => route('panel.centro-ventas.bloques.store', $producto),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validateSection(Request $request): array
    {
        return $request->validate([
            'tipo' => ['required', Rule::in(SalesHubSection::TIPOS)],
            'titulo' => ['required', 'string', 'max:200'],
            'contenido' => ['required', 'string', 'max:4000'],
            'activo' => ['boolean'],
        ]);
    }

    private function ensureProduct(string $producto, SaasDirectory $saas): void
    {
        abort_unless(array_key_exists($producto, $saas->connected()), 404);
    }
}
