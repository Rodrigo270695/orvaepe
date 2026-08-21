<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClientUserUpdateRequest;
use App\Models\User;
use App\Models\UserProfile;
use App\Support\AdminFlashToast;
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
            ->with(['profile:id,user_id,ruc,legal_name,company_name,billing_email'])
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
                    ->orWhere('username', 'ILIKE', $like)
                    ->orWhereHas('profile', function ($profile) use ($like): void {
                        $profile->where('ruc', 'ILIKE', $like)
                            ->orWhere('legal_name', 'ILIKE', $like)
                            ->orWhere('company_name', 'ILIKE', $like);
                    });
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
            ->withQueryString()
            ->through(static function (User $user): array {
                $profile = $user->profile;

                return [
                    'id' => $user->id,
                    'username' => (string) $user->username,
                    'name' => (string) $user->name,
                    'lastname' => $user->lastname,
                    'email' => (string) $user->email,
                    'document_number' => $user->document_number,
                    'phone' => $user->phone,
                    'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                    'created_at' => $user->created_at?->toIso8601String() ?? '',
                    'ruc' => $profile?->ruc,
                    'legal_name' => $profile?->legal_name,
                ];
            });

        return Inertia::render('admin/acceso-clientes/index', [
            'users' => $users,
            'filters' => [
                'q' => $q,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    public function edit(User $user): Response
    {
        $this->ensureClientUser($user);
        $user->load('profile');

        $profile = $user->profile;

        return Inertia::render('admin/acceso-clientes/edit', [
            'client' => [
                'id' => $user->id,
                'username' => (string) $user->username,
                'name' => (string) $user->name,
                'lastname' => (string) ($user->lastname ?? ''),
                'email' => (string) $user->email,
                'document_number' => (string) ($user->document_number ?? ''),
                'phone' => (string) ($user->phone ?? ''),
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'company_name' => (string) ($profile?->company_name ?? ''),
                'legal_name' => (string) ($profile?->legal_name ?? ''),
                'ruc' => (string) ($profile?->ruc ?? ''),
                'billing_email' => (string) ($profile?->billing_email ?? ''),
                'city' => (string) ($profile?->city ?? ''),
                'address' => (string) ($profile?->address ?? ''),
            ],
        ]);
    }

    public function update(ClientUserUpdateRequest $request, User $user): RedirectResponse
    {
        $this->ensureClientUser($user);

        $data = $request->validated();

        $emailChanged = strcasecmp((string) $user->email, (string) $data['email']) !== 0;

        $user->forceFill([
            'name' => $data['name'],
            'lastname' => $data['lastname'],
            'email' => $data['email'],
            'username' => $data['username'],
            'document_number' => $data['document_number'] ?? null,
            'phone' => $data['phone'] ?? null,
        ]);

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'company_name' => $data['company_name'] ?? null,
                'legal_name' => $data['legal_name'] ?? null,
                'ruc' => $data['ruc'] ?? null,
                'billing_email' => $data['billing_email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'city' => $data['city'] ?? null,
                'address' => $data['address'] ?? null,
                'country' => 'PE',
            ],
        );

        return redirect()
            ->route('panel.acceso-clientes.edit', $user)
            ->with('toast', AdminFlashToast::success('Cliente actualizado'));
    }

    private function ensureClientUser(User $user): void
    {
        abort_unless($user->hasRole('client'), 404);
    }
}
