<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\UserProfileUpdateRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\LicenseKey;
use App\Models\Notification;
use App\Models\Order;
use App\Models\UserProfile;
use App\Support\AdminFlashToast;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientPortalController extends Controller
{
    public function home(Request $request): Response
    {
        $request->user()?->load('profile');

        return Inertia::render('cliente/panel', [
            'profile' => $request->user()?->profile,
        ]);
    }

    public function payments(Request $request): Response
    {
        $user = $request->user();
        $orders = Order::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get([
                'id',
                'order_number',
                'status',
                'currency',
                'grand_total',
                'created_at',
                'placed_at',
            ]);

        return Inertia::render('cliente/pagos', [
            'orders' => $orders,
            'paymentGatewayEnabled' => (bool) config('services.payments.gateway_enabled', false),
        ]);
    }

    public function billing(Request $request): Response
    {
        $request->user()?->load('profile');

        return Inertia::render('cliente/facturacion', [
            'profile' => $request->user()?->profile,
        ]);
    }

    public function updateBilling(UserProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();
        if (isset($data['country']) && $data['country'] === '') {
            $data['country'] = 'PE';
        }

        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            array_merge($data, ['user_id' => $user->id]),
        );

        if (array_key_exists('phone', $data)) {
            $user->forceFill([
                'phone' => $data['phone'] !== '' ? $data['phone'] : null,
            ])->save();
        }

        return redirect()
            ->route('cliente.billing')
            ->with('toast', AdminFlashToast::success('Datos de facturación guardados'));
    }

    public function servicios(Request $request): Response
    {
        return Inertia::render('cliente/placeholder', [
            'title' => 'Servicios',
            'description' => 'Aquí verás tus productos y servicios contratados.',
        ]);
    }

    public function licenses(Request $request): Response
    {
        $user = $request->user();

        $licenses = LicenseKey::query()
            ->where('user_id', $user->id)
            ->with([
                'catalogSku:id,code,name,catalog_product_id',
                'catalogSku.product:id,name',
                'order:id,order_number',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(static function (LicenseKey $row): array {
                return [
                    'id' => $row->id,
                    'key' => $row->key,
                    'status' => $row->status,
                    'expires_at' => $row->expires_at?->toIso8601String(),
                    'max_activations' => $row->max_activations,
                    'activation_count' => $row->activation_count,
                    'created_at' => $row->created_at?->toIso8601String(),
                    'order_number' => $row->order?->order_number,
                    'sku_code' => $row->catalogSku?->code,
                    'sku_name' => $row->catalogSku?->name,
                    'product_name' => $row->catalogSku?->product?->name,
                ];
            })
            ->values();

        return Inertia::render('cliente/licencias', [
            'licenses' => $licenses,
        ]);
    }

    public function facturas(Request $request): Response
    {
        return Inertia::render('cliente/placeholder', [
            'title' => 'Facturas',
            'description' => 'Tus comprobantes electrónicos aparecerán aquí cuando estén disponibles.',
        ]);
    }

    public function soporte(Request $request): Response
    {
        return Inertia::render('cliente/placeholder', [
            'title' => 'Soporte',
            'description' => 'Centro de tickets y ayuda.',
        ]);
    }

    public function profile(Request $request): Response
    {
        return Inertia::render('cliente/perfil', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function updateProfile(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'user_id' => $user->id,
                'phone' => $validated['phone'] ?? $user->phone,
                'billing_email' => $user->email,
            ],
        );

        return redirect()
            ->route('cliente.profile')
            ->with('status', 'profile-updated');
    }

    public function security(Request $request): Response
    {
        return Inertia::render('cliente/seguridad');
    }

    public function notifications(Request $request): Response
    {
        $user = $request->user();
        $notifications = $user
            ->userNotifications()
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return Inertia::render('cliente/notificaciones', [
            'notifications' => $notifications->map(static function (Notification $n) {
                return [
                    'id' => $n->id,
                    'type' => $n->type,
                    'channel' => $n->channel,
                    'data' => $n->data ?? [],
                    'read_at' => $n->read_at?->toIso8601String(),
                    'created_at' => $n->created_at?->toIso8601String(),
                ];
            }),
        ]);
    }

    public function markNotificationRead(Request $request, Notification $notification): RedirectResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->markAsRead();

        return back();
    }
}
