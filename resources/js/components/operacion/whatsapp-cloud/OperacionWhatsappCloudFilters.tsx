import { router, usePage } from '@inertiajs/react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import OperacionWebhooksSearch from '@/components/operacion/webhooks/OperacionWebhooksSearch';
import { productoLabel } from '@/components/operacion/whatsapp-cloud/whatsappCloudDisplay';
import type { WhatsappCloudFilters } from '@/components/operacion/whatsapp-cloud/whatsappCloudTypes';
import VentasOrdenesDateRangeFilter from '@/components/sales/orders/VentasOrdenesDateRangeFilter';

type Props = {
    filters: WhatsappCloudFilters;
    productos: string[];
};

const ALL = '_all_';

export default function OperacionWhatsappCloudFilters({
    filters,
    productos,
}: Props) {
    const page = usePage();

    const setParam = (key: string, next: string) => {
        const currentUrl = new URL(page.url, window.location.origin);
        if (next === ALL) {
            currentUrl.searchParams.delete(key);
        } else {
            currentUrl.searchParams.set(key, next);
        }
        currentUrl.searchParams.set('page', '1');
        router.get(
            currentUrl.pathname + currentUrl.search,
            {},
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const selects = [
        {
            key: 'tipo',
            label: 'Tipo',
            value: filters.tipo,
            options: [
                { value: ALL, label: 'Todos' },
                { value: 'status', label: 'Estados de envío' },
                { value: 'failed', label: 'Solo fallidos' },
                { value: 'message', label: 'Mensajes entrantes' },
            ],
        },
        {
            key: 'producto',
            label: 'Producto',
            value: filters.producto,
            options: [
                { value: ALL, label: 'Todos' },
                ...productos.map((p) => ({
                    value: p,
                    label: productoLabel(p),
                })),
            ],
        },
        {
            key: 'processed',
            label: 'Procesado',
            value: filters.processed,
            options: [
                { value: ALL, label: 'Todos' },
                { value: '1', label: 'Sí' },
                { value: '0', label: 'No' },
            ],
        },
    ];

    return (
        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
            <div className="w-full max-w-sm min-w-0 sm:w-auto">
                <OperacionWebhooksSearch
                    initialQuery={filters.q ?? ''}
                    placeholder="wamid, teléfono, tenant o recordatorio…"
                    className="mt-1"
                />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={filters.date_from ?? ''}
                initialDateTo={filters.date_to ?? ''}
            />
            {selects.map((s) => (
                <div
                    key={s.key}
                    className="w-[min(100%,12rem)] shrink-0 space-y-1.5"
                >
                    <AdminUnderlineLabel htmlFor={`filter_wa_${s.key}`}>
                        {s.label}
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id={`filter_wa_${s.key}`}
                        name={`filter_wa_${s.key}`}
                        value={s.value ? s.value : ALL}
                        onValueChange={(next) => setParam(s.key, next)}
                        options={s.options}
                    />
                </div>
            ))}
        </div>
    );
}
