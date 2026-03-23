import VentasOrdenesDateRangeFilter from '@/components/sales/orders/VentasOrdenesDateRangeFilter';
import VentasSuscripcionesSearch from '@/components/sales/subscriptions/VentasSuscripcionesSearch';

type Props = {
    initialQuery: string;
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

export default function AccesoClientesFilters({
    initialQuery,
    initialDateFrom,
    initialDateTo,
    className,
}: Props) {
    return (
        <div
            className={[
                'flex flex-wrap items-end gap-x-3 gap-y-3',
                className ?? '',
            ].join(' ')}
        >
            <div className="w-full min-w-0 max-w-sm sm:w-auto">
                <VentasSuscripcionesSearch
                    initialQuery={initialQuery}
                    placeholder="Cliente, correo o N° documento…"
                />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={initialDateFrom}
                initialDateTo={initialDateTo}
            />
        </div>
    );
}
