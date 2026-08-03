import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

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

    return (
        <>
            <Head title="Abriendo tu clínica" />
            <div className="flex min-h-dvh items-center justify-center bg-[var(--background,#0b1220)] px-6 text-center">
                <div className="max-w-md">
                    <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground,#f8fafc)]">
                        Activación lista
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted-foreground,#94a3b8)]">
                        Te estamos llevando a tu clínica para crear tu contraseña…
                    </p>
                </div>
            </div>
        </>
    );
}
