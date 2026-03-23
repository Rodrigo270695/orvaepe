/**
 * Carrito de software (marketing): persiste en localStorage.
 * Misma clave en navbar, detalle de producto y página /carrito.
 */

export const SOFTWARE_CART_STORAGE_KEY = 'orvae_cart_v1';

export type SoftwareCartItem = {
    systemSlug: string;
    planId: string;
    qty: number;
    /** Copia al añadir para mostrar sin consultar API */
    systemName?: string;
    planLabel?: string;
    priceText?: string;
    /** PEN por unidad (snapshot al añadir; facilita totales en el carrito) */
    unitPricePen?: number;
};

function dispatchUpdated(): void {
    window.dispatchEvent(new CustomEvent('orvae-cart-updated'));
}

export function readSoftwareCart(): SoftwareCartItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = localStorage.getItem(SOFTWARE_CART_STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as SoftwareCartItem[];
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;
    } catch {
        return [];
    }
}

export function writeSoftwareCart(items: SoftwareCartItem[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem(SOFTWARE_CART_STORAGE_KEY, JSON.stringify(items));
    dispatchUpdated();
}

/** Suma de unidades en el carrito (badge del navbar). */
export function getSoftwareCartTotalQty(): number {
    return readSoftwareCart().reduce((sum, i) => sum + (i.qty ?? 0), 0);
}

/** Vacía el carrito y notifica a la UI (navbar, etc.). */
export function clearSoftwareCart(): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem(SOFTWARE_CART_STORAGE_KEY);
    dispatchUpdated();
}

export function setCartLineQty(
    systemSlug: string,
    planId: string,
    qty: number,
): void {
    const items = readSoftwareCart();
    const line = items.find(
        (i) => i.systemSlug === systemSlug && i.planId === planId,
    );

    if (!line) {
        return;
    }

    if (qty <= 0) {
        removeCartLine(systemSlug, planId);
        return;
    }

    line.qty = qty;
    writeSoftwareCart(items);
}

export function removeCartLine(systemSlug: string, planId: string): void {
    const next = readSoftwareCart().filter(
        (i) => !(i.systemSlug === systemSlug && i.planId === planId),
    );
    writeSoftwareCart(next);
}

/** Cupón aplicado en checkout (marketing); validación real irá al backend. */
export const CART_COUPON_STORAGE_KEY = 'orvae_cart_coupon_v1';

export type StoredCartCoupon = {
    code: string;
    appliedAt: number;
    discountPen?: number;
    eligibleSubtotalPen?: number;
};

export function readCartCoupon(): StoredCartCoupon | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = localStorage.getItem(CART_COUPON_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as StoredCartCoupon;
        if (!parsed || typeof parsed.code !== 'string' || !parsed.code.trim()) {
            return null;
        }

        return {
            code: parsed.code.trim(),
            appliedAt:
                typeof parsed.appliedAt === 'number' ? parsed.appliedAt : Date.now(),
            discountPen:
                typeof parsed.discountPen === 'number' ? parsed.discountPen : undefined,
            eligibleSubtotalPen:
                typeof parsed.eligibleSubtotalPen === 'number'
                    ? parsed.eligibleSubtotalPen
                    : undefined,
        };
    } catch {
        return null;
    }
}

export function writeCartCoupon(data: StoredCartCoupon | null): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (!data || !data.code.trim()) {
        localStorage.removeItem(CART_COUPON_STORAGE_KEY);
        return;
    }

    localStorage.setItem(CART_COUPON_STORAGE_KEY, JSON.stringify(data));
}

