import { getCsrfToken } from '@/lib/csrf';

export type MarketingCheckoutLinePayload = { plan_id: string; qty: number };

export type MarketingCheckoutGateway =
    | 'culqi'
    | 'mercadopago'
    | 'paypal'
    | 'paypal_simulate';

const CHECKOUT_URLS: Record<MarketingCheckoutGateway, string> = {
    culqi: '/checkout/culqi',
    mercadopago: '/checkout/mercadopago',
    paypal: '/checkout/paypal',
    paypal_simulate: '/checkout/paypal/simulate',
};

export type MarketingCheckoutPostResult =
    | {
          kind: 'culqi_inline';
          orderId: string;
          orderNumber: string;
          amountCents: number;
          currency: string;
          email: string;
          publicKey: string;
          checkoutScriptUrl: string;
          commerceName: string;
      }
    | {
          kind: 'free_completed';
          orderNumber: string;
          message: string;
      }
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

    let data: {
        message?: string;
        free_checkout?: boolean;
        completed?: boolean;
        order_number?: string;
        approval_url?: string;
        inline_checkout?: {
            order_id?: string;
            order_number?: string;
            amount_cents?: number;
            currency?: string;
            email?: string;
            public_key?: string;
            checkout_script_url?: string;
            commerce_name?: string;
        };
    } = {};

    try {
        data = (await res.json()) as typeof data;
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

    if (
        data.free_checkout === true &&
        data.completed === true &&
        typeof data.order_number === 'string' &&
        data.order_number !== ''
    ) {
        return {
            kind: 'free_completed',
            orderNumber: data.order_number,
            message:
                typeof data.message === 'string' && data.message.trim() !== ''
                    ? data.message
                    : 'Pedido confirmado. Revisa tu correo con el acceso.',
        };
    }

    const inline = data.inline_checkout;
    if (
        inline &&
        typeof inline.order_id === 'string' &&
        inline.order_id !== '' &&
        typeof inline.order_number === 'string' &&
        inline.order_number !== '' &&
        typeof inline.amount_cents === 'number' &&
        Number.isFinite(inline.amount_cents) &&
        typeof inline.currency === 'string' &&
        inline.currency !== '' &&
        typeof inline.email === 'string' &&
        inline.email !== '' &&
        typeof inline.public_key === 'string' &&
        inline.public_key !== '' &&
        typeof inline.checkout_script_url === 'string' &&
        inline.checkout_script_url !== ''
    ) {
        return {
            kind: 'culqi_inline',
            orderId: inline.order_id,
            orderNumber: inline.order_number,
            amountCents: inline.amount_cents,
            currency: inline.currency,
            email: inline.email,
            publicKey: inline.public_key,
            checkoutScriptUrl: inline.checkout_script_url,
            commerceName:
                typeof inline.commerce_name === 'string' && inline.commerce_name !== ''
                    ? inline.commerce_name
                    : 'ORVAE',
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
export function defaultMarketingCheckoutGateway(_opts: {
    mercadoPagoEnabled: boolean;
    paypalSimulateCheckout: boolean;
}): MarketingCheckoutGateway {
    return 'culqi';
}

export function legacyDefaultMarketingCheckoutGateway(opts: {
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
