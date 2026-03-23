import { useEffect, useMemo, useRef, useState } from 'react';

import { usePage } from '@inertiajs/react';

import type { SeoDefaults } from '@/components/seo/SeoHead';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import { marketingSeo } from '@/marketing/seoCopy';
import SoftwareDetailGlassCard from '@/components/software/SoftwareDetailGlassCard';
import SoftwareDetailPlanCard from '@/components/software/SoftwareDetailPlanCard';
import SoftwareDetailSection from '@/components/software/SoftwareDetailSection';
import SoftwareDetailPlanSelectionPanel from '@/components/software/SoftwareDetailPlanSelectionPanel';
import SoftwareDetailStickyPurchaseBar from '@/components/software/SoftwareDetailStickyPurchaseBar';
import SoftwareProductHero from '@/components/software/SoftwareProductHero';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import CTASection from '@/components/welcome/sections/CTASection';
import { parsePenUnitFromPriceText } from '@/lib/cartPricing';
import { readSoftwareCart, writeSoftwareCart } from '@/lib/softwareCartStorage';
import {
    getSoftwareSystemBySlug,
    type SoftwarePricingPlan,
    type SoftwareSystem,
} from '@/marketplace/softwareCatalog';

type SoftwareDetailPageProps = {
    canRegister?: boolean;
    system?: SoftwareSystem | null;
};

