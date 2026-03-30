<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\UserProfileUpdateRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\LicenseKey;
use App\Models\Entitlement;
use App\Models\Order;
use App\Models\Subscription;
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
        $user = $request->user();
        $user?->load('profile');

        $licenseCountsByStatus = LicenseKey::query()
            ->where('user_id', $user?->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $licenseStats = [
            'total' => (int) $licenseCountsByStatus->sum(),
            'active' => (int) ($licenseCountsByStatus->get(LicenseKey::STATUS_ACTIVE) ?? 0),
            'pending' => (int) ($licenseCountsByStatus->get(LicenseKey::STATUS_PENDING) ?? 0),
        ];

        $subscriptionCountsByStatus = Subscription::query()
            ->where('user_id', $user?->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $softwareStats = [
            'subscriptions_total' => (int) $subscriptionCountsByStatus->sum(),
            'subscriptions_active' => (int) ($subscriptionCountsByStatus->get(Subscription::STATUS_ACTIVE) ?? 0),
            'subscriptions_past_due' => (int) ($subscriptionCountsByStatus->get(Subscription::STATUS_PAST_DUE) ?? 0),
            'entitlements_active' => Entitlement::query()
                ->where('user_id', $user?->id)
                ->where('status', Entitlement::STATUS_ACTIVE)
                ->count(),
        ];

        return Inertia::render('cliente/panel', [
            'profile' => $user?->profile,
            'licenseStats' => $licenseStats,
            'softwareStats' => $softwareStats,
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
        $perPage = max(10, min((int) $request->integer('per_page', 15), 50));

        $licenses = LicenseKey::query()
            ->where('user_id', $user->id)
            ->with([
                'catalogSku:id,code,name,catalog_product_id',
                'catalogSku.product:id,name',
                'order:id,order_number',
            ])
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (LicenseKey $row): array {
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
                    'evidence_image_url' => $this->evidenceImageFromMetadata(is_array($row->metadata) ? $row->metadata : []),
                ];
            });

        return Inertia::render('cliente/licencias', [
            'licenses' => $licenses,
        ]);
    }

    public function software(Request $request): Response
    {
        $user = $request->user();

        $subscriptions = Subscription::query()
            ->where('user_id', $user->id)
            ->with(['items.catalogSku:id,code,name,catalog_product_id', 'items.catalogSku.product:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(static function (Subscription $sub): array {
                return [
                    'id' => $sub->id,
                    'status' => $sub->status,
                    'current_period_start' => $sub->current_period_start?->toIso8601String(),
                    'current_period_end' => $sub->current_period_end?->toIso8601String(),
                    'cancel_at_period_end' => (bool) $sub->cancel_at_period_end,
                    'items' => $sub->items->map(static function ($item): array {
                        return [
                            'sku_code' => $item->catalogSku?->code,
                            'sku_name' => $item->catalogSku?->name,
                            'product_name' => $item->catalogSku?->product?->name,
                            'quantity' => (int) $item->quantity,
                            'unit_price' => (string) $item->unit_price,
                        ];
                    })->values()->all(),
                ];
            })->values()->all();

        $licenses = LicenseKey::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [LicenseKey::STATUS_ACTIVE, LicenseKey::STATUS_PENDING])
            ->whereNotNull('expires_at')
            ->with(['catalogSku:id,code,name,catalog_product_id', 'catalogSku.product:id,name'])
            ->orderBy('expires_at')
            ->get()
            ->map(static function (LicenseKey $row): array {
                return [
                    'id' => $row->id,
                    'status' => $row->status,
                    'key' => $row->key,
                    'expires_at' => $row->expires_at?->toIso8601String(),
                    'sku_code' => $row->catalogSku?->code,
                    'sku_name' => $row->catalogSku?->name,
                    'product_name' => $row->catalogSku?->product?->name,
                ];
            })->values()->all();

        $entitlements = Entitlement::query()
            ->where('user_id', $user->id)
            ->with(['catalogProduct:id,name', 'catalogSku:id,code,name'])
            ->withCount('secrets')
            ->orderByDesc('created_at')
            ->get()
            ->map(static function (Entitlement $ent): array {
                return [
                    'id' => $ent->id,
                    'status' => $ent->status,
                    'starts_at' => $ent->starts_at?->toIso8601String(),
                    'ends_at' => $ent->ends_at?->toIso8601String(),
                    'product_name' => $ent->catalogProduct?->name,
                    'sku' => $ent->catalogSku?->code,
                    'sku_name' => $ent->catalogSku?->name,
                    'secrets_count' => (int) $ent->secrets_count,
                ];
            })->values()->all();

        return Inertia::render('cliente/software', [
            'subscriptions' => $subscriptions,
            'entitlements' => $entitlements,
            'licenses' => $licenses,
        ]);
    }

    /**
     * @param array<string, mixed> $metadata
     */
    private function evidenceImageFromMetadata(array $metadata): ?string
    {
        $keys = [
            'evidencia_activacion_imagen',
            'evidence_image_url',
            'imagen_activacion',
            'imagen_evidencia',
            'captura_activacion',
            'img',
            'imagen',
        ];
        foreach ($keys as $key) {
            $value = $metadata[$key] ?? null;
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
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

}
