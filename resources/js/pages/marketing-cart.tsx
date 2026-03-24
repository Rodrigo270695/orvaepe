import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import MarketingLayout from '@/components/marketing/MarketingLayout';
import { marketingSeo } from '@/marketing/seoCopy';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import {
    cartTotalsWithIgv,
    effectiveLineUnit,
    formatPlanLabel,
    peruIgvLineAmounts,
    type SkuPriceRow,
} from '@/lib/cartPricing';
import { getCsrfToken } from '@/lib/csrf';
import {
    clearSoftwareCart,
    readCartCoupon,
    readSoftwareCart,
    removeCartLine,
    setCartLineQty,
    writeCartCoupon,
    type SoftwareCartItem,
} from '@/lib/softwareCartStorage';

function formatPenValue(n: number): string {
    return n.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatMoneyAmount(amount: number, currency: string): string {
    return `${formatPenValue(amount)} ${currency}`;
}

type CartPageProps = {
    auth?: { user?: { name?: string } | null };
    flash?: { status?: string | null; toast?: unknown };
    paypalSimulateCheckout?: boolean;
    mercadoPagoEnabled?: boolean;
    /** Tasa IGV (ej. 0.18), alineada a config/sales */
    salesIgvRate?: number;
};

export default function MarketingCart() {
    const { auth, flash, paypalSimulateCheckout, mercadoPagoEnabled, salesIgvRate } = usePage<CartPageProps>().props;
    const [lines, setLines] = useState<SoftwareCartItem[]>([]);
    const [mounted, setMounted] = useState(false);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [discountPen, setDiscountPen] = useState<number | null>(null);
    const [eligibleSubtotalPen, setEligibleSubtotalPen] = useState<number | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [couponHint, setCouponHint] = useState<string | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [skuPrices, setSkuPrices] = useState<Partial<Record<string, SkuPriceRow>>>({});
    const [skuPricesLoading, setSkuPricesLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [selectedGateway, setSelectedGateway] = useState<'paypal' | 'mercadopago'>('paypal');

    const linesKeyRef = useRef<string | undefined>(undefined);
    const skipNextInvalidationRef = useRef(true);
    const skuPriceFetchId = useRef(0);

    const sync = useCallback(() => {
        setLines(readSoftwareCart());
    }, []);

    useEffect(() => {
        setMounted(true);
        sync();
        const stored = readCartCoupon();
        if (stored) {
            setAppliedCoupon(stored.code);
            setCouponInput(stored.code);
            if (stored.discountPen != null) {
                setDiscountPen(stored.discountPen);
            }
            if (stored.eligibleSubtotalPen != null) {
                setEligibleSubtotalPen(stored.eligibleSubtotalPen);
            }
        }
        window.addEventListener('orvae-cart-updated', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('orvae-cart-updated', sync);
            window.removeEventListener('storage', sync);
        };
    }, [sync]);

    useEffect(() => {
        const s = flash?.status;
        if (typeof s === 'string' && s.includes('Pago confirmado')) {
            clearSoftwareCart();
            setLines([]);
        }
    }, [flash?.status]);

    useEffect(() => {
        if (mounted && lines.length === 0 && appliedCoupon) {
            writeCartCoupon(null);
            setAppliedCoupon(null);
            setCouponInput('');
            setDiscountPen(null);
            setEligibleSubtotalPen(null);
            setCouponHint(null);
        }
    }, [mounted, lines.length, appliedCoupon]);

    useEffect(() => {
        if (!mounted) {
            return;
        }

        const key = JSON.stringify(
            lines.map((l) => ({
                systemSlug: l.systemSlug,
                planId: l.planId,
                qty: l.qty,
            })),
        );

        if (skipNextInvalidationRef.current) {
            skipNextInvalidationRef.current = false;
            linesKeyRef.current = key;
            return;
        }

        if (linesKeyRef.current === key) {
            return;
        }

        linesKeyRef.current = key;

        const c = readCartCoupon();
        if (c?.discountPen != null) {
            writeCartCoupon({ code: c.code, appliedAt: Date.now() });
            setDiscountPen(null);
            setEligibleSubtotalPen(null);
            setCouponHint(
                'El carrito cambió. Vuelve a aplicar el cupón para recalcular el descuento.',
            );
        }
    }, [lines, mounted]);

    const planIdsKey = useMemo(
        () => [...new Set(lines.map((l) => l.planId))].sort().join(','),
        [lines],
    );

    useEffect(() => {
        if (!mounted || lines.length === 0) {
            setSkuPrices({});
            setSkuPricesLoading(false);
            return;
        }

        const fetchId = ++skuPriceFetchId.current;
        const ids = [...new Set(lines.map((l) => l.planId))];
        const ac = new AbortController();

        setSkuPricesLoading(true);

        (async () => {
            try {
                const res = await fetch('/carrito/precios-skus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ plan_ids: ids }),
                    signal: ac.signal,
                });

                if (fetchId !== skuPriceFetchId.current) {
                    return;
                }

                if (!res.ok) {
                    setSkuPrices({});
                    return;
                }

                const data = (await res.json()) as {
                    prices?: Record<string, SkuPriceRow>;
                };
                setSkuPrices(data.prices ?? {});
            } catch (e) {
                if (e instanceof DOMException && e.name === 'AbortError') {
                    return;
                }
                if (fetchId !== skuPriceFetchId.current) {
                    return;
                }
                setSkuPrices({});
            } finally {
                if (fetchId === skuPriceFetchId.current) {
                    setSkuPricesLoading(false);
                }
            }
        })();

        return () => {
            ac.abort();
        };
    }, [mounted, planIdsKey, lines.length]);

    const totalUnits = useMemo(
        () => lines.reduce((s, l) => s + (l.qty ?? 0), 0),
        [lines],
    );

    const igvRate = typeof salesIgvRate === 'number' && Number.isFinite(salesIgvRate) ? salesIgvRate : 0.18;

    const totalsWithIgv = useMemo(
        () => cartTotalsWithIgv(lines, skuPrices, igvRate),
        [lines, skuPrices, igvRate],
    );

    const cartLineRows = useMemo(() => {
        return lines.map((line) => {
            const unit = effectiveLineUnit(line, skuPrices);
            const igvAppliesSku = unit?.igv_applies ?? true;
            const amounts =
                unit !== null
                    ? peruIgvLineAmounts(
                          line.qty,
                          unit.list_price,
                          unit.tax_included ?? false,
                          igvRate,
                          igvAppliesSku,
                      )
                    : null;
            const productHref = line.systemSlug.startsWith('oem-')
                ? `/licencias#${line.systemSlug}`
                : line.systemSlug.startsWith('svc-')
                  ? `/servicios#${line.systemSlug}`
                  : `/software/${line.systemSlug}`;

            return {
                line,
                unit,
                igvAppliesSku,
                amounts,
                productHref,
            };
        });
    }, [lines, skuPrices, igvRate]);

    const totalPayable = useMemo(() => {
        if (!totalsWithIgv) {
            return null;
        }

        const { grandTotal, currency } = totalsWithIgv;

        if (currency === 'PEN' && discountPen !== null && discountPen > 0) {
            return {
                amount: Math.max(0, Math.round((grandTotal - discountPen) * 100) / 100),
                currency: 'PEN',
            };
        }

        return { amount: grandTotal, currency };
    }, [totalsWithIgv, discountPen]);

    const applyCoupon = async () => {
        const code = couponInput.trim();
        setCouponError(null);
        setCouponHint(null);

        if (code.length < 3) {
            setCouponError('Introduce un código de al menos 3 caracteres.');
            return;
        }

        if (lines.length === 0) {
            setCouponError('Añade productos al carrito antes de aplicar un cupón.');
            return;
        }

        setCouponLoading(true);

        try {
            const res = await fetch('/carrito/validar-cupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    code,
                    lines: lines.map((l) => ({
                        plan_id: l.planId,
                        qty: l.qty,
                    })),
                }),
            });

            const data = (await res.json()) as {
                valid?: boolean;
                message?: string;
                discount_pen?: number;
                eligible_subtotal_pen?: number;
                coupon_code?: string;
            };

            if (!res.ok || !data.valid) {
                setCouponError(
                    typeof data.message === 'string'
                        ? data.message
                        : 'No se pudo validar el cupón.',
                );
                return;
            }

            const d = data.discount_pen ?? 0;
            const eligible = data.eligible_subtotal_pen ?? 0;
            const resolvedCode = (data.coupon_code ?? code).trim();

            writeCartCoupon({
                code: resolvedCode,
                appliedAt: Date.now(),
                discountPen: d,
                eligibleSubtotalPen: eligible,
            });

            setAppliedCoupon(resolvedCode);
            setDiscountPen(d);
            setEligibleSubtotalPen(eligible);
            setCouponHint(
                'Cupón aplicado. El descuento mostrado se calcula según el catálogo y las reglas del cupón.',
            );
        } catch {
            setCouponError('Error de red al validar el cupón. Inténtalo de nuevo.');
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        writeCartCoupon(null);
        setAppliedCoupon(null);
        setCouponInput('');
        setDiscountPen(null);
        setEligibleSubtotalPen(null);
        setCouponError(null);
        setCouponHint(null);
    };

    const bumpQty = (line: SoftwareCartItem, delta: number) => {
        setCartLineQty(line.systemSlug, line.planId, line.qty + delta);
        sync();
    };

    const remove = (line: SoftwareCartItem) => {
        removeCartLine(line.systemSlug, line.planId);
        sync();
    };

    const startPayPalCheckout = async () => {
        setCheckoutError(null);
        if (lines.length === 0 || totalPayable === null) {
            return;
        }

        setCheckoutLoading(true);
        try {
            const res = await fetch('/checkout/paypal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    lines: lines.map((l) => ({ plan_id: l.planId, qty: l.qty })),
                    coupon_code: appliedCoupon,
                }),
            });

            const data = (await res.json()) as {
                message?: string;
                approval_url?: string;
            };

            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (!res.ok) {
                setCheckoutError(
                    typeof data.message === 'string'
                        ? data.message
                        : 'No se pudo iniciar el pago.',
                );
                return;
            }

            if (typeof data.approval_url === 'string' && data.approval_url !== '') {
                window.location.href = data.approval_url;
                return;
            }

            setCheckoutError('Respuesta inesperada del servidor.');
        } catch {
            setCheckoutError('Error de red. Inténtalo de nuevo.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const startPayPalSimulateCheckout = async () => {
        setCheckoutError(null);
        if (lines.length === 0 || totalPayable === null) {
            return;
        }

        setCheckoutLoading(true);
        try {
            const res = await fetch('/checkout/paypal/simulate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    lines: lines.map((l) => ({ plan_id: l.planId, qty: l.qty })),
                    coupon_code: appliedCoupon,
                }),
            });

            const data = (await res.json()) as {
                message?: string;
                approval_url?: string;
            };

            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (!res.ok) {
                setCheckoutError(
                    typeof data.message === 'string'
                        ? data.message
                        : 'No se pudo iniciar el pago de prueba.',
                );
                return;
            }

            if (typeof data.approval_url === 'string' && data.approval_url !== '') {
                window.location.href = data.approval_url;
                return;
            }

            setCheckoutError('Respuesta inesperada del servidor.');
        } catch {
            setCheckoutError('Error de red. Inténtalo de nuevo.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const startMercadoPagoCheckout = async () => {
        setCheckoutError(null);
        if (lines.length === 0 || totalPayable === null) {
            return;
        }

        setCheckoutLoading(true);
        try {
            const res = await fetch('/checkout/mercadopago', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    lines: lines.map((l) => ({ plan_id: l.planId, qty: l.qty })),
                    coupon_code: appliedCoupon,
                }),
            });

            const data = (await res.json()) as {
                message?: string;
                approval_url?: string;
            };

            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (!res.ok) {
                setCheckoutError(
                    typeof data.message === 'string'
                        ? data.message
                        : 'No se pudo iniciar el pago con Mercado Pago.',
                );
                return;
            }

            if (typeof data.approval_url === 'string' && data.approval_url !== '') {
                window.location.href = data.approval_url;
                return;
            }

            setCheckoutError('Respuesta inesperada del servidor.');
        } catch {
            setCheckoutError('Error de red. Inténtalo de nuevo.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const pointerBtn =
        'cursor-pointer inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2';

    return (
        <MarketingLayout
            title={marketingSeo.carrito.title}
            description={marketingSeo.carrito.description}
            canonicalPath="/carrito"
            noindex
            structuredData="none"
        >
            <div className="relative overflow-hidden border-b border-[color-mix(in_oklab,var(--border)_80%,transparent)]">
                <GeometricBackground variant="grid-dots" opacity={0.06} />
                <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
                    <Link
                        href="/software"
                        className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Seguir comprando
                    </Link>

                    <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
                                Tu carrito
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-[var(--muted-foreground)]">
                                El desglose y el total a pagar están en el resumen.
                            </p>
                        </div>
                        {mounted && totalUnits > 0 && (
                            <p className="text-sm font-medium text-[var(--muted-foreground)]">
                                {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'} en total
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">
                {!mounted ? (
                    <div className="animate-pulse space-y-4 rounded-2xl border border-[var(--border)] bg-card/40 p-8">
                        <div className="h-6 w-1/3 rounded bg-[var(--muted)]" />
                        <div className="h-16 rounded bg-[var(--muted)]" />
                        <div className="h-16 rounded bg-[var(--muted)]" />
                    </div>
                ) : lines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[color-mix(in_oklab,var(--muted)_22%,transparent)] px-6 py-20 text-center">
                        <ShoppingBag className="mx-auto size-12 text-[var(--muted-foreground)]" aria-hidden />
                        <p className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                            El carrito está vacío
                        </p>
                        <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
                            Explora el catálogo, abre el detalle de un sistema, elige un plan y agrégalo aquí.
                        </p>
                        <Link
                            href="/software"
                            className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            Ir al catálogo de software
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start">
                        <div className="space-y-4 md:hidden" aria-label="Líneas del carrito">
                            {cartLineRows.map(
                                ({ line, unit, igvAppliesSku, amounts, productHref }) => (
                                    <article
                                        key={`${line.systemSlug}:${line.planId}`}
                                        className="rounded-2xl border border-[var(--border)] bg-card/60 p-4 shadow-sm backdrop-blur-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={productHref}
                                                    className="cursor-pointer text-base font-semibold leading-snug text-[var(--foreground)] underline-offset-4 hover:underline"
                                                >
                                                    {line.systemName ?? line.systemSlug}
                                                </Link>
                                                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                                    {skuPrices[line.planId]?.name ?? formatPlanLabel(line)}
                                                </p>
                                                {line.priceText ? (
                                                    <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
                                                        {line.priceText}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <button
                                                type="button"
                                                className={`${pointerBtn} shrink-0 gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[color-mix(in_oklab,var(--destructive)_14%,transparent)] hover:text-[var(--destructive)] focus-visible:ring-[var(--destructive)] focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                                                onClick={() => remove(line)}
                                            >
                                                <Trash2 className="size-4" aria-hidden />
                                                <span className="sr-only">Quitar del carrito</span>
                                            </button>
                                        </div>

                                        {unit !== null && igvAppliesSku === false ? (
                                            <p
                                                className="mt-3 text-[11px] font-medium text-[var(--muted-foreground)]"
                                                role="status"
                                            >
                                                Este producto no aplica IGV (detalle en el resumen).
                                            </p>
                                        ) : null}

                                        <div className="mt-4 flex flex-col gap-3 border-t border-[color-mix(in_oklab,var(--border)_55%,transparent)] pt-4">
                                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                                                    Precio unitario (lista)
                                                </span>
                                                <span className="font-mono text-sm font-semibold tabular-nums text-[var(--foreground)]">
                                                    {unit !== null ? (
                                                        <>
                                                            {formatPenValue(unit.list_price)}{' '}
                                                            <span className="text-[var(--muted-foreground)]">
                                                                {unit.currency}
                                                            </span>
                                                        </>
                                                    ) : skuPricesLoading ? (
                                                        <span className="text-[var(--muted-foreground)]">…</span>
                                                    ) : (
                                                        <span className="text-[var(--muted-foreground)]">—</span>
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                                                    Cantidad
                                                </span>
                                                <div className="inline-flex w-full max-w-[11rem] items-center justify-center rounded-xl border border-[var(--border)] bg-background/80 p-1 sm:ml-auto sm:w-auto">
                                                    <button
                                                        type="button"
                                                        className={`${pointerBtn} size-10 shrink-0 rounded-lg text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--muted)_50%,transparent)] focus-visible:ring-[var(--primary)]`}
                                                        aria-label="Reducir cantidad"
                                                        onClick={() => bumpQty(line, -1)}
                                                    >
                                                        <Minus className="size-4" />
                                                    </button>
                                                    <span className="min-w-12 flex-1 text-center text-base font-bold tabular-nums">
                                                        {line.qty}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className={`${pointerBtn} size-10 shrink-0 rounded-lg text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--muted)_50%,transparent)] focus-visible:ring-[var(--primary)]`}
                                                        aria-label="Aumentar cantidad"
                                                        onClick={() => bumpQty(line, 1)}
                                                    >
                                                        <Plus className="size-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[color-mix(in_oklab,var(--muted)_10%,transparent)] px-3 py-2.5">
                                                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                                                    Total línea
                                                </span>
                                                <span className="font-mono text-base font-bold tabular-nums text-[var(--foreground)]">
                                                    {amounts !== null && unit !== null ? (
                                                        <>
                                                            {formatPenValue(amounts.lineTotal)}{' '}
                                                            <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                                                                {unit.currency}
                                                            </span>
                                                        </>
                                                    ) : skuPricesLoading ? (
                                                        <span className="text-[var(--muted-foreground)]">…</span>
                                                    ) : (
                                                        <span className="text-[var(--muted-foreground)]">—</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>

                        <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-card/60 shadow-sm backdrop-blur-sm md:block">
                            <table className="w-full min-w-0 text-left text-sm">
                                <caption className="sr-only">
                                    Líneas del carrito: precio de lista y total por línea
                                </caption>
                                <thead className="border-b border-[color-mix(in_oklab,var(--border)_80%,transparent)] bg-[color-mix(in_oklab,var(--muted)_12%,transparent)] text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                                    <tr>
                                        <th className="px-4 py-3">Producto / plan</th>
                                        <th className="px-2 py-3">Precio unit. (lista)</th>
                                        <th className="px-4 py-3 text-center">Cant.</th>
                                        <th className="px-4 py-3 text-right">Total línea</th>
                                        <th className="w-px px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartLineRows.map(
                                        ({ line, unit, igvAppliesSku, amounts, productHref }) => (
                                            <tr
                                                key={`${line.systemSlug}:${line.planId}`}
                                                className="border-b border-[color-mix(in_oklab,var(--border)_55%,transparent)] last:border-0"
                                            >
                                                <td className="align-top px-4 py-4">
                                                    <Link
                                                        href={productHref}
                                                        className="cursor-pointer font-semibold text-[var(--foreground)] underline-offset-4 hover:underline"
                                                    >
                                                        {line.systemName ?? line.systemSlug}
                                                    </Link>
                                                    <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
                                                        {skuPrices[line.planId]?.name ?? formatPlanLabel(line)}
                                                    </p>
                                                    {line.priceText && (
                                                        <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
                                                            {line.priceText}
                                                        </p>
                                                    )}
                                                    {unit !== null && igvAppliesSku === false ? (
                                                        <p
                                                            className="mt-2 text-[11px] font-medium text-[var(--muted-foreground)]"
                                                            role="status"
                                                        >
                                                            Este producto no aplica IGV (detalle en el resumen).
                                                        </p>
                                                    ) : null}
                                                </td>
                                                <td className="align-top px-2 py-4 font-mono tabular-nums text-[var(--foreground)]">
                                                    {unit !== null ? (
                                                        <div className="flex flex-col items-end gap-0.5">
                                                            <span>
                                                                {formatPenValue(unit.list_price)}{' '}
                                                                <span className="text-[var(--muted-foreground)]">
                                                                    {unit.currency}
                                                                </span>
                                                            </span>
                                                            <span className="text-[10px] font-normal normal-case text-[var(--muted-foreground)]">
                                                                Precio catálogo
                                                            </span>
                                                        </div>
                                                    ) : skuPricesLoading ? (
                                                        <span className="text-[var(--muted-foreground)]">…</span>
                                                    ) : (
                                                        <span className="text-[var(--muted-foreground)]">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="align-top px-4 py-4">
                                                    <div className="inline-flex items-center rounded-xl border border-[var(--border)] bg-background/80 p-1">
                                                        <button
                                                            type="button"
                                                            className={`${pointerBtn} size-9 rounded-lg text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--muted)_50%,transparent)] focus-visible:ring-[var(--primary)]`}
                                                            aria-label="Reducir cantidad"
                                                            onClick={() => bumpQty(line, -1)}
                                                        >
                                                            <Minus className="size-4" />
                                                        </button>
                                                        <span className="min-w-10 text-center text-sm font-bold tabular-nums">
                                                            {line.qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className={`${pointerBtn} size-9 rounded-lg text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--muted)_50%,transparent)] focus-visible:ring-[var(--primary)]`}
                                                            aria-label="Aumentar cantidad"
                                                            onClick={() => bumpQty(line, 1)}
                                                        >
                                                            <Plus className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="align-top px-4 py-4 text-right font-mono text-sm font-semibold tabular-nums text-[var(--foreground)]">
                                                    {amounts !== null && unit !== null ? (
                                                        <>
                                                            {formatPenValue(amounts.lineTotal)}{' '}
                                                            <span className="text-[var(--muted-foreground)]">
                                                                {unit.currency}
                                                            </span>
                                                        </>
                                                    ) : skuPricesLoading ? (
                                                        <span className="text-[var(--muted-foreground)]">…</span>
                                                    ) : (
                                                        <span className="text-[var(--muted-foreground)]">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="align-top px-4 py-4">
                                                    <button
                                                        type="button"
                                                        className={`${pointerBtn} gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[color-mix(in_oklab,var(--destructive)_14%,transparent)] hover:text-[var(--destructive)] focus-visible:ring-[var(--destructive)] focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                                                        onClick={() => remove(line)}
                                                    >
                                                        <Trash2 className="size-3.5" aria-hidden />
                                                        <span className="hidden sm:inline">Quitar</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <aside className="rounded-2xl border border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--muted)_18%,transparent)] p-6 shadow-inner">
                            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                                Resumen
                            </h2>
                            <p className="mt-1.5 text-[11px] leading-snug text-[var(--muted-foreground)]">
                                Total con impuestos. Cupón: descuento sobre el total.
                            </p>

                            <div className="mt-4 space-y-2 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--muted-foreground)]">Subtotal (base imponible)</span>
                                    <span className="font-semibold tabular-nums text-[var(--foreground)]">
                                        {totalsWithIgv !== null ? (
                                            <>
                                                {formatMoneyAmount(
                                                    totalsWithIgv.subtotalBase,
                                                    totalsWithIgv.currency,
                                                )}
                                            </>
                                        ) : skuPricesLoading ? (
                                            <span className="text-[var(--muted-foreground)]">…</span>
                                        ) : (
                                            <span className="text-[var(--muted-foreground)]">—</span>
                                        )}
                                    </span>
                                </div>
                                {totalsWithIgv !== null ? (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--muted-foreground)]">
                                            IGV ({Math.round(igvRate * 100)}%)
                                        </span>
                                        <span className="font-semibold tabular-nums text-[var(--foreground)]">
                                            {formatMoneyAmount(
                                                totalsWithIgv.taxTotal,
                                                totalsWithIgv.currency,
                                            )}
                                        </span>
                                    </div>
                                ) : null}
                                {appliedCoupon && discountPen !== null && discountPen > 0 && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--muted-foreground)]">
                                                Base elegible (cupón)
                                            </span>
                                            <span className="tabular-nums text-[var(--foreground)]">
                                                {eligibleSubtotalPen !== null ? (
                                                    <>
                                                        {formatPenValue(eligibleSubtotalPen)}{' '}
                                                        <span className="text-[var(--muted-foreground)]">
                                                            PEN
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-[var(--muted-foreground)]">—</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--muted-foreground)]">
                                                Descuento cupón
                                            </span>
                                            <span className="font-semibold tabular-nums text-[color-mix(in_oklab,var(--primary)_90%,var(--foreground))]">
                                                −{formatPenValue(discountPen)}{' '}
                                                <span className="text-[var(--muted-foreground)]">PEN</span>
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between border-t border-[color-mix(in_oklab,var(--border)_55%,transparent)] pt-2 text-base font-bold">
                                    <span className="text-[var(--foreground)]">Total a pagar</span>
                                    <span className="tabular-nums text-[var(--foreground)]">
                                        {totalPayable !== null ? (
                                            <>
                                                {formatMoneyAmount(
                                                    totalPayable.amount,
                                                    totalPayable.currency,
                                                )}
                                            </>
                                        ) : skuPricesLoading ? (
                                            <span className="text-sm font-normal text-[var(--muted-foreground)]">
                                                …
                                            </span>
                                        ) : (
                                            <span className="text-sm font-normal text-[var(--muted-foreground)]">
                                                No hay precio de catálogo para alguna línea
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--muted-foreground)]">Líneas</span>
                                    <span className="font-semibold text-[var(--foreground)]">
                                        {lines.length}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--muted-foreground)]">Unidades</span>
                                    <span className="font-semibold text-[var(--foreground)]">{totalUnits}</span>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] pt-6">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                                    <Tag className="size-3.5 text-[var(--primary)]" aria-hidden />
                                    Cupón de descuento
                                </div>
                                {appliedCoupon ? (
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--primary)_35%,var(--border))] bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
                                            {appliedCoupon}
                                        </span>
                                        <button
                                            type="button"
                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] hover:text-[var(--destructive)]"
                                            onClick={removeCoupon}
                                        >
                                            <X className="size-3.5" aria-hidden />
                                            Quitar cupón
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                                        <input
                                            type="text"
                                            name="coupon"
                                            autoComplete="off"
                                            placeholder="Código"
                                            value={couponInput}
                                            onChange={(e) => {
                                                setCouponInput(e.target.value);
                                                setCouponError(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    void applyCoupon();
                                                }
                                            }}
                                            className="min-h-10 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-background/80 px-3 py-2 text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                                        />
                                        <button
                                            type="button"
                                            disabled={couponLoading}
                                            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--primary)_40%,var(--border))] bg-background/80 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
                                            onClick={() => void applyCoupon()}
                                        >
                                            {couponLoading ? 'Validando…' : 'Aplicar'}
                                        </button>
                                    </div>
                                )}
                                {couponError && (
                                    <p className="mt-2 text-xs text-[var(--destructive)]" role="alert">
                                        {couponError}
                                    </p>
                                )}
                                {couponHint && !couponError && (
                                    <p className="mt-2 text-xs leading-relaxed text-[color-mix(in_oklab,var(--primary)_85%,var(--foreground))]">
                                        {couponHint}
                                    </p>
                                )}
                            </div>

                            {typeof flash?.status === 'string' && flash.status !== '' ? (
                                <div
                                    role="status"
                                    className="mt-6 rounded-xl border border-[color-mix(in_oklab,var(--primary)_35%,var(--border))] bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] px-4 py-3 text-sm text-[var(--foreground)]"
                                >
                                    {flash.status}
                                </div>
                            ) : null}

                            {checkoutError ? (
                                <p className="mt-4 text-sm text-[var(--destructive)]" role="alert">
                                    {checkoutError}
                                </p>
                            ) : null}

                            {!auth?.user ? (
                                <Link
                                    href="/login"
                                    className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--primary)_40%,var(--border))] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    Inicia sesión para pagar con PayPal o Mercado Pago
                                </Link>
                            ) : (
                                <>
                                    <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                                                selectedGateway === 'paypal'
                                                    ? 'border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] text-[var(--foreground)]'
                                                    : 'border-[var(--border)] bg-background/70 text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                            }`}
                                            onClick={() => setSelectedGateway('paypal')}
                                        >
                                            PayPal
                                        </button>
                                        <button
                                            type="button"
                                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                                                selectedGateway === 'mercadopago'
                                                    ? 'border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] text-[var(--foreground)]'
                                                    : 'border-[var(--border)] bg-background/70 text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                            }`}
                                            onClick={() => setSelectedGateway('mercadopago')}
                                        >
                                            Mercado Pago
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={
                                            checkoutLoading ||
                                            skuPricesLoading ||
                                            totalPayable === null ||
                                            lines.length === 0
                                        }
                                        className="mt-6 w-full cursor-pointer rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60"
                                        onClick={() =>
                                            void (selectedGateway === 'mercadopago'
                                                ? startMercadoPagoCheckout()
                                                : startPayPalCheckout())
                                        }
                                    >
                                        {checkoutLoading
                                            ? selectedGateway === 'mercadopago'
                                                ? 'Conectando con Mercado Pago…'
                                                : 'Conectando con PayPal…'
                                            : selectedGateway === 'mercadopago'
                                              ? 'Pagar con Mercado Pago'
                                              : 'Pagar con PayPal'}
                                    </button>
                                    <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
                                        {selectedGateway === 'mercadopago'
                                            ? 'Mercado Pago Checkout Pro: serás redirigido para completar el pago.'
                                            : 'PayPal puede cobrar en USD; el pedido se registra en PEN.'}
                                    </p>
                                    {paypalSimulateCheckout && selectedGateway === 'paypal' ? (
                                        <button
                                            type="button"
                                            disabled={
                                                checkoutLoading ||
                                                skuPricesLoading ||
                                                totalPayable === null ||
                                                lines.length === 0
                                            }
                                            className="mt-3 w-full cursor-pointer rounded-xl border border-[color-mix(in_oklab,var(--primary)_40%,var(--border))] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60"
                                            onClick={() => void startPayPalSimulateCheckout()}
                                        >
                                            {checkoutLoading
                                                ? 'Procesando…'
                                                : 'Pago de prueba (sin PayPal)'}
                                        </button>
                                    ) : null}
                                </>
                            )}
                            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
                                Cuenta con rol <strong>cliente</strong> o <strong>superadmin</strong> (pruebas).
                                Pedidos internos: panel de ventas.
                            </p>
                            <Link
                                href="/software"
                                className="mt-3 block w-full cursor-pointer text-center text-sm font-semibold text-[var(--primary)] underline-offset-4 hover:underline"
                            >
                                Añadir otro producto
                            </Link>
                        </aside>
                    </div>
                )}
            </div>
        </MarketingLayout>
    );
}
