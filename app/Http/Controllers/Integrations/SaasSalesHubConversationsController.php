<?php

declare(strict_types=1);

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Models\SalesHubConversation;
use App\Services\SalesHub\ConversationDirectory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Conversaciones que el Centro de Ventas atendió sobre un SaaS, para que ese SaaS las muestre
 * en su propio panel. GET firmado con el hmac_secret del SaaS; cada uno solo ve las suyas.
 */
class SaasSalesHubConversationsController extends Controller
{
    public function index(Request $request, string $producto, ConversationDirectory $directory): JsonResponse
    {
        $estado = (string) $request->query('estado', 'todos');

        $page = $directory->paginate(
            $producto,
            (string) $request->query('search', ''),
            in_array($estado, ['todos', 'activos', 'pausados'], true) ? $estado : 'todos',
            (int) $request->query('per_page', 20),
        );

        return response()->json([
            'data' => collect($page->items())->map(fn (SalesHubConversation $c): array => $directory->present($c))->values(),
            'meta' => [
                'total' => $page->total(),
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'last_page' => $page->lastPage(),
            ],
            'stats' => $directory->stats($producto),
        ]);
    }

    public function show(string $producto, string $conversation, ConversationDirectory $directory): JsonResponse
    {
        $conversation = SalesHubConversation::query()
            ->with(['line:id,nombre', 'latestMessage'])
            ->where('producto', $producto)
            ->findOrFail($conversation);

        return response()->json([
            'conversation' => $directory->present($conversation),
            'messages' => $directory->messages($conversation),
        ]);
    }
}
