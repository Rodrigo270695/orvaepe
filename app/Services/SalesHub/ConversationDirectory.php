<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use App\Models\SalesHubConversation;
use App\Models\SalesHubMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * Listado de conversaciones del Centro de Ventas: lo usan el panel de ORVAE y la API firmada
 * que consultan los SaaS (cada SaaS solo ve las suyas).
 */
final class ConversationDirectory
{
    public const ESTADOS = ['todos', 'activos', 'pausados', 'sin_producto'];

    public const MAX_MESSAGES = 300;

    /**
     * @return LengthAwarePaginator<int, SalesHubConversation>
     */
    public function paginate(?string $producto, string $search = '', string $estado = 'todos', int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->scoped($producto)
            ->with(['line:id,nombre', 'latestMessage'])
            ->orderByRaw('COALESCE(last_inbound_at, last_outbound_at, created_at) DESC');

        $search = trim($search);
        if ($search !== '') {
            $like = '%'.mb_strtolower($search).'%';
            $query->where(fn (Builder $q) => $q
                ->whereRaw('LOWER(COALESCE(nombre, \'\')) LIKE ?', [$like])
                ->orWhere('phone', 'like', '%'.preg_replace('/\D+/', '', $search).'%'));
        }

        match ($estado) {
            'activos' => $query->where('bot_activo', true),
            'pausados' => $query->where('bot_activo', false),
            'sin_producto' => $query->whereNull('producto'),
            default => null,
        };

        return $query->paginate(max(5, min(50, $perPage)));
    }

    /**
     * @return array{total: int, activos: int, pausados: int, hoy: int}
     */
    public function stats(?string $producto): array
    {
        return [
            'total' => $this->scoped($producto)->count(),
            'activos' => $this->scoped($producto)->where('bot_activo', true)->count(),
            'pausados' => $this->scoped($producto)->where('bot_activo', false)->count(),
            'hoy' => $this->scoped($producto)->where('created_at', '>=', now('America/Lima')->startOfDay())->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function present(SalesHubConversation $conversation): array
    {
        $last = $conversation->relationLoaded('latestMessage') ? $conversation->latestMessage : null;

        return [
            'id' => $conversation->id,
            'phone' => $conversation->phone,
            'nombre' => $conversation->nombre,
            'producto' => $conversation->producto,
            'linea' => $conversation->line?->nombre,
            'bot_activo' => $conversation->bot_activo,
            'pausa' => $conversation->pausa,
            'pausa_motivo' => $conversation->pausa_motivo,
            'no_leidos' => $conversation->no_leidos,
            'last_inbound_at' => $conversation->last_inbound_at?->toIso8601String(),
            'last_outbound_at' => $conversation->last_outbound_at?->toIso8601String(),
            'created_at' => $conversation->created_at?->toIso8601String(),
            'ultimo_mensaje' => $last !== null ? [
                'autor' => $last->autor,
                'body' => mb_substr($last->body, 0, 160),
                'at' => $last->created_at?->toIso8601String(),
            ] : null,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function messages(SalesHubConversation $conversation): array
    {
        return $conversation->messages()
            ->orderByDesc('id')
            ->limit(self::MAX_MESSAGES)
            ->get()
            ->reverse()
            ->map(fn (SalesHubMessage $m): array => [
                'id' => $m->id,
                'direccion' => $m->direccion,
                'autor' => $m->autor,
                'tipo' => $m->tipo,
                'body' => $m->body,
                'producto' => $m->producto,
                'at' => $m->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return Builder<SalesHubConversation>
     */
    private function scoped(?string $producto): Builder
    {
        return SalesHubConversation::query()
            ->when($producto !== null, fn (Builder $q) => $q->where('producto', $producto));
    }
}
