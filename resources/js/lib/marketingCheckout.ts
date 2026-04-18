import { getCsrfToken } from '@/lib/csrf';

export type MarketingCheckoutLinePayload = { plan_id: string; qty: number };

export type MarketingCheckoutGateway =
    | 'mercadopago'
    | 'paypal'
    | 'paypal_simulate';

const CHECKOUT_URLS: Record<MarketingCheckoutGateway, string> = {
    mercadopago: '/checkout/mercadopago',
    paypal: '/checkout/paypal',
    paypal_simulate: '/checkout/paypal/simulate',
};

export type MarketingCheckoutPostResult =
    | { kind: 'redirect'; approvalUrl: string }
    | { kind: 'unauthorized' }
    | { kind: 'error'; message: string; httpStatus: number };

/**
 * Inicia checkout (PayPal, simulación local o Mercado Pago) con el mismo contrato que `/carrito`.
 */
export async function postMarketingCheckout(params: {
    gateway: MarketingCheckoutGateway;
    lines: MarketingCheckoutLinePayload[];
    coupon_code?: string | null;
}): Promise<MarketingCheckoutPostResult> {
    const trimmedCoupon =
        typeof params.coupon_code === 'string' && params.coupon_code.trim() !== ''
            ? params.coupon_code.trim()
            : undefined;

    const res = await fetch(CHECKOUT_URLS[params.gateway], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            lines: params.lines,
            ...(trimmedCoupon ? { coupon_code: trimmedCoupon } : {}),
        }),
    });

    if (res.status === 401) {
        return { kind: 'unauthorized' };
    }

    let data: { message?: string; approval_url?: string } = {};

    try {
        data = (await res.json()) as { message?: string; approval_url?: string };
    } catch {
        data = {};
    }

    if (!res.ok) {
        return {
            kind: 'error',
            message:
                typeof data.message === 'string' && data.message.trim() !== ''
                    ? data.message
                    : 'No se pudo iniciar el pago.',
            httpStatus: res.status,
        };
    }

    if (typeof data.approval_url === 'string' && data.approval_url !== '') {
        return { kind: 'redirect', approvalUrl: data.approval_url };
    }

    return {
        kind: 'error',
        message: 'Respuesta inesperada del servidor.',
        httpStatus: res.status,
    };
}

/** Pasarela por defecto en detalle de producto (Perú: MP si está configurado). */
export function defaultMarketingCheckoutGateway(opts: {
    mercadoPagoEnabled: boolean;
    paypalSimulateCheckout: boolean;
}): MarketingCheckoutGateway {
    if (opts.mercadoPagoEnabled) {
        return 'mercadopago';
    }

    if (opts.paypalSimulateCheckout) {
        return 'paypal_simulate';
    }

    return 'paypal';
}
