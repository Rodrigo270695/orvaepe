import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

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
            title={`Checkout Culqi · ${order.order_number}`}
            description="Finaliza tu compra con Culqi de forma segura."
            canonicalPath={`/checkout/culqi/${order.id}`}
            noindex
            structuredData="none"
        >
            <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-10">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
                    <h1 className="text-xl font-bold text-[var(--foreground)] md:text-2xl">
                        Finalizar pago con Culqi
                    </h1>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        Pedido <strong>{order.order_number}</strong>. Al continuar, se abrirá Culqi Checkout para
                        tokenizar tu medio de pago de forma segura.
                    </p>

                    <div className="mt-5 rounded-xl border border-[var(--border)] bg-background/60 p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-[var(--muted-foreground)]">Total a pagar</span>
                            <strong className="text-base text-[var(--foreground)]">
                                {formatMoney(order.grand_total, order.currency)}
                            </strong>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                            <span className="text-[var(--muted-foreground)]">Correo de pago</span>
                            <span className="font-medium text-[var(--foreground)]">{order.email}</span>
                        </div>
                    </div>

                    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-background/40 px-4 py-3 text-sm">
                        <input
                            type="checkbox"
                            className="mt-0.5 size-4 cursor-pointer accent-[var(--primary)]"
                            checked={rememberCard}
                            onChange={(e) => setRememberCard(e.target.checked)}
                        />
                        <span>
                            <span className="font-semibold text-[var(--foreground)]">
                                Recordar mi tarjeta para renovaciones
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-[var(--muted-foreground)]">
                                Activo por defecto. Solo aplica si pagas con tarjeta. Yape y billeteras no se pueden
                                guardar; en ese caso la renovación será manual.
                            </span>
                        </span>
                    </label>

                    {typeof flash?.status === 'string' && flash.status !== '' ? (
                        <p className="mt-4 rounded-lg border border-[var(--border)] bg-background/60 px-3 py-2 text-sm text-[var(--foreground)]">
                            {flash.status}
                        </p>
                    ) : null}

                    {error ? <p className="mt-4 text-sm text-[var(--state-danger)]">{error}</p> : null}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => void openCulqiCheckout()}
                            disabled={loading}
                            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[linear-gradient(120deg,var(--state-info),var(--state-success))] px-5 py-3 text-sm font-semibold text-[color-mix(in_oklab,white_95%,var(--foreground))] transition-colors hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-info)] disabled:opacity-60"
                        >
                            {loading ? 'Abriendo Culqi…' : 'Pagar ahora con Culqi'}
                        </button>
                        <Link
                            href="/carrito"
                            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-background/60"
                        >
                            Volver al carrito
                        </Link>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}