export default function SoftwareDetail() {
    const page = usePage<SoftwareDetailPageProps & { seo: SeoDefaults }>();
    const { system: systemFromServer, seo } = page.props;
    const { url } = page;

    /** Slug de la URL actual (Inertia `url` coincide en SSR y tras navegación cliente). */
    const systemSlug = useMemo(() => {
        const path = (url.split('?')[0] ?? '').split('#')[0] ?? '';
        const parts = path.split('/').filter(Boolean);

        if (parts[0] !== 'software' || parts.length < 2) {
            return '';
        }

        return parts[1] ?? '';
    }, [url]);

    /**
     * Solo usar props del servidor si corresponden al slug de la URL.
     * Si no, Inertia puede seguir devolviendo el producto anterior un instante
     * tras cambiar de /software/rrhh-asistencia → /software/erp-contable-mini.
     */
    const system = useMemo((): SoftwareSystem | null => {
        const server = systemFromServer ?? null;

        if (server && server.slug === systemSlug) {
            return server;
        }

        if (!systemSlug) {
            return null;
        }

        return getSoftwareSystemBySlug(systemSlug);
    }, [systemFromServer, systemSlug]);

    const isStaleInertiaProps = Boolean(
        systemFromServer &&
            systemSlug &&
            systemFromServer.slug !== systemSlug,
    );

    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [addedCount, setAddedCount] = useState(0);

    useEffect(() => {
        setSelectedPlanId(null);
    }, [systemSlug]);

    const selectedPlan: SoftwarePricingPlan | null = useMemo(() => {
        if (!system) {
            return null;
        }

        const planId = selectedPlanId ?? system.pricingPlans[0]?.id ?? null;

        return system.pricingPlans.find((p) => p.id === planId) ?? null;
    }, [system, selectedPlanId]);

    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;

        if (!root) {
            return;
        }

        let rafId = 0;

        const update = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const raw = maxScroll > 0 ? window.scrollY / maxScroll : 0;
            const progress = Math.max(0, Math.min(1, raw));

            root.style.setProperty('--sd-progress', String(progress));
            root.style.setProperty('--sd-slow-x', `${progress * -6}px`);
            root.style.setProperty('--sd-slow-y', `${progress * 10}px`);
            root.style.setProperty('--sd-fast-x', `${progress * -14}px`);
            root.style.setProperty('--sd-fast-y', `${progress * 22}px`);
        };

        const onScroll = () => {
            if (rafId) {
                return;
            }

            rafId = window.requestAnimationFrame(() => {
                rafId = 0;
                update();
            });
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);

            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
        };
    }, []);

    const onAddToCart = () => {
        if (!system || !selectedPlan) {
            return;
        }

        const items = readSoftwareCart();
        const existing = items.find(
            (i) => i.systemSlug === system.slug && i.planId === selectedPlan.id,
        );

        const unitPen = parsePenUnitFromPriceText(selectedPlan.priceText);

        const snapshot = {
            systemName: system.name,
            planLabel: selectedPlan.label,
            priceText: selectedPlan.priceText,
            ...(unitPen !== null ? { unitPricePen: unitPen } : {}),
        };

        if (existing) {
            existing.qty += 1;
            Object.assign(existing, snapshot);
            setAddedCount(existing.qty);
        } else {
            items.push({
                systemSlug: system.slug,
                planId: selectedPlan.id,
                qty: 1,
                ...snapshot,
            });
            setAddedCount(1);
        }

        writeSoftwareCart(items);

        // UX simple: feedback inline + en el futuro se reemplaza por un toast
        window.setTimeout(() => setAddedCount(0), 2000);
    };

    const softwareApplicationLd = useMemo((): Record<string, unknown> | undefined => {
        if (!system) {
            return undefined;
        }

        const productUrl = `${seo.siteUrl}/software/${system.slug}`;
        const orgId = `${seo.siteUrl}#organization`;
        const webpageId = `${productUrl}#webpage`;

        const base: Record<string, unknown> = {
            '@type': 'SoftwareApplication',
            '@id': `${productUrl}#product`,
            name: system.name,
            description: system.shortDescription,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            url: productUrl,
            mainEntityOfPage: { '@id': webpageId },
            brand: { '@id': orgId },
            provider: { '@id': orgId },
        };

        const first = system.pricingPlans[0];
        if (first) {
            base.offers = {
                '@type': 'Offer',
                url: productUrl,
                priceCurrency: 'PEN',
                availability: 'https://schema.org/InStock',
                name: first.label,
            };
        }

        return base;
    }, [system, seo.siteUrl]);

    if (!system) {
        return (
            <MarketingLayout
                title={isStaleInertiaProps ? 'Cargando producto…' : 'Producto no disponible'}
                description={
                    isStaleInertiaProps
                        ? marketingSeo.software.description
                        : 'Este producto no está publicado en el catálogo ORVAE o el enlace ha cambiado.'
                }
                canonicalPath={isStaleInertiaProps ? undefined : '/software'}
                noindex={!isStaleInertiaProps}
                structuredData={isStaleInertiaProps ? 'minimal' : 'none'}
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Software', path: '/software' },
                ]}
            >
                {isStaleInertiaProps ? (
                    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-3 w-24 rounded bg-[var(--muted)]" />
                            <div className="h-10 max-w-md rounded-lg bg-[var(--muted)]" />
                            <div className="h-4 max-w-2xl rounded bg-[var(--muted)]" />
                            <div className="h-4 max-w-xl rounded bg-[var(--muted)]" />
                        </div>
                        <p className="mt-8 text-sm text-[var(--muted-foreground)]">
                            Cargando detalle del producto…
                        </p>
                    </div>
                ) : (
                    <>
                        <SoftwareDetailSection
                            id="no-encontrado"
                            eyebrow="Catálogo"
                            title="Este producto no está disponible"
                            description="No encontramos un sistema activo con ese enlace. Puede haberse movido o no estar publicado en el catálogo."
                            noDivider
                        >
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="/software"
                                    className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    Volver al catálogo
                                </a>
                            </div>
                        </SoftwareDetailSection>
                        <CTASection />
                    </>
                )}
            </MarketingLayout>
        );
    }

    const languages =
        system.languages ?? system.tecnologias?.languages ?? undefined;
    const frameworks =
        system.frameworks ?? system.tecnologias?.frameworks ?? undefined;
    const databases =
        system.databases ?? system.tecnologias?.databases ?? undefined;

    const howSteps =
        system.howItWorksSteps ??
        (system.modules?.length
            ? system.modules.map((m) => m.name).slice(0, 6)
            : []);

    const inferSaleModelLabel = (p: SoftwarePricingPlan): string => {
        if (p.saleModelLabel) {
            return p.saleModelLabel;
        }

        const text = `${p.saleModel ?? ''} ${p.priceText ?? ''} ${p.priceNowText ?? ''} ${p.priceBeforeText ?? ''}`.toLowerCase();

        if (text.includes('código') || text.includes('codigo') || text.includes('fuente')) {
            return 'Código fuente (todo el código o por periodos)';
        }

        if (text.includes('period')) {
            return 'Por periodos';
        }

        if (text.includes('implement') || text.includes('implementación')) {
            return 'Código fuente (todo el código o por periodos)';
        }

        if (text.includes('mensual') || text.includes('/mes') || text.includes('mes')) {
            return 'Precio mensual';
        }

        return 'Modelo de venta definido por administración';
    };

    const getPlanPriceBefore = (p: SoftwarePricingPlan): string | undefined => {
        const anyPlan = p as SoftwarePricingPlan & {
            oldPriceText?: string;
            price_before?: string | number;
            precio_antes?: string | number;
            precioAntes?: string | number;
        };

        return (
            p.priceBeforeText ??
            (p.priceBefore !== undefined ? String(p.priceBefore) : undefined) ??
            anyPlan.oldPriceText ??
            (anyPlan.price_before !== undefined ? String(anyPlan.price_before) : undefined) ??
            (anyPlan.precio_antes !== undefined
                ? String(anyPlan.precio_antes)
                : anyPlan.precioAntes !== undefined
                  ? String(anyPlan.precioAntes)
                  : undefined)
        );
    };

    const getPlanPriceNow = (p: SoftwarePricingPlan): string | undefined => {
        const anyPlan = p as SoftwarePricingPlan & {
            newPriceText?: string;
            price_now?: string | number;
            precio_ahora?: string | number;
            precioAhora?: string | number;
        };

        return (
            p.priceNowText ??
            (p.priceNow !== undefined ? String(p.priceNow) : undefined) ??
            anyPlan.newPriceText ??
            (anyPlan.price_now !== undefined ? String(anyPlan.price_now) : undefined) ??
            (anyPlan.precio_ahora !== undefined
                ? String(anyPlan.precio_ahora)
                : anyPlan.precioAhora !== undefined
                  ? String(anyPlan.precioAhora)
                  : undefined)
        );
    };

    const selectionPriceLine = useMemo(() => {
        if (!selectedPlan) {
            return undefined;
        }

        return getPlanPriceNow(selectedPlan) ?? selectedPlan.priceText;
    }, [selectedPlan]);

    return (
        <MarketingLayout
            title={`${system.name} — Software ORVAE`}
            description={system.shortDescription}
            canonicalPath={`/software/${system.slug}`}
            ogType="product"
            ogImageAlt={`${system.name} — software ORVAE`}
            breadcrumbs={[
                { name: 'Inicio', path: '/' },
                { name: 'Software', path: '/software' },
                { name: system.name, path: `/software/${system.slug}` },
            ]}
            jsonLd={softwareApplicationLd ? [softwareApplicationLd] : undefined}
        >
            <div ref={rootRef} className="software-detail-root relative overflow-hidden pb-24 md:pb-0">
                <div className="sd-scroll-progress" aria-hidden />

                {/* Capas geométricas con parallax sutil según scroll */}
                <GeometricBackground
                    variant="floating-shapes"
                    opacity={0.08}
                    className="sd-geo-layer sd-geo-parallax--slow"
                />
                <GeometricBackground
                    variant="grid-dots"
                    opacity={0.045}
                    className="sd-geo-layer sd-geo-parallax--fast"
                />

                <div className="relative z-10">
                    <SoftwareProductHero
                        name={system.name}
                        description={system.description}
                        shortDescription={system.shortDescription}
                        badges={system.badges}
                        categorySlug={system.categorySlug}
                        modules={system.modules}
                    />

                    <ScrollReveal direction="up">
                        <SoftwareDetailSection
                            id="resumen"
                            eyebrow="Sistema"
                            title="¿Qué hace este sistema?"
                            description={system.description}
                            noDivider
                        >
                            <div className="relative">
                                <GeometricBackground variant="circles-blur" opacity={0.06} />
                                <div className="relative z-10">
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {system.badges.map((b) => (
                                            <span
                                                key={b}
                                                className="rounded-full border border-[color-mix(in_oklab,var(--primary)_28%,var(--border))] bg-[color-mix(in_oklab,var(--primary)_9%,transparent)] px-3 py-1 text-xs font-semibold text-[color-mix(in_oklab,var(--primary)_92%,var(--foreground))]"
                                            >
                                                {b}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                        {[
                                            { t: 'Objetivo', d: system.shortDescription },
                                            {
                                                t: 'Entrega',
                                                d: 'Documentación clara, estructura enterprise y trazabilidad para adopción.',
                                            },
                                            {
                                                t: 'Modelo',
                                                d: 'Código fuente (todo o por periodos) o precio mensual, según plan.',
                                            },
                                        ].map((x) => (
                                            <SoftwareDetailGlassCard key={x.t}>
                                                <p className="text-sm font-bold text-[var(--foreground)]">{x.t}</p>
                                                <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                                                    {x.d}
                                                </p>
                                            </SoftwareDetailGlassCard>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SoftwareDetailSection>
                    </ScrollReveal>

                    {howSteps.length > 0 && (
                        <ScrollReveal direction="up">
                            <SoftwareDetailSection
                                id="como-funciona"
                                eyebrow="Flujo"
                                title="Cómo se pone en marcha"
                                description="Pasos orientativos de la entrega. El alcance exacto depende del plan."
                            >
                                <div className="relative">
                                    <GeometricBackground variant="diagonal-lines" opacity={0.04} />
                                    <div className="relative z-10">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            {howSteps.map((step, i) => (
                                                <SoftwareDetailGlassCard
                                                    key={`${step}-${i}`}
                                                    stepIndex={i + 1}
                                                >
                                                    <p className="text-sm font-bold leading-snug text-[var(--foreground)]">
                                                        {step}
                                                    </p>
                                                    <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
                                                        Documentación y trazabilidad para que tu equipo adopte sin fricción.
                                                    </p>
                                                </SoftwareDetailGlassCard>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SoftwareDetailSection>
                        </ScrollReveal>
                    )}

                    <ScrollReveal direction="up">
                        <SoftwareDetailSection
                            id="tecnologias"
                            eyebrow="Tecnologías"
                            title="Stack y base de datos"
                            description="Referencia técnica publicada en catálogo; puede variar según entorno."
                        >
                            <div className="relative">
                                <GeometricBackground variant="grid-dots" opacity={0.04} />
                                <div className="relative z-10">
                                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                                        {[
                                            { title: 'Lenguajes', items: languages },
                                            { title: 'Frameworks', items: frameworks },
                                            { title: 'Base de datos', items: databases },
                                        ].map((x) => (
                                            <SoftwareDetailGlassCard key={x.title}>
                                                <p className="text-sm font-bold text-[var(--foreground)]">{x.title}</p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {(x.items ?? []).length > 0 ? (
                                                        (x.items ?? []).map((it) => (
                                                            <span
                                                                key={it}
                                                                className="rounded-full border border-[var(--border)] bg-background/70 px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                                                            >
                                                                {it}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-[var(--muted-foreground)]">
                                                            Definido por la implementación del sistema.
                                                        </p>
                                                    )}
                                                </div>
                                            </SoftwareDetailGlassCard>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SoftwareDetailSection>
                    </ScrollReveal>

                    <ScrollReveal direction="up">
                        <SoftwareDetailSection
                            id="modulos"
                            eyebrow="Módulos"
                            title="Incluye lo esencial para operar"
                            description="Funcionalidades previstas. Puedes ampliar con tu plan o implementación."
                        >
                            <div className="relative">
                                <GeometricBackground variant="grid-hex" opacity={0.05} />
                                <div className="relative z-10">
                                    {system.modules.length > 0 ? (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {system.modules.map((m) => (
                                                <SoftwareDetailGlassCard key={m.name}>
                                                    <p className="text-sm font-semibold text-[var(--foreground)]">
                                                        {m.name}
                                                    </p>
                                                    <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
                                                        {m.description ??
                                                            'Se entrega con documentación y trazabilidad para una implementación ordenada.'}
                                                    </p>
                                                </SoftwareDetailGlassCard>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[color-mix(in_oklab,var(--muted)_25%,transparent)] px-6 py-10 text-center">
                                            <p className="text-sm font-medium text-[var(--foreground)]">
                                                Módulos según plan
                                            </p>
                                            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                                                Los módulos concretos se confirman al contratar. Consulta con tu asesor.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SoftwareDetailSection>
                    </ScrollReveal>

                    <ScrollReveal direction="up">
                        <SoftwareDetailSection
                            id="planes"
                            eyebrow="Planes"
                            title="Modelos de venta y entrega"
                            description="Selecciona el modelo que encaje con tu operación. El pago en línea se integrará después."
                        >
                            <div className="relative">
                                <GeometricBackground variant="rings" opacity={0.05} />
                                <div className="relative z-10">
                                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                        {system.pricingPlans.map((p) => {
                                            const isActive = (selectedPlan?.id ?? p.id) === p.id;
                                            const planPriceBefore = getPlanPriceBefore(p);
                                            const planPriceNow = getPlanPriceNow(p);
                                            const saleModelLabel = inferSaleModelLabel(p);

                                            return (
                                                <SoftwareDetailPlanCard
                                                    key={p.id}
                                                    plan={p}
                                                    isActive={isActive}
                                                    saleModelLabel={saleModelLabel}
                                                    planPriceBefore={planPriceBefore}
                                                    planPriceNow={planPriceNow}
                                                    onChoose={() => setSelectedPlanId(p.id)}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div className="mt-10">
                                        <SoftwareDetailPlanSelectionPanel
                                            eyebrow={
                                                selectedPlan ? 'Selección actual' : 'Siguiente paso'
                                            }
                                            planSelected={Boolean(selectedPlan)}
                                            selectionTitle={
                                                selectedPlan
                                                    ? `${selectedPlan.label} · ${inferSaleModelLabel(selectedPlan)}`
                                                    : 'Elige un plan para continuar con el carrito o el checkout.'
                                            }
                                            priceLine={selectionPriceLine}
                                            priceCaption="Precio de lista · impuestos al confirmar en la pasarela"
                                            onPay={() => {
                                                alert('Checkout pendiente: integra pasarela de pagos');
                                            }}
                                            onAdd={onAddToCart}
                                            addedCount={addedCount}
                                        />
                                    </div>
                                </div>
                            </div>
                        </SoftwareDetailSection>
                    </ScrollReveal>

                    <ScrollReveal direction="up">
                        <SoftwareDetailSection
                            id="entrega"
                            eyebrow="Entrega"
                            title="Documentación, implementación y adopción"
                            description="La compra incluye entregables claros para que tu operación arranque con orden."
                        >
                            <div className="relative">
                                <GeometricBackground variant="triangles" opacity={0.04} />
                                <div className="relative z-10">
                                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                                        {[
                                            { t: 'Setup en días o semanas', d: 'Checklist de adopción con trazabilidad.' },
                                            { t: 'SLA documentado', d: 'Compromiso por escrito: respuesta y calidad.' },
                                            { t: 'Integración a tu operación', d: 'Ajustes por roles, flujos y permisos.' },
                                        ].map((x) => (
                                    <SoftwareDetailGlassCard key={x.t}>
                                                <p className="text-sm font-bold text-[var(--foreground)]">{x.t}</p>
                                                <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                                                    {x.d}
                                                </p>
                                    </SoftwareDetailGlassCard>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SoftwareDetailSection>
                    </ScrollReveal>

                    <ScrollReveal direction="up">
                        <CTASection />
                    </ScrollReveal>
                </div>

                {/* CTA sticky en móvil: reduce fricción al comprar */}
                {selectedPlan && (
                    <SoftwareDetailStickyPurchaseBar
                        selectedPlanLabel={`${selectedPlan.label} · ${inferSaleModelLabel(selectedPlan)}`}
                        priceLine={selectionPriceLine}
                        planReady
                        onPay={() => {
                            alert('Checkout pendiente: integra pasarela de pagos');
                        }}
                        onAdd={onAddToCart}
                    />
                )}

                <ScrollToTopButton className={selectedPlan ? 'bottom-24 md:bottom-8' : ''} />
            </div>
        </MarketingLayout>
    );
}

