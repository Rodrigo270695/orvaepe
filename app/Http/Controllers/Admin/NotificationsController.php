<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationsController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));
        $channel = trim((string) $request->query('channel', ''));
        $sortBy = trim((string) $request->query('sort_by', ''));
        $sortDir = strtolower((string) $request->query('sort_dir', 'desc'));
        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        $perPage = (int) $request->query('per_page', 25);
        $allowedPerPage = [10, 15, 20, 25, 30, 40, 50];
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        $dateFrom = trim((string) $request->query('date_from', ''));
        $dateTo = trim((string) $request->query('date_to', ''));
        $datePattern = '/^\d{4}-\d{2}-\d{2}$/';
        $validFrom = $dateFrom !== '' && preg_match($datePattern, $dateFrom);
        $validTo = $dateTo !== '' && preg_match($datePattern, $dateTo);

        if (! $validFrom || ! $validTo) {
            $params = array_merge($request->query(), [
                'date_from' => now()->startOfMonth()->format('Y-m-d'),
                'date_to' => now()->endOfMonth()->format('Y-m-d'),
            ]);

            return redirect()->route('panel.acceso-notificaciones.index', $params);
        }

        $query = Notification::query()
            ->with(['user:id,name,lastname,email']);

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($outer) use ($like): void {
                $outer->where('subject', 'ILIKE', $like)
                    ->orWhere('message', 'ILIKE', $like)
                    ->orWhere('type', 'ILIKE', $like)
                    ->orWhere('channel', 'ILIKE', $like);
            });
        }

        $query->whereDate('created_at', '>=', $dateFrom);
        $query->whereDate('created_at', '<=', $dateTo);

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($channel !== '') {
            $query->where('channel', $channel);
        }

        $allowedSortBy = ['status', 'channel', 'sent_at', 'read_at', 'created_at'];
        if (! in_array($sortBy, $allowedSortBy, true)) {
            $sortBy = 'created_at';
            $sortDir = 'desc';
        }

        $notifications = $query
            ->orderBy($sortBy, $sortDir)
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/acceso-notificaciones/index', [
            'notifications' => $notifications,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'channel' => $channel,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $query = Notification::query()->whereNull('read_at');

        if (! $request->user()->hasRole('superadmin')) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json(['count' => $query->count()]);
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        $isRecipient = (int) $notification->user_id === (int) $request->user()->id;
        $isSuperAdmin = $request->user()->hasRole('superadmin');
        if (! $isRecipient && ! $isSuperAdmin) {
            abort(403);
        }

        $notification->markAsRead();

        return response()->json([
            'read_at' => $notification->fresh()->read_at?->toIso8601String(),
        ]);
    }

    /**
     * Marca como leídas todas las notificaciones sin `read_at`.
     * Misma regla que {@see unreadCount()}: superadmin ve todas; el resto solo las propias.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $query = Notification::query()->whereNull('read_at');

        if (! $request->user()->hasRole('superadmin')) {
            $query->where('user_id', $request->user()->id);
        }

        $updated = $query->update(['read_at' => now()]);

        return response()->json([
            'updated' => $updated,
        ]);
    }
}
