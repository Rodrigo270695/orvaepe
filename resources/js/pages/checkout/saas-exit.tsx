import { Head } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import { clearSoftwareCart, writeCartCoupon } from '@/lib/softwareCartStorage';

type Props = {
    redirectUrl: string;
};

/**
 * Tras Culqi/MP/PayPal: vacía el carrito local y salta al bootstrap del tenant.
 */
export default function CheckoutSaasExit({ redirectUrl }: Props) {
    useEffect(() => {
        clearSoftwareCart();
        writeCartCoupon(null);

        if (typeof redirectUrl === 'string' && redirectUrl.trim() !== '') {
            window.location.replace(redirectUrl);
        }
    }, [redirectUrl]);

    const hasUrl = typeof redirectUrl === 'string' && redirectUrl.trim() !== '';

    return (
        <>
            <Head title="Pago confirmado" />
            <main className="co-hero flex min-h-dvh items-center justify-center px-4 py-12 text-foreground">
                <div className="co-glass co-pop w-full max-w-lg overflow-hidden rounded-3xl text-center">
                    <div className="co-line" aria-hidden />
                    <div className="px-6 py-10 sm:px-10">
                        <CheckoutSteps current={3} className="mx-auto max-w-sm text-left" />
                        <span className="mx-auto mt-8 inline-flex size-16 items-center justify-center rounded-full bg-[color-mix(in_oklab,#0d9488_14%,var(--background))]">
                            <CheckCircle2 className="size-9 text-[#0d9488]" aria-hidden />
                        </span>
                        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            ¡Pago confirmado!
                        </h1>
                        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground" role="status">
                            Estamos abriendo tu sistema para que crees tu contraseña. Esto toma solo unos
                            segundos.
                        </p>
                        <div className="mt-8 flex justify-center" aria-hidden>
                            <span className="co-spinner" />
                        </div>
                        {hasUrl ? (
                            <a
                                href={redirectUrl}
                                className="mt-8 inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#c2410c] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] dark:text-[#fb923c]"
                            >
                                Si no avanza, entra aquí
                            </a>
                        ) : null}
                    </div>
                </div>
            </main>
        </>
    );
}
