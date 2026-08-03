import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Check, PawPrint, Shield, Sparkles, Stethoscope, Waves } from 'lucide-react';

import SoftwareDetailPlansPicker from '@/components/software/SoftwareDetailPlansPicker';
import SoftwareDetailPlanSelectionPanel from '@/components/software/SoftwareDetailPlanSelectionPanel';
import SoftwareDetailStickyPurchaseBar from '@/components/software/SoftwareDetailStickyPurchaseBar';
import VetSaaSClientsCarousel, {
    type VetSaaSShowcaseClient,
} from '@/components/software/VetSaaSClientsCarousel';
import { cn } from '@/lib/utils';
import type { SoftwarePricingPlan, SoftwareSystem } from '@/marketplace/softwareCatalog';

export type VetSaaSMarketingPayload = {
    clinics_count: number;
    clinics_display: number;
    clinics_label: string;
    plans: Array<{
        codigo: string;
        nombre: string;
        descripcion: string;
        badge?: string | null;
        highlights: string[];
    }>;
    comparison: Array<{
        key: string;
        label: string;
        free: string;
        starter: string;
        pro: string;
        clinica: string;
    }>;
    clients: VetSaaSShowcaseClient[];
};

type Props = {
    system: SoftwareSystem;
    marketing: VetSaaSMarketingPayload;
    showcaseClients: VetSaaSShowcaseClient[];
    selectedPlan: SoftwarePricingPlan | null;
    selectedPlanId: string | null;
    onSelectPlanId: (id: string) => void;
    purchaseEnabled: boolean;
    webCheckoutEnabled: boolean;
    isFreeSubscription: boolean;
    checkoutLoading: boolean;
    checkoutError: string | null;
    addedCount: number;
    selectionTitle: string;
    selectionPriceLine?: string;
    selectionPriceCaption?: string;
    consultationWhatsAppHref?: string;
    onAddToCart: () => void;
    onStartCheckout: () => void;
};

const MODULES = [
    { title: 'Historia clínica', detail: 'SOAP, vacunas, recetas y archivos', icon: Stethoscope },
    { title: 'Agenda viva', detail: 'Citas, grooming y hotel en un solo calendario', icon: Waves },
    { title: 'Caja & SUNAT', detail: 'Ventas, sesión de caja y comprobantes', icon: Shield },
    { title: 'Cuidado animal', detail: 'Pacientes, propietarios y recordatorios', icon: PawPrint },
] as const;

function useCountUp(target: number, durationMs = 1400): number {
    const [value, setValue] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        if (target <= 0) {
            setValue(0);
            return;
        }
        if (started.current) {
            setValue(target);
            return;
        }
        started.current = true;
        const start = performance.now();
        let frame = 0;

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(target * eased));
            if (t < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, durationMs]);

    return value;
}

function planCodigoFromSku(plan: SoftwarePricingPlan): string {
    const code = (plan.planCode ?? '').toLowerCase();
    const cleaned = code
        .replace(/^(vetsaas|saas|orvae)-/i, '')
        .replace(/-?(mensual|anual|monthly|annual)$/i, '')
        .trim();

    if (['free', 'starter', 'pro', 'clinica'].includes(cleaned)) {
        return cleaned;
    }

    const label = plan.label.toLowerCase();
    if (label.includes('free') || label.includes('gratis')) {
        return 'free';
    }
    if (label.includes('starter')) {
        return 'starter';
    }
    if (label.includes('pro')) {
        return 'pro';
    }
    if (label.includes('clínica') || label.includes('clinica')) {
        return 'clinica';
    }

    return cleaned || 'starter';
}

