import { Link } from '@inertiajs/react';

import panel from '@/routes/panel';

type Props = {
    paymentGatewayEnabled: boolean;
    pendingPaymentCount: number;
};

/**
 * Bloque hundido (misma línea visual que el contenedor de tabla en órdenes).
 */
export default function VentasPagosPasarelaPanel({
    paymentGatewayEnabled,
    pendingPaymentCount,
}: Props) {
    return (
        <div className="neumorph-inset overflow-hidden rounded-xl border border-border/60 p-4 md:p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Integración actual
            </h2>
            <div className="mt-3 space-y-3 text-sm text-foreground">
                <p className="leading-relaxed text-muted-foreground">
                    La variable de entorno{' '}
                    <code className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-[11px] text-[#4A80B8]">
                        PAYMENTS_GATEWAY_ENABLED
                    </code>{' '}
                    controla si el portal cliente muestra el flujo de pago
                    online. Hoy{' '}
                    <span className="font-medium text-foreground">
                        {paymentGatewayEnabled
                            ? 'está en true: prepara los webhooks y el checkout.'
                            : 'está en false: los clientes solo ven el estado del pedido.'}
                    </span>
                </p>
                <p className="leading-relaxed text-muted-foreground">
                    Los cobros se reflejan en los pedidos (
                    <Link
                        href={panel.ventasOrdenes.index.url()}
                        prefetch
                        className="font-medium text-[#4A80B8] underline-offset-2 hover:underline"
                    >
                        Órdenes de venta
                    </Link>
                    ). Hay{' '}
                    <span className="font-mono font-medium text-foreground">
                        {pendingPaymentCount}
                    </span>{' '}
                    pedido
                    {pendingPaymentCount === 1 ? '' : 's'} con estado
                    pendiente de pago.
                </p>
                <ul className="list-inside list-disc space-y-1.5 text-[13px] text-muted-foreground">
                    <li>
                        Abajo ves el listado paginado de la tabla{' '}
                        <code className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-[11px] text-[#4A80B8]">
                            payments
                        </code>{' '}
                        (pasarela, importe, id externo, enlace al pedido).
                    </li>
                    <li>
                        Portal cliente — página «Pagos»: lista pedidos; el
                        botón de cobro depende de la pasarela y la config.
                    </li>
                </ul>
            </div>
        </div>
    );
}
