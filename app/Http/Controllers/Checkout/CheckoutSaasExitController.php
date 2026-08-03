<?php

declare(strict_types=1);

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Puente post-pago: limpia carrito en el cliente y redirige al subdominio VetSaaS.
 */
final class CheckoutSaasExitController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $redirectUrl = $request->session()->pull('saas_redirect_url');

        if (! is_string($redirectUrl) || trim($redirectUrl) === '') {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'Pedido confirmado.');
        }

        return Inertia::render('checkout/saas-exit', [
            'redirectUrl' => trim($redirectUrl),
        ]);
    }
}
