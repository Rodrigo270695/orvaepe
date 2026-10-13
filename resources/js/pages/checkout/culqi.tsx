import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CheckoutTrustRow from '@/components/checkout/CheckoutTrustRow';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import { getCsrfToken } from '@/lib/csrf';

type CulqiCheckoutPageProps = {
    order: {
        id: string;
        order_number: string;
        grand_total: number;
        currency: string;
        email: string;
    };
    culqi: {
        enabled: boolean;
        publicKey: string;
        checkoutScriptUrl: string;
        commerceName: string;
    };
    flash?: { status?: string | null };
};

type CulqiWindow = Window & {
    Culqi?: {
        publicKey?: string;
        token?: { id?: string };
        error?: { user_message?: string };
        settings?: (config: unknown) => void;
        options?: (config: unknown) => void;
        open?: () => void;
        close?: () => void;
    };
    CulqiCheckout?: new (publicKey: string, config: unknown) => {
        open: () => void;
        close?: () => void;
        token?: { id?: string };
        error?: { user_message?: string };
        culqi?: () => void;
    };
    culqi?: () => void;
};

function formatMoney(amount: number, currency: string): string {
    return `${amount.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${currency}`;
}

export default function CulqiCheckoutPage() {
    const { order, culqi, flash } = usePage<CulqiCheckoutPageProps>().props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rememberCard, setRememberCard] = useState(true);

    const amountCents = useMemo(
        () => Math.round((order.grand_total ?? 0) * 100),
        [order.grand_total],
    );

    const submitChargeForm = (tokenId: string) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/checkout/culqi/${order.id}/charge`;

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

    const openCulqiCheckout = async () => {
        setError(null);
        if (!culqi.enabled) {
            setError('Culqi no está configurado todavía. Revisa CULQI_PUBLIC_KEY y CULQI_SECRET_KEY.');
            return;
        }

        setLoading(true);

        try {
            const existingScript = document.querySelector<HTMLScriptElement>(
                `script[src="${culqi.checkoutScriptUrl}"]`,
            );

            if (!existingScript) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = culqi.checkoutScriptUrl;
                    script.async = true;
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('No se pudo cargar el script de Culqi.'));
                    document.body.appendChild(script);
                });
            }

            const config = {
                settings: {
                    title: culqi.commerceName || 'ORVAE',
                    currency: order.currency,
                    amount: amountCents,
                },
                client: {
                    email: order.email,
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

            // Flujo recomendado en docs actuales (global Culqi + window.culqi).
            if (culqiWindow.Culqi && culqiWindow.Culqi.open) {
                culqiWindow.Culqi.publicKey = culqi.publicKey;
                culqiWindow.Culqi.settings?.(config.settings);
                culqiWindow.Culqi.options?.(config.options);

                culqiWindow.culqi = () => {
                    if (culqiWindow.Culqi?.token?.id) {
                        submitChargeForm(culqiWindow.Culqi.token.id);
                        return;
                    }

                    const userMessage =
                        culqiWindow.Culqi?.error?.user_message ?? 'No se pudo generar el token de pago.';
                    setError(userMessage);
                    setLoading(false);
                };

                culqiWindow.Culqi.open();
                setLoading(false);
                return;
            }

            // Compatibilidad con API constructor (CulqiCheckout).
            if (culqiWindow.CulqiCheckout) {
                const instance = new culqiWindow.CulqiCheckout(culqi.publicKey, config);

                instance.culqi = () => {
                    if (instance.token?.id) {
                        submitChargeForm(instance.token.id);
                        return;
                    }

                    const userMessage = instance.error?.user_message ?? 'No se pudo generar el token de pago.';
                    setError(userMessage);
                    setLoading(false);
                };

                instance.open();
                setLoading(false);
                return;
            }

            throw new Error('La librería de Culqi no está disponible en esta página.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error inesperado al abrir Culqi.');
            setLoading(false);
        }
    };

    return (
        <MarketingLayout
            title={`Pago seguro · ${order.order_number}`}
            description="Finaliza tu compra con Culqi de forma segura."
            canonicalPath={`/checkout/culqi/${order.id}`}
            noindex
            structuredData="none"
        >
            <section className="co-hero relative overflow-hidden">
                <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 md:pt-10">
                    <Link
                        href="/carrito"
                        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Volver al carrito
                    </Link>

                    <CheckoutSteps current={2} className="mt-6 max-w-3xl" />

                    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
                        <div className="co-glass co-pop overflow-hidden rounded-3xl">
                            <div className="co-line" aria-hidden />
                            <div className="p-6 sm:p-8">
                                <p className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1d4ed8] dark:text-[#93c5fd]">
                                    <ShieldCheck className="size-4" aria-hidden />
                                    Pago seguro
                                </p>
                                <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                    Finaliza tu pago
                                </h1>
                                <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                                    Se abrirá la ventana de Culqi para que ingreses tu medio de pago. ORVAE
                                    nunca ve ni guarda los datos completos de tu tarjeta.
                                </p>

                                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Medios de pago aceptados">
                                    {['Tarjeta', 'Yape', 'Billeteras', 'Banca móvil', 'Agentes', 'Cuotéalo'].map((m) => (
                                        <li
                                            key={m}
                                            className="rounded-full border border-[color-mix(in_oklab,var(--foreground)_10%,var(--border))] bg-[color-mix(in_oklab,var(--background)_75%,transparent)] px-3 py-1 text-xs font-semibold text-foreground"
                                        >
                                            {m}
                                        </li>
                                    ))}
                                </ul>

                                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[color-mix(in_oklab,var(--foreground)_9%,var(--border))] bg-[color-mix(in_oklab,var(--background)_60%,transparent)] px-4 py-3.5 text-sm">
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
                                            Solo aplica si pagas con tarjeta. Con Yape o billeteras la renovación
                                            será manual.
                                        </span>
                                    </span>
                                </label>

                                {typeof flash?.status === 'string' && flash.status !== '' ? (
                                    <p
                                        role="status"
                                        className="mt-5 rounded-xl border border-[color-mix(in_oklab,#0d9488_35%,var(--border))] bg-[color-mix(in_oklab,#0d9488_9%,var(--background))] px-3.5 py-3 text-sm text-foreground"
                                    >
                                        {flash.status}
                                    </p>
                                ) : null}

                                {error ? (
                                    <p
                                        role="alert"
                                        className="mt-5 rounded-xl border border-[color-mix(in_oklab,var(--destructive)_35%,var(--border))] bg-[color-mix(in_oklab,var(--destructive)_8%,var(--background))] px-3.5 py-3 text-sm text-foreground"
                                    >
                                        {error}
                                    </p>
                                ) : null}

                                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => void openCulqiCheckout()}
                                        disabled={loading}
                                        className="co-cta sm:flex-1"
                                    >
                                        <LockKeyhole className="size-4" aria-hidden />
                                        {loading
                                            ? 'Abriendo pago seguro…'
                                            : `Pagar ${formatMoney(order.grand_total, order.currency)}`}
                                    </button>
                                    <Link href="/carrito" className="co-ghost">
                                        Volver al carrito
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <aside aria-labelledby="culqi-order-title" className="co-glass rounded-3xl p-5 sm:p-6 lg:sticky lg:top-28">
                            <h2 id="culqi-order-title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Tu pedido
                            </h2>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between gap-3">
                                    <dt className="text-muted-foreground">N.º de pedido</dt>
                                    <dd className="font-mono font-semibold text-foreground">{order.order_number}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-muted-foreground">Correo</dt>
                                    <dd className="min-w-0 truncate font-medium text-foreground" title={order.email}>
                                        {order.email}
                                    </dd>
                                </div>
                            </dl>
                            <div className="mt-5 rounded-2xl bg-[color-mix(in_oklab,#ea580c_8%,var(--background))] px-4 py-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total a pagar
                                </p>
                                <p className="mt-1 font-display text-3xl font-bold tabular-nums text-foreground">
                                    {formatMoney(order.grand_total, order.currency)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">IGV incluido</p>
                            </div>
                            <CheckoutTrustRow compact className="mt-5" />
                        </aside>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
