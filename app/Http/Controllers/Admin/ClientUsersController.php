<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientUsersController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $perPage = (int) $request->query('per_page', 25);
        $allowedPerPage = [10, 15, 20, 25, 30, 40, 50];
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        $q = trim((string) $request->query('q', ''));
        $sortBy = trim((string) $request->query('sort_by', ''));
        $sortDir = strtolower((string) $request->query('sort_dir', 'desc'));
        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        $query = User::query()
            ->role('client')
            ->select([
                'id',
                'username',
                'name',
                'lastname',
                'email',
                'document_number',
                'phone',
                'email_verified_at',
                'created_at',
            ]);

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($inner) use ($like): void {
                $inner->where('name', 'ILIKE', $like)
                    ->orWhere('lastname', 'ILIKE', $like)
                    ->orWhere('email', 'ILIKE', $like)
                    ->orWhere('document_number', 'ILIKE', $like)
                    ->orWhere('username', 'ILIKE', $like);
            });
        }

        $allowedSortBy = [
            'name',
            'email',
            'document_number',
            'username',
            'email_verified_at',
            'created_at',
        ];
        if (! in_array($sortBy, $allowedSortBy, true)) {
            $sortBy = 'created_at';
            $sortDir = 'desc';
        }

        $users = $query
            ->orderBy($sortBy, $sortDir)
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/acceso-clientes/index', [
            'users' => $users,
            'filters' => [
                'q' => $q,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }
}