export default function VetSaaSLanding({
    system,
    marketing,
    showcaseClients,
    selectedPlan,
    selectedPlanId,
    onSelectPlanId,
    purchaseEnabled,
    webCheckoutEnabled,
    isFreeSubscription,
    checkoutLoading,
    checkoutError,
    addedCount,
    selectionTitle,
    selectionPriceLine,
    selectionPriceCaption,
    consultationWhatsAppHref,
    onAddToCart,
    onStartCheckout,
}: Props) {
    const display = marketing.clinics_display || 100;
    const countUp = useCountUp(display);
    const clients = showcaseClients.length > 0 ? showcaseClients : marketing.clients;

    const highlightsByCodigo = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const p of marketing.plans) {
            map.set(p.codigo, p.highlights);
        }
        return map;
    }, [marketing.plans]);

    const enrichedPlans = useMemo((): SoftwarePricingPlan[] => {
        return system.pricingPlans.map((plan) => {
            const codigo = planCodigoFromSku(plan);
            const extras = highlightsByCodigo.get(codigo);
            if (!extras || extras.length === 0) {
                return plan;
            }
            return {
                ...plan,
                highlights: extras,
            };
        });
    }, [system.pricingPlans, highlightsByCodigo]);

    const comparisonCols = useMemo(() => {
        const order = ['free', 'starter', 'pro', 'clinica'] as const;
        return order.filter((c) => marketing.plans.some((p) => p.codigo === c));
    }, [marketing.plans]);

    return (
        <div
            className="vs-landing relative isolate overflow-hidden"
            style={
                {
                    '--vs-50': '#E6F4EF',
                    '--vs-100': '#C5E5D9',
                    '--vs-200': '#99D2BC',
                    '--vs-400': '#33A07B',
                    '--vs-500': '#008762',
                    '--vs-600': '#006D55',
                    '--vs-700': '#015743',
                    '--vs-900': '#04362B',
                    '--vs-ink': '#06241C',
                    '--vs-cream': '#F3FBF7',
                } as CSSProperties
            }
        >
            <style>{`
                @keyframes vs-float {
                    0%, 100% { transform: translateY(0) rotate(-2deg); }
                    50% { transform: translateY(-12px) rotate(1deg); }
                }
                @keyframes vs-pulse-ring {
                    0% { transform: scale(0.92); opacity: 0.55; }
                    70% { transform: scale(1.08); opacity: 0; }
                    100% { transform: scale(1.08); opacity: 0; }
                }
                @keyframes vs-shimmer {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                .vs-landing .vs-hero-orb {
                    animation: vs-float 7s ease-in-out infinite;
                }
                .vs-landing .vs-ring {
                    animation: vs-pulse-ring 2.8s ease-out infinite;
                }
                .vs-landing .vs-shimmer-text {
                    background: linear-gradient(110deg, #E6F4EF 0%, #99D2BC 35%, #ffffff 50%, #99D2BC 65%, #E6F4EF 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: vs-shimmer 4.5s linear infinite;
                }
            `}</style>

            <section className="relative min-h-[88vh] overflow-hidden bg-[linear-gradient(155deg,#021E18_0%,#015743_42%,#006D55_70%,#33A07B_100%)]">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.14]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 20%, #E6F4EF 0.6px, transparent 0.7px), radial-gradient(circle at 80% 40%, #99D2BC 0.5px, transparent 0.6px)',
                        backgroundSize: '28px 28px, 42px 42px',
                    }}
                />
                <div className="vs-hero-orb pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-[#33A07B]/30 blur-3xl" />
                <div className="pointer-events-none absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-[#E6F4EF]/10 blur-3xl" />

                <div className="relative mx-auto flex max-w-6xl flex-col justify-center gap-10 px-5 pb-24 pt-20 sm:px-8 lg:min-h-[88vh] lg:flex-row lg:items-end lg:gap-16 lg:pb-28 lg:pt-28">
                    <div className="max-w-2xl flex-1">
                        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-[#C5E5D9]/90">
                            Software veterinario · Perú
                        </p>
                        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
                            <span className="vs-shimmer-text">VetSaaS</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#E6F4EF]/90 sm:text-lg">
                            La clínica completa en la nube: historia clínica, agenda, caja y
                            WhatsApp — lista el mismo día que la activas.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <a
                                href="#planes"
                                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#006D55] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] transition hover:bg-[#E6F4EF]"
                            >
                                Ver planes
                            </a>
                            <a
                                href="#comparar"
                                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
                            >
                                Comparar qué incluye
                            </a>
                        </div>
                    </div>

                    <div className="relative w-full max-w-sm shrink-0">
                        <div className="vs-ring absolute inset-0 rounded-[2rem] border border-[#99D2BC]/40" />
                        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#04362B]/55 p-6 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-2 text-[#C5E5D9]">
                                <Sparkles className="size-4" />
                                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em]">
                                    Clínicas con VetSaaS
                                </span>
                            </div>
                            <p className="mt-4 font-[family-name:var(--font-display)] text-6xl font-bold tabular-nums text-white sm:text-7xl">
                                {countUp}
                                <span className="text-3xl text-[#99D2BC]">+</span>
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-[#C5E5D9]/95">
                                Equipos veterinarios ya operan agenda, historia y caja en su
                                propio subdominio.
                            </p>
                            <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#99D2BC]/50 to-transparent" />
                            <p className="mt-4 text-xs text-[#99D2BC]/90">
                                Hecho en Perú · Activación en minutos · Plan free disponible
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative border-b border-[#C5E5D9]/60 bg-[var(--vs-cream)]">
                <div className="mx-auto grid max-w-6xl gap-px bg-[#C5E5D9]/50 sm:grid-cols-2 lg:grid-cols-4">
                    {MODULES.map((m) => {
                        const Icon = m.icon;
                        return (
                            <div
                                key={m.title}
                                className="bg-[var(--vs-cream)] px-6 py-8 transition hover:bg-white"
                            >
                                <Icon className="size-5 text-[var(--vs-600)]" />
                                <h2 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--vs-ink)]">
                                    {m.title}
                                </h2>
                                <p className="mt-1 text-sm text-[var(--vs-700)]/80">{m.detail}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {clients.length > 0 ? (
                <section className="bg-white py-14">
                    <div className="mx-auto max-w-6xl px-5 sm:px-8">
                        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.24em] text-[var(--vs-500)]">
                            Ya confían en VetSaaS
                        </p>
                        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--vs-ink)] sm:text-3xl">
                            Clínicas reales, marca propia
                        </h2>
                    </div>
                    <div className="mt-8">
                        <VetSaaSClientsCarousel clients={clients} />
                    </div>
                </section>
            ) : null}

            <section
                id="planes"
                className="scroll-mt-24 bg-[linear-gradient(180deg,#F3FBF7_0%,#FFFFFF_40%)] py-16 sm:py-20"
            >
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.24em] text-[var(--vs-500)]">
                            Planes
                        </p>
                        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--vs-ink)] sm:text-4xl">
                            Elige el tamaño de tu clínica
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--vs-700)]/85 sm:text-base">
                            Precios de Orvae. Cada plan muestra lo que incluye VetSaaS de verdad:
                            límites, módulos y soporte.
                        </p>
                    </div>

                    <div className="mt-10">
                        <SoftwareDetailPlansPicker
                            plans={enrichedPlans}
                            selectedPlanId={selectedPlanId}
                            onSelectPlanId={onSelectPlanId}
                            semanticAccents={['#006D55', '#008762', '#33A07B', '#015743']}
                        />
                    </div>

                    <div className="mt-8">
                        <SoftwareDetailPlanSelectionPanel
                            eyebrow={selectedPlan ? 'Selección actual' : 'Siguiente paso'}
                            planSelected={Boolean(selectedPlan)}
                            webCheckoutEnabled={webCheckoutEnabled}
                            isFreeSubscription={isFreeSubscription}
                            purchaseEnabled={purchaseEnabled}
                            whatsappHref={consultationWhatsAppHref}
                            selectionTitle={selectionTitle}
                            priceLine={selectionPriceLine}
                            priceCaption={selectionPriceCaption}
                            payInProgress={checkoutLoading}
                            payError={checkoutError}
                            onPay={onStartCheckout}
                            onAdd={onAddToCart}
                            addedCount={addedCount}
                        />
                    </div>
                </div>
            </section>

            <section id="comparar" className="scroll-mt-24 bg-[var(--vs-900)] py-16 text-white sm:py-20">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.24em] text-[var(--vs-200)]">
                        Comparativa
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
                        Qué viene en cada plan
                    </h2>
                    <p className="mt-3 max-w-xl text-sm text-[var(--vs-100)]/85">
                        Misma fuente que el sistema: límites y módulos reales de VetSaaS.
                    </p>

                    <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-[#04362B]/60 shadow-2xl">
                        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-4 py-4 font-medium text-[var(--vs-200)]">
                                        Capacidad
                                    </th>
                                    {comparisonCols.map((col) => {
                                        const meta = marketing.plans.find((p) => p.codigo === col);
                                        return (
                                            <th
                                                key={col}
                                                className="px-4 py-4 font-[family-name:var(--font-display)] text-base font-semibold text-white"
                                            >
                                                {meta?.nombre ?? col}
                                                {meta?.badge ? (
                                                    <span className="ml-2 rounded-full bg-[var(--vs-500)] px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-white">
                                                        {meta.badge}
                                                    </span>
                                                ) : null}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {marketing.comparison.map((row) => (
                                    <tr
                                        key={row.key}
                                        className="border-b border-white/5 last:border-0"
                                    >
                                        <td className="px-4 py-3.5 text-[var(--vs-100)]">
                                            {row.label}
                                        </td>
                                        {comparisonCols.map((col) => {
                                            const value = String(
                                                row[col as keyof typeof row] ?? '—',
                                            );
                                            const positive =
                                                value !== '—' && value.toLowerCase() !== 'docs';
                                            return (
                                                <td
                                                    key={col}
                                                    className={cn(
                                                        'px-4 py-3.5 tabular-nums',
                                                        positive
                                                            ? 'text-white'
                                                            : 'text-white/35',
                                                    )}
                                                >
                                                    {positive && value === 'Sí' ? (
                                                        <span className="inline-flex items-center gap-1.5 text-[var(--vs-200)]">
                                                            <Check className="size-3.5" /> Sí
                                                        </span>
                                                    ) : (
                                                        value
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[var(--vs-cream)] py-16 sm:py-20">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_50%,#99D2BC55,transparent_60%)]" />
                <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                    <div className="max-w-xl">
                        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--vs-ink)] sm:text-4xl">
                            Tu clínica, tu subdominio
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--vs-700)]/90 sm:text-base">
                            Activa Free o un plan de pago en{' '}
                            <span className="font-medium text-[var(--vs-600)]">orvae.pe</span>. Al
                            confirmar, entras directo a crear tu contraseña en tu propia clínica
                            VetSaaS.
                        </p>
                    </div>
                    <a
                        href="#planes"
                        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--vs-600)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#006D55]/25 transition hover:bg-[var(--vs-700)]"
                    >
                        Empezar ahora
                    </a>
                </div>
            </section>

            {selectedPlan ? (
                <SoftwareDetailStickyPurchaseBar
                    selectedPlanLabel={selectionTitle}
                    priceLine={selectionPriceLine}
                    planReady
                    webCheckoutEnabled={webCheckoutEnabled}
                    isFreeSubscription={isFreeSubscription}
                    purchaseEnabled={purchaseEnabled}
                    whatsappHref={consultationWhatsAppHref}
                    payInProgress={checkoutLoading}
                    payError={checkoutError}
                    onPay={onStartCheckout}
                    onAdd={onAddToCart}
                />
            ) : null}
        </div>
    );
}
