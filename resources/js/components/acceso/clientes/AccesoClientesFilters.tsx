import VentasSuscripcionesSearch from '@/components/sales/subscriptions/VentasSuscripcionesSearch';

type Props = {
    initialQuery: string;
    className?: string;
};

export default function AccesoClientesFilters({
    initialQuery,
    className,
}: Props) {
    return (
        <div
            className={[
                'flex flex-wrap items-end gap-x-3 gap-y-3',
                className ?? '',
            ].join(' ')}
        >
            <div className="w-full min-w-0 sm:w-[24rem] md:w-[28rem]">
                <VentasSuscripcionesSearch
                    initialQuery={initialQuery}
                    wide
                    placeholder="Cliente, correo o N° documento…"
                />
            </div>
        </div>
    );
}
