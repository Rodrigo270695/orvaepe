import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    LockKeyhole,
    LogIn,
    Minus,
    Plus,
    RefreshCw,
    ShoppingBag,
    Sparkles,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CheckoutTrustRow from '@/components/checkout/CheckoutTrustRow';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import { marketingSeo } from '@/marketing/seoCopy';
import {
    cartTotalsWithIgv,
    effectiveLineUnit,
    formatPlanLabel,
    peruIgvLineAmounts,
    type SkuPriceRow,
} from '@/lib/cartPricing';
import { getCsrfToken } from '@/lib/csrf';
import { postMarketingCheckout } from '@/lib/marketingCheckout';
import {
    clearSoftwareCart,
    readCartCoupon,
    readSoftwareCart,
    removeCartLine,
    setCartLineQty,
    writeCartCoupon,
    writeSoftwareCart,
    captureVetSaaSReferralFromUrl,
    readVetSaaSReferralCode,
    writeVetSaaSReferralCode,
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

type CulqiWindow = Window & {
    Culqi?: {
        publicKey?: string;
        token?: { id?: string };
        error?: { user_message?: string };
        settings?: (config: unknown) => void;
        options?: (config: unknown) => void;
        open?: () => void;
    };
    CulqiCheckout?: new (publicKey: string, config: unknown) => {
        open: () => void;
        token?: { id?: string };
        error?: { user_message?: string };
        culqi?: () => void;
    };
    culqi?: () => void;
};

type ComprobantesOverageResponse = {
    applies?: boolean;
    overage_cost?: string;
    description?: string | null;
    used?: number;
    included?: number | null;
    overage_blocks?: number;
    currency?: string;
};

type RenewalAddonRow = {
    key: string;
    label: string;
    amount: number;
    igv_applies?: boolean;
};

type CartPageProps = {
    auth?: { user?: { name?: string } | null };
    flash?: { status?: string | null; toast?: unknown };
    /** Tasa IGV (ej. 0.18), alineada a config/sales */
    salesIgvRate?: number;
    vetsaasRenewTenantSlug?: string | null;
};

export default function MarketingCart() {
    const { auth, flash, salesIgvRate, vetsaasRenewTenantSlug } =
        usePage<CartPageProps>().props;
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
    const [rememberCard, setRememberCard] = useState(true);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [comprobantesOverage, setComprobantesOverage] =
        useState<ComprobantesOverageResponse | null>(null);
    const [comprobantesOverageLoading, setComprobantesOverageLoading] = useState(false);
    const [renewalAddons, setRenewalAddons] = useState<RenewalAddonRow[]>([]);

    const linesKeyRef = useRef<string | undefined>(undefined);
    const overageFetchId = useRef(0);
    const skipNextInvalidationRef = useRef(true);
    const skuPriceFetchId = useRef(0);

    const sync = useCallback(() => {
        setLines(readSoftwareCart());
    }, []);

    useEffect(() => {
        setMounted(true);
        sync();

        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const renewPlanId = params.get('renew_plan_id');
            if (renewPlanId) {
                const existing = readSoftwareCart();
                const already = existing.some((i) => i.planId === renewPlanId);
                if (!already) {
                    const renewalLine: SoftwareCartItem = {
                        systemSlug:
                            params.get('renew_system_slug')?.trim() || 'vetsaas',
                        planId: renewPlanId,
                        qty: 1,
                        planLabel: params.get('renew_label')?.trim() || undefined,
                    };
                    writeSoftwareCart([...existing, renewalLine]);
                    sync();
                }
                params.delete('renew_plan_id');
                params.delete('renew_system_slug');
                params.delete('renew_label');
                params.delete('renew');
                const qs = params.toString();
                const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
                window.history.replaceState({}, '', next);
            }
        }

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
        captureVetSaaSReferralFromUrl();
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
            setRenewalAddons([]);
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
                    setRenewalAddons([]);
                    return;
                }

                const data = (await res.json()) as {
                    prices?: Record<string, SkuPriceRow>;
                    renewal_addons?: RenewalAddonRow[];
                };
                setSkuPrices(data.prices ?? {});
                setRenewalAddons(
                    Array.isArray(data.renewal_addons)
                        ? data.renewal_addons.filter(
                              (row) =>
                                  typeof row?.amount === 'number' &&
                                  Number.isFinite(row.amount) &&
                                  row.amount > 0,
                          )
                        : [],
                );
            } catch (e) {
                if (e instanceof DOMException && e.name === 'AbortError') {
                    return;
                }
                if (fetchId !== skuPriceFetchId.current) {
                    return;
                }
                setSkuPrices({});
                setRenewalAddons([]);
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

    useEffect(() => {
        if (!mounted || !vetsaasRenewTenantSlug?.trim()) {
            setComprobantesOverage(null);
            setComprobantesOverageLoading(false);
            return;
        }

        if (renewalAddons.some((row) => row.key === 'comprobantes_overage')) {
            setComprobantesOverage(null);
            setComprobantesOverageLoading(false);
            return;
        }

        const fetchId = ++overageFetchId.current;
        const ac = new AbortController();

        setComprobantesOverageLoading(true);

        (async () => {
            try {
                const res = await fetch('/carrito/vetsaas-comprobantes-overage', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    signal: ac.signal,
                });

                if (fetchId !== overageFetchId.current) {
                    return;
                }

                if (!res.ok) {
                    setComprobantesOverage(null);
                    return;
                }

                const data = (await res.json()) as ComprobantesOverageResponse;
                setComprobantesOverage(data);
            } catch (e) {
                if (e instanceof DOMException && e.name === 'AbortError') {
                    return;
                }
                if (fetchId !== overageFetchId.current) {
                    return;
                }
                setComprobantesOverage(null);
            } finally {
                if (fetchId === overageFetchId.current) {
                    setComprobantesOverageLoading(false);
                }
            }
        })();

        return () => {
            ac.abort();
        };
    }, [mounted, vetsaasRenewTenantSlug, renewalAddons]);

    const renewalAddonsPen = useMemo(() => {
        const sum = renewalAddons.reduce((acc, row) => acc + row.amount, 0);

        return sum > 0 ? Math.round(sum * 100) / 100 : 0;
    }, [renewalAddons]);

    const comprobantesOveragePen = useMemo(() => {
        if (!comprobantesOverage?.applies) {
            return 0;
        }

        const amount = Number.parseFloat(comprobantesOverage.overage_cost ?? '0');

        return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) / 100 : 0;
    }, [comprobantesOverage]);

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
        const withAddons = Math.round(
            (grandTotal + renewalAddonsPen + comprobantesOveragePen) * 100,
        ) / 100;

        if (currency === 'PEN' && discountPen !== null && discountPen > 0) {
            return {
                amount: Math.max(0, Math.round((withAddons - discountPen) * 100) / 100),
                currency: 'PEN',
            };
        }

        return { amount: withAddons, currency };
    }, [totalsWithIgv, discountPen, comprobantesOveragePen, renewalAddonsPen]);

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

    const startCulqiCheckout = async () => {
        setCheckoutError(null);
        if (lines.length === 0 || totalPayable === null) {
            return;
        }

        setCheckoutLoading(true);
        try {
            const result = await postMarketingCheckout({
                gateway: 'culqi',
                lines: lines.map((l) => ({ plan_id: l.planId, qty: l.qty })),
                coupon_code: appliedCoupon,
                referral_code: readVetSaaSReferralCode(),
            });

            if (result.kind === 'unauthorized') {
                window.location.href = '/login';
                return;
            }

            if (result.kind === 'free_completed') {
                clearSoftwareCart();
                writeCartCoupon(null);
                writeVetSaaSReferralCode(null);
                if (result.redirectUrl) {
                    window.location.href = result.redirectUrl;
                    return;
                }
                window.location.href = `/carrito?status=${encodeURIComponent(result.message)}`;
                return;
            }

            if (result.kind === 'existing_account') {
                window.location.href = `/carrito?status=${encodeURIComponent(result.message)}`;
                return;
            }

            if (result.kind === 'culqi_inline') {
                const submitChargeForm = (tokenId: string) => {
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = `/checkout/culqi/${result.orderId}/charge`;

                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = '_token';
                    csrfInput.value = getCsrfToken();

                    const tokenInput = document.createElement('input');
                    tokenInput.type = 'hidden';
                    tokenInput.name = 'token_id';
                    tokenInput.value = tokenId;

                    const rememberInput = document.createElement('input');
                    rememberInput.type = 'hidden';
                    rememberInput.name = 'remember_card';
                    rememberInput.value = rememberCard ? '1' : '0';

                    form.appendChild(csrfInput);
                    form.appendChild(tokenInput);
                    form.appendChild(rememberInput);
                    document.body.appendChild(form);
                    form.submit();
                };

                const existingScript = document.querySelector<HTMLScriptElement>(
                    `script[src="${result.checkoutScriptUrl}"]`,
                );

                if (!existingScript) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = result.checkoutScriptUrl;
                        script.async = true;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error('No se pudo cargar el script de Culqi.'));
                        document.body.appendChild(script);
                    });
                }

                const config = {
                    settings: {
                        title: result.commerceName,
                        currency: result.currency,
                        amount: result.amountCents,
                    },
                    client: {
                        email: result.email,
                    },
                    options: {
                        lang: 'es',
                        installments: true,
                        paymentMethods: {
                            tarjeta: true,
                            yape: true,
                            billetera: true,
                            bancaMovil: true,
                            agente: true,
                            cuotealo: true,
                        },
                    },
                };

                const culqiWindow = window as CulqiWindow;
                if (culqiWindow.Culqi && culqiWindow.Culqi.open) {
                    culqiWindow.Culqi.publicKey = result.publicKey;
                    culqiWindow.Culqi.settings?.(config.settings);
                    culqiWindow.Culqi.options?.(config.options);

                    culqiWindow.culqi = () => {
                        if (culqiWindow.Culqi?.token?.id) {
                            submitChargeForm(culqiWindow.Culqi.token.id);
                            return;
                        }
                        const userMessage =
                            culqiWindow.Culqi?.error?.user_message ??
                            'No se pudo generar el token de pago.';
                        setCheckoutError(userMessage);
                    };

                    culqiWindow.Culqi.open();
                    return;
                }

                if (culqiWindow.CulqiCheckout) {
                    const instance = new culqiWindow.CulqiCheckout(result.publicKey, config);
                    instance.culqi = () => {
                        if (instance.token?.id) {
                            submitChargeForm(instance.token.id);
                            return;
                        }

                        const userMessage =
                            instance.error?.user_message ?? 'No se pudo generar el token de pago.';
                        setCheckoutError(userMessage);
                    };
                    instance.open();
                    return;
                }

                setCheckoutError('La librería de Culqi no está disponible en esta página.');
                return;
            }

            if (result.kind === 'redirect') {
                window.location.href = result.approvalUrl;
                return;
            }

            setCheckoutError(result.message);
        } catch {
            setCheckoutError('Error de red. Inténtalo de nuevo.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const lineAccent = (slug: string): string => {
        const s = slug.toLowerCase();

        if (s.includes('vetsaas')) {
            return '#0f766e';
        }

        if (s.includes('tallersaas')) {
            return '#c2410c';
        }

        if (s.startsWith('svc-')) {
            return '#7c3aed';
        }

        return '#2563eb';
    };

    const isFreeTotal = totalPayable !== null && totalPayable.amount <= 0;
    const payDisabled =
        checkoutLoading ||
        skuPricesLoading ||
        (vetsaasRenewTenantSlug ? comprobantesOverageLoading : false) ||
        totalPayable === null ||
        lines.length === 0;

    const loadingDash = (
        <span className="text-muted-foreground" aria-label="Cargando">
            …
        </span>
    );

    return (
        <MarketingLayout
            title={marketingSeo.carrito.title}
            description={marketingSeo.carrito.description}
            canonicalPath="/carrito"
            noindex
            structuredData="none"
        >
            <section className="co-hero relative overflow-hidden border-b border-[color-mix(in_oklab,var(--foreground)_8%,var(--border))]">
                <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 md:pb-12 md:pt-10">
                    <Link
                        href="/software"
                        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Seguir comprando
                    </Link>

                    <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c2410c] dark:text-[#fb923c]">
                                Compra ORVAE
                            </p>
                            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                Tu carrito
                            </h1>
                            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                                Revisa tus planes, aplica un cupón si tienes uno y paga en un solo paso.
                                Los precios incluyen el desglose de IGV.
                            </p>
                        </div>
                        {mounted && totalUnits > 0 ? (
                            <p className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,#0d9488_30%,var(--border))] bg-[color-mix(in_oklab,#0d9488_9%,var(--background))] px-3.5 py-1.5 text-sm font-semibold text-foreground">
                                <ShoppingBag className="size-4 text-[#0d9488]" aria-hidden />
                                {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'}
                            </p>
                        ) : null}
                    </div>

                    <CheckoutSteps current={1} className="mt-8 max-w-3xl" />
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">
                {vetsaasRenewTenantSlug ? (
                    <div className="co-glass mb-6 flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm text-foreground">
                        <RefreshCw className="mt-0.5 size-4 shrink-0 text-[#0d9488]" aria-hidden />
                        <p>
                            Renovación VetSaaS para la clínica{' '}
                            <span className="font-semibold">{vetsaasRenewTenantSlug}</span>. Inicia
                            sesión con la cuenta que contrató el plan y completa el pago.
                        </p>
                    </div>
                ) : null}

                {!mounted ? (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-busy="true">
                        <div className="space-y-4">
                            {[0, 1].map((i) => (
                                <div key={i} className="co-glass h-36 animate-pulse rounded-2xl motion-reduce:animate-none" />
                            ))}
                        </div>
                        <div className="co-glass h-80 animate-pulse rounded-2xl motion-reduce:animate-none" />
                    </div>
                ) : lines.length === 0 ? (
                    <div className="co-glass co-pop mx-auto max-w-2xl overflow-hidden rounded-3xl text-center">
                        <div className="co-line" aria-hidden />
                        <div className="px-6 py-14 sm:px-10">
                            <span className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,#ea580c_12%,var(--background))]">
                                <ShoppingBag className="size-8 text-[#ea580c]" aria-hidden />
                            </span>
                            <h2 className="mt-5 font-display text-2xl font-bold text-foreground">
                                Tu carrito está vacío
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                                Abre un sistema, elige el plan que te sirve y agrégalo aquí. Empieza por
                                nuestros SaaS más pedidos:
                            </p>
                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                <Link
                                    href="/software/VETSAAS"
                                    className="group flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[color-mix(in_oklab,#0d9488_35%,var(--border))] bg-[color-mix(in_oklab,#0d9488_7%,var(--background))] px-4 py-3 text-left transition-colors hover:bg-[color-mix(in_oklab,#0d9488_13%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
                                >
                                    <span>
                                        <span className="block text-sm font-bold text-foreground">VetSaaS</span>
                                        <span className="block text-xs text-muted-foreground">Clínicas veterinarias</span>
                                    </span>
                                    <ArrowRight className="size-4 text-[#0d9488] transition-transform group-hover:translate-x-0.5" aria-hidden />
                                </Link>
                                <Link
                                    href="/software/TALLERSAAS"
                                    className="group flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[color-mix(in_oklab,#ea580c_35%,var(--border))] bg-[color-mix(in_oklab,#ea580c_7%,var(--background))] px-4 py-3 text-left transition-colors hover:bg-[color-mix(in_oklab,#ea580c_13%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                                >
                                    <span>
                                        <span className="block text-sm font-bold text-foreground">TallerSaaS</span>
                                        <span className="block text-xs text-muted-foreground">Talleres mecánicos</span>
                                    </span>
                                    <ArrowRight className="size-4 text-[#ea580c] transition-transform group-hover:translate-x-0.5" aria-hidden />
                                </Link>
                            </div>
                            <Link href="/software" className="co-ghost mt-4 w-full sm:w-auto">
                                Ver todo el catálogo
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                        <section aria-labelledby="cart-lines-title" className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 id="cart-lines-title" className="text-lg font-bold text-foreground">
                                    Productos
                                    <span className="ml-2 text-sm font-medium text-muted-foreground">
                                        ({lines.length} {lines.length === 1 ? 'línea' : 'líneas'})
                                    </span>
                                </h2>
                                <Link
                                    href="/software"
                                    className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#c2410c] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] dark:text-[#fb923c]"
                                >
                                    <Plus className="size-4" aria-hidden />
                                    Añadir producto
                                </Link>
                            </div>

                            <ul className="space-y-4">
                                {cartLineRows.map(({ line, unit, igvAppliesSku, amounts, productHref }) => {
                                    const accent = lineAccent(line.systemSlug);
                                    const name = line.systemName ?? line.systemSlug;
                                    const planName = skuPrices[line.planId]?.name ?? formatPlanLabel(line);

                                    return (
                                        <li
                                            key={`${line.systemSlug}:${line.planId}`}
                                            className="co-glass co-pop relative overflow-hidden rounded-2xl"
                                        >
                                            <span
                                                className="absolute inset-y-0 left-0 w-1"
                                                style={{ background: accent }}
                                                aria-hidden
                                            />
                                            <div className="flex flex-col gap-4 p-4 pl-5 sm:p-5 sm:pl-6">
                                                <div className="flex items-start gap-3.5">
                                                    <span
                                                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
                                                        style={{ background: accent }}
                                                        aria-hidden
                                                    >
                                                        {name.trim().charAt(0).toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <Link
                                                            href={productHref}
                                                            className="cursor-pointer text-base font-bold leading-snug text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                                                        >
                                                            {name}
                                                        </Link>
                                                        <p className="mt-0.5 text-sm text-muted-foreground">{planName}</p>
                                                        {line.priceText ? (
                                                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                                {line.priceText}
                                                            </p>
                                                        ) : null}
                                                        {unit !== null && igvAppliesSku === false ? (
                                                            <p className="mt-2 inline-flex rounded-md bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                                                No aplica IGV
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] hover:text-[var(--destructive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--destructive)]"
                                                        onClick={() => remove(line)}
                                                        aria-label={`Quitar ${name} del carrito`}
                                                    >
                                                        <Trash2 className="size-4" aria-hidden />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[color-mix(in_oklab,var(--foreground)_7%,var(--border))] pt-4">
                                                    <div>
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                            Cantidad
                                                        </p>
                                                        <div className="co-qty mt-1.5" role="group" aria-label={`Cantidad de ${name}`}>
                                                            <button
                                                                type="button"
                                                                aria-label="Reducir cantidad"
                                                                onClick={() => bumpQty(line, -1)}
                                                            >
                                                                <Minus className="size-4" aria-hidden />
                                                            </button>
                                                            <span className="min-w-10 text-center text-base font-bold tabular-nums" aria-live="polite">
                                                                {line.qty}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                aria-label="Aumentar cantidad"
                                                                onClick={() => bumpQty(line, 1)}
                                                            >
                                                                <Plus className="size-4" aria-hidden />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <dl className="flex items-end gap-6 text-right">
                                                        <div>
                                                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Precio unit.
                                                            </dt>
                                                            <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
                                                                {unit !== null
                                                                    ? formatMoneyAmount(unit.list_price, unit.currency)
                                                                    : skuPricesLoading
                                                                      ? loadingDash
                                                                      : '—'}
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Total
                                                            </dt>
                                                            <dd className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">
                                                                {amounts !== null && unit !== null
                                                                    ? formatMoneyAmount(amounts.lineTotal, unit.currency)
                                                                    : skuPricesLoading
                                                                      ? loadingDash
                                                                      : '—'}
                                                            </dd>
                                                        </div>
                                                    </dl>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>

                        <aside
                            aria-labelledby="cart-summary-title"
                            className="co-glass overflow-hidden rounded-3xl lg:sticky lg:top-28"
                        >
                            <div className="co-line" aria-hidden />
                            <div className="p-5 sm:p-6">
                                <h2 id="cart-summary-title" className="font-display text-xl font-bold text-foreground">
                                    Resumen del pedido
                                </h2>

                                <dl className="mt-5 space-y-2.5 text-sm">
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-muted-foreground">Subtotal (base imponible)</dt>
                                        <dd className="font-semibold tabular-nums text-foreground">
                                            {totalsWithIgv !== null
                                                ? formatMoneyAmount(totalsWithIgv.subtotalBase, totalsWithIgv.currency)
                                                : skuPricesLoading
                                                  ? loadingDash
                                                  : '—'}
                                        </dd>
                                    </div>
                                    {totalsWithIgv !== null ? (
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-muted-foreground">IGV ({Math.round(igvRate * 100)}%)</dt>
                                            <dd className="font-semibold tabular-nums text-foreground">
                                                {formatMoneyAmount(totalsWithIgv.taxTotal, totalsWithIgv.currency)}
                                            </dd>
                                        </div>
                                    ) : null}
                                    {renewalAddons.map((addon) => (
                                        <div key={addon.key} className="flex justify-between gap-3">
                                            <dt className="max-w-[13rem] text-muted-foreground">{addon.label}</dt>
                                            <dd className="text-right font-semibold tabular-nums text-foreground">
                                                {formatMoneyAmount(addon.amount, 'PEN')}
                                            </dd>
                                        </div>
                                    ))}
                                    {comprobantesOveragePen > 0 ? (
                                        <div className="flex justify-between gap-3">
                                            <dt className="max-w-[13rem] text-muted-foreground">
                                                {comprobantesOverage?.description ?? 'Comprobantes electrónicos adicionales'}
                                            </dt>
                                            <dd className="text-right font-semibold tabular-nums text-foreground">
                                                {comprobantesOverageLoading
                                                    ? loadingDash
                                                    : formatMoneyAmount(comprobantesOveragePen, 'PEN')}
                                            </dd>
                                        </div>
                                    ) : vetsaasRenewTenantSlug && comprobantesOverageLoading ? (
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-muted-foreground">Comprobantes adicionales</dt>
                                            <dd>{loadingDash}</dd>
                                        </div>
                                    ) : null}
                                    {appliedCoupon && discountPen !== null && discountPen > 0 ? (
                                        <>
                                            <div className="flex justify-between gap-3">
                                                <dt className="text-muted-foreground">Base elegible (cupón)</dt>
                                                <dd className="tabular-nums text-foreground">
                                                    {eligibleSubtotalPen !== null
                                                        ? formatMoneyAmount(eligibleSubtotalPen, 'PEN')
                                                        : '—'}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <dt className="inline-flex items-center gap-1.5 font-semibold text-[#0f766e] dark:text-[#2dd4bf]">
                                                    <Tag className="size-3.5" aria-hidden />
                                                    Descuento
                                                </dt>
                                                <dd className="font-semibold tabular-nums text-[#0f766e] dark:text-[#2dd4bf]">
                                                    −{formatMoneyAmount(discountPen, 'PEN')}
                                                </dd>
                                            </div>
                                        </>
                                    ) : null}
                                </dl>

                                <div className="mt-5 rounded-2xl bg-[color-mix(in_oklab,#ea580c_8%,var(--background))] px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Total a pagar
                                    </p>
                                    <p className="mt-1 font-display text-3xl font-bold tabular-nums tracking-tight text-foreground" aria-live="polite">
                                        {totalPayable !== null ? (
                                            formatMoneyAmount(totalPayable.amount, totalPayable.currency)
                                        ) : skuPricesLoading ? (
                                            loadingDash
                                        ) : (
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Falta el precio de catálogo de alguna línea
                                            </span>
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {lines.length} {lines.length === 1 ? 'línea' : 'líneas'} · {totalUnits}{' '}
                                        {totalUnits === 1 ? 'unidad' : 'unidades'} · IGV incluido
                                    </p>
                                </div>

                                <div className="mt-5">
                                    <label
                                        htmlFor="cart-coupon"
                                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                                    >
                                        <Tag className="size-3.5 text-[#ea580c]" aria-hidden />
                                        Cupón de descuento
                                    </label>
                                    {appliedCoupon ? (
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,#0d9488_40%,var(--border))] bg-[color-mix(in_oklab,#0d9488_10%,var(--background))] px-3 font-mono text-sm font-semibold text-foreground">
                                                {appliedCoupon}
                                            </span>
                                            <button
                                                type="button"
                                                className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-[var(--destructive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--destructive)]"
                                                onClick={removeCoupon}
                                            >
                                                <X className="size-3.5" aria-hidden />
                                                Quitar cupón
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                id="cart-coupon"
                                                type="text"
                                                name="coupon"
                                                autoComplete="off"
                                                placeholder="Ej. ORVAE10"
                                                value={couponInput}
                                                aria-invalid={couponError ? 'true' : undefined}
                                                aria-describedby={couponError ? 'cart-coupon-error' : undefined}
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
                                                className="co-field min-w-0 flex-1 font-mono uppercase placeholder:normal-case"
                                            />
                                            <button
                                                type="button"
                                                disabled={couponLoading}
                                                className="co-ghost shrink-0"
                                                onClick={() => void applyCoupon()}
                                            >
                                                {couponLoading ? 'Validando…' : 'Aplicar'}
                                            </button>
                                        </div>
                                    )}
                                    {couponError ? (
                                        <p id="cart-coupon-error" className="mt-2 text-xs font-medium text-[var(--state-danger)]" role="alert">
                                            {couponError}
                                        </p>
                                    ) : null}
                                    {couponHint && !couponError ? (
                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{couponHint}</p>
                                    ) : null}
                                </div>

                                {typeof flash?.status === 'string' && flash.status !== '' ? (
                                    <div
                                        role="status"
                                        className="mt-5 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_oklab,#0d9488_35%,var(--border))] bg-[color-mix(in_oklab,#0d9488_9%,var(--background))] px-3.5 py-3 text-sm text-foreground"
                                    >
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0d9488]" aria-hidden />
                                        {flash.status}
                                    </div>
                                ) : null}

                                {checkoutError ? (
                                    <p
                                        className="mt-5 rounded-xl border border-[color-mix(in_oklab,var(--destructive)_35%,var(--border))] bg-[color-mix(in_oklab,var(--destructive)_8%,var(--background))] px-3.5 py-3 text-sm text-foreground"
                                        role="alert"
                                    >
                                        {checkoutError}
                                    </p>
                                ) : null}

                                {!auth?.user ? (
                                    <div className="mt-6">
                                        <Link href="/login" className="co-cta w-full">
                                            <LogIn className="size-4" aria-hidden />
                                            Inicia sesión para pagar
                                        </Link>
                                        <p className="mt-2 text-center text-xs text-muted-foreground">
                                            Tu carrito se mantiene al volver.{' '}
                                            <Link
                                                href="/register"
                                                className="font-semibold text-foreground underline underline-offset-4"
                                            >
                                                Crear cuenta
                                            </Link>
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[color-mix(in_oklab,var(--foreground)_9%,var(--border))] bg-[color-mix(in_oklab,var(--background)_60%,transparent)] px-3.5 py-3 text-sm">
                                            <input
                                                type="checkbox"
                                                className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#ea580c]"
                                                checked={rememberCard}
                                                onChange={(e) => setRememberCard(e.target.checked)}
                                            />
                                            <span>
                                                <span className="font-semibold text-foreground">
                                                    Recordar mi tarjeta para renovaciones
                                                </span>
                                                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                                                    Solo aplica a tarjeta. Yape y billeteras no se guardan.
                                                </span>
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            disabled={payDisabled}
                                            className="co-cta mt-4 w-full"
                                            onClick={() => void startCulqiCheckout()}
                                        >
                                            {isFreeTotal ? (
                                                <Sparkles className="size-4" aria-hidden />
                                            ) : (
                                                <LockKeyhole className="size-4" aria-hidden />
                                            )}
                                            {checkoutLoading
                                                ? isFreeTotal
                                                    ? 'Activando tu plan…'
                                                    : 'Abriendo pago seguro…'
                                                : isFreeTotal
                                                  ? 'Activar plan gratuito'
                                                  : totalPayable !== null
                                                    ? `Pagar ${formatMoneyAmount(totalPayable.amount, totalPayable.currency)}`
                                                    : 'Pagar'}
                                        </button>
                                        <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
                                            {isFreeTotal
                                                ? 'Confirmamos tu pedido sin cobro y te enviamos el acceso por correo.'
                                                : 'Se abrirá la ventana segura de Culqi: tarjeta, Yape, billetera o banca móvil.'}
                                        </p>
                                    </>
                                )}

                                <CheckoutTrustRow compact className="mt-5" />
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </MarketingLayout>
    );
}
