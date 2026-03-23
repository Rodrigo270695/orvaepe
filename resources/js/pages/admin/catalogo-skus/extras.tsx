import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Braces, Save } from 'lucide-react';
import { useState } from 'react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import panel from '@/routes/panel';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

type SkuPayload = {
    id: string;
    code: string;
    name: string;
    product?: {
        id: string;
        name: string;
        slug: string;
        category?: { name?: string } | null;
    } | null;
};

type Props = {
    sku: SkuPayload;
    limitsJson: string;
    metadataJson: string;
};

type TabId = 'limits' | 'metadata';

export default function CatalogSkuExtrasPage({
    sku,
    limitsJson: initialLimits,
    metadataJson: initialMetadata,
}: Props) {
    const extrasUrl = panel.catalogoSkus.extras.index.url(sku.id);
    const updateUrl = panel.catalogoSkus.extras.update.url(sku.id);

    const form = useForm({
        limits_json: initialLimits,
        metadata_json: initialMetadata,
    });

    const { data, setData, errors, processing, patch } = form;
    const [tab, setTab] = useState<TabId>('limits');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle('catalogo-skus'), href: panelPath('catalogo-skus') },
        { title: `Límites y metadata · ${sku.code}`, href: extrasUrl },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Límites y metadata · ${sku.name}`} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={panelPath('catalogo-skus')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a SKUs
                    </Link>
                </div>

                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-sm font-bold">Límites y metadata</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {sku.name}
                                {sku.product?.name ? (
                                    <span className="text-muted-foreground/80">
                                        {' '}
                                        · {sku.product.name}
                                    </span>
                                ) : null}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{sku.code}</p>
                        </div>
                    </div>
                </NeuCardRaised>

                <form
                    className="mt-4 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        patch(updateUrl, { preserveScroll: true });
                    }}
                >
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Edita el JSON en cada pestaña. Un solo guardado aplica ambos bloques. Si dejas un campo vacío, se
                        guardará como vacío en base de datos.
                    </p>

                    <div
                        className="flex flex-wrap gap-2"
                        role="tablist"
                        aria-label="Sección de edición"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'limits'}
                            className={cn(
                                'inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold transition-colors',
                                tab === 'limits'
                                    ? 'bg-[#4A80B8]/20 text-[#4A80B8]'
                                    : 'neumorph-inset text-muted-foreground hover:text-foreground',
                            )}
                            onClick={() => setTab('limits')}
                        >
                            <Braces className="size-4 shrink-0" />
                            Límites
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'metadata'}
                            className={cn(
                                'inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold transition-colors',
                                tab === 'metadata'
                                    ? 'bg-[#4A80B8]/20 text-[#4A80B8]'
                                    : 'neumorph-inset text-muted-foreground hover:text-foreground',
                            )}
                            onClick={() => setTab('metadata')}
                        >
                            <Braces className="size-4 shrink-0" />
                            Metadata
                        </button>
                    </div>

                    <div
                        className={cn('space-y-2', tab !== 'limits' && 'hidden')}
                        role="tabpanel"
                        aria-hidden={tab !== 'limits'}
                    >
                        <label htmlFor="limits_json" className="text-[11px] font-medium text-muted-foreground">
                            Limits (JSON)
                        </label>
                        <textarea
                            id="limits_json"
                            name="limits_json"
                            value={data.limits_json}
                            onChange={(e) => setData('limits_json', e.target.value)}
                            rows={16}
                            spellCheck={false}
                            className={cn(
                                'neumorph-inset w-full resize-y rounded-xl border border-border/60 bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none',
                                'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                            )}
                            placeholder='{"usuarios": 10, "modulos": ["ventas", "compras"]}'
                        />
                        {errors.limits_json ? (
                            <p className="text-xs text-[#C05050]">{errors.limits_json}</p>
                        ) : null}
                        {errors.limits ? (
                            <p className="text-xs text-[#C05050]">{errors.limits}</p>
                        ) : null}
                    </div>

                    <div
                        className={cn('space-y-2', tab !== 'metadata' && 'hidden')}
                        role="tabpanel"
                        aria-hidden={tab !== 'metadata'}
                    >
                        <label htmlFor="metadata_json" className="text-[11px] font-medium text-muted-foreground">
                            Metadata (JSON)
                        </label>
                        <textarea
                            id="metadata_json"
                            name="metadata_json"
                            value={data.metadata_json}
                            onChange={(e) => setData('metadata_json', e.target.value)}
                            rows={16}
                            spellCheck={false}
                            className={cn(
                                'neumorph-inset w-full resize-y rounded-xl border border-border/60 bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none',
                                'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                            )}
                            placeholder='{"sku_vendor": "ms365", "plan": "business-standard"}'
                        />
                        {errors.metadata_json ? (
                            <p className="text-xs text-[#C05050]">{errors.metadata_json}</p>
                        ) : null}
                        {errors.metadata ? (
                            <p className="text-xs text-[#C05050]">{errors.metadata}</p>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 pt-2">
                        <NeuButtonRaised
                            type="submit"
                            className="cursor-pointer"
                            disabled={processing}
                        >
                            <Save className="size-4 text-[#4A9A72]" />
                            {processing ? 'Guardando…' : 'Guardar límites y metadata'}
                        </NeuButtonRaised>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
