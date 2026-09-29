import { router, usePage } from '@inertiajs/react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import AdminNeuInsetDateInput from '@/components/admin/form/admin-neu-inset-date-input';
import { planPeriodOptions } from '@/components/sales/deliveries/deliveryTypes';
import VentasEntregasSearch from '@/components/sales/deliveries/VentasEntregasSearch';
import * as React from 'react';

type Props = {
    initialQuery: string;
    initialIgv: string;
    initialPlan: string;
    initialCobro: string;
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

export default function VentasEntregasFilters({
    initialQuery,
    initialIgv,
    initialPlan,
    initialCobro,
    initialDateFrom,
    initialDateTo,
    className,
}: Props) {
    const page = usePage();
    const [dateFrom, setDateFrom] = React.useState(initialDateFrom);
    const [dateTo, setDateTo] = React.useState(initialDateTo);

    React.useEffect(() => {
        setDateFrom(initialDateFrom);
    }, [initialDateFrom]);

    React.useEffect(() => {
        setDateTo(initialDateTo);
    }, [initialDateTo]);

    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            const currentUrl = new URL(window.location.href);
            const curFrom = currentUrl.searchParams.get('date_from') ?? '';
            const curTo = currentUrl.searchParams.get('date_to') ?? '';
            if (curFrom === dateFrom && curTo === dateTo) {
                return;
            }
            if (dateFrom !== '') {
                currentUrl.searchParams.set('date_from', dateFrom);
            } else {
                currentUrl.searchParams.delete('date_from');
            }
            if (dateTo !== '') {
                currentUrl.searchParams.set('date_to', dateTo);
            } else {
                currentUrl.searchParams.delete('date_to');
            }
            currentUrl.searchParams.set('page', '1');
            router.get(
                currentUrl.pathname + currentUrl.search,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, 350);

        return () => window.clearTimeout(timer);
    }, [dateFrom, dateTo]);

    return (
        <div
            className={[
                'flex flex-wrap items-end gap-x-3 gap-y-3',
                className ?? '',
            ].join(' ')}
        >
            <div className="w-full min-w-0 max-w-sm sm:w-auto">
                <VentasEntregasSearch initialQuery={initialQuery} />
            </div>
            <div className="w-[min(100%,11rem)] shrink-0 sm:w-44">
                <AdminNeuInsetDateInput
                    id="entrega_filter_date_from"
                    label="Entrega desde"
                    value={dateFrom}
                    onChange={setDateFrom}
                />
            </div>
            <div className="w-[min(100%,11rem)] shrink-0 sm:w-44">
                <AdminNeuInsetDateInput
                    id="entrega_filter_date_to"
                    label="Entrega hasta"
                    value={dateTo}
                    onChange={setDateTo}
                />
            </div>
            <div className="w-[min(100%,14rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="entrega_filter_igv">
                    IGV
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="entrega_filter_igv"
                    name="entrega_filter_igv"
                    value={initialIgv || '_all_'}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete('igv');
                        } else {
                            currentUrl.searchParams.set('igv', next);
                        }
                        currentUrl.searchParams.set('page', '1');
                        router.get(
                            currentUrl.pathname + currentUrl.search,
                            {},
                            {
                                preserveScroll: true,
                                preserveState: true,
                                replace: true,
                            },
                        );
                    }}
                    options={[
                        { value: '_all_', label: 'Todos' },
                        { value: '1', label: 'Incluye IGV' },
                        { value: '0', label: 'Sin IGV' },
                    ]}
                />
            </div>
            <div className="w-[min(100%,14rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="entrega_filter_plan">
                    Plan
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="entrega_filter_plan"
                    name="entrega_filter_plan"
                    value={initialPlan || '_all_'}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete('plan');
                        } else {
                            currentUrl.searchParams.set('plan', next);
                        }
                        currentUrl.searchParams.set('page', '1');
                        router.get(
                            currentUrl.pathname + currentUrl.search,
                            {},
                            {
                                preserveScroll: true,
                                preserveState: true,
                                replace: true,
                            },
                        );
                    }}
                    options={[
                        { value: '_all_', label: 'Todos' },
                        ...planPeriodOptions,
                    ]}
                />
            </div>
            <div className="w-[min(100%,14rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="entrega_filter_cobro">
                    Cobro
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="entrega_filter_cobro"
                    name="entrega_filter_cobro"
                    value={initialCobro || '_all_'}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete('cobro');
                        } else {
                            currentUrl.searchParams.set('cobro', next);
                        }
                        currentUrl.searchParams.set('page', '1');
                        router.get(
                            currentUrl.pathname + currentUrl.search,
                            {},
                            {
                                preserveScroll: true,
                                preserveState: true,
                                replace: true,
                            },
                        );
                    }}
                    options={[
                        { value: '_all_', label: 'Todos' },
                        { value: 'pending', label: 'Por cobrar' },
                        { value: 'collected', label: 'Cobrados' },
                    ]}
                />
            </div>
        </div>
    );
}
