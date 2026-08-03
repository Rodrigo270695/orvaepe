import { useEffect, useMemo, useRef, useState } from 'react';
import {
    BellRing,
    Bot,
    Check,
    Cloud,
    Fingerprint,
    Globe2,
    MessageCircle,
    PawPrint,
    Smartphone,
    Sparkles,
    Zap,
} from 'lucide-react';

import SoftwareDetailPlansPicker from '@/components/software/SoftwareDetailPlansPicker';
import SoftwareDetailPlanSelectionPanel from '@/components/software/SoftwareDetailPlanSelectionPanel';
import SoftwareDetailStickyPurchaseBar from '@/components/software/SoftwareDetailStickyPurchaseBar';
import VetSaaSClientsCarousel, {
    type VetSaaSShowcaseClient,
} from '@/components/software/VetSaaSClientsCarousel';
import VetSaaSScrollPet from '@/components/software/VetSaaSScrollPet';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import type { SoftwarePricingPlan, SoftwareSystem } from '@/marketplace/softwareCatalog';

export type VetSaaSMarketingPayload = {
    clinics_count: number;
    clinics_display: number;
    clinics_label: string;
    modules_note?: string;
    plans: Array<{
        codigo: string;
        nombre: string;
        descripcion: string;
        badge?: string | null;
        highlights: string[];
    }>;
    comparison: Array<Record<string, string>>;
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

const NOVELTIES = [
    {
        tag: 'Nuevo',
        title: 'Agenda unificada de servicios',
        body: 'Grooming y hotel en un calendario, aparte de citas clínicas.',
    },
    {
        tag: 'Mejora',
        title: 'Activación directa post-pago',
        body: 'Tras confirmar en Orvae entras a tu subdominio a crear tu contraseña.',
    },
    {
        tag: 'Integración',
        title: 'AlmaPet ID listo para clínicas',
        body: 'Identidad digital de mascotas: registro, búsqueda y certificado.',
    },
] as const;

const HERO_PILLS = [
    { icon: Bot, label: 'IA en la clínica' },
    { icon: MessageCircle, label: 'WhatsApp' },
    { icon: BellRing, label: 'Recordatorios' },
    { icon: Cloud, label: 'Subdominio propio' },
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
            setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
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
    if (label.includes('free') || label.includes('gratis')) return 'free';
    if (label.includes('starter')) return 'starter';
    if (label.includes('pro')) return 'pro';
    if (label.includes('clínica') || label.includes('clinica')) return 'clinica';
    return cleaned || 'starter';
}

export default function VetSaaSLanding(props: Props) {
    const {
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
    } = props;

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
            if (!extras?.length) return plan;
            return { ...plan, highlights: extras };
        });
    }, [system.pricingPlans, highlightsByCodigo]);

    const comparisonCols = useMemo(() => {
        const order = ['free', 'starter', 'pro', 'clinica'] as const;
        return order.filter((c) => marketing.plans.some((p) => p.codigo === c));
    }, [marketing.plans]);

    const modulesNote =
        marketing.modules_note ??
        'Todos los módulos están incluidos en todos los planes. Lo que cambia es la cantidad.';

    return (
        <div className="vs-landing relative isolate overflow-hidden">
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;600;700&display=swap"
            />
            <style>{`
                .vs-landing {
                    --vs-50: #E6F4EF;
                    --vs-100: #C5E5D9;
                    --vs-200: #99D2BC;
                    --vs-400: #33A07B;
                    --vs-500: #008762;
                    --vs-600: #006D55;
                    --vs-700: #015743;
                    --vs-900: #04362B;
                    --vs-ink: #06241C;
                    --vs-bg: #F3FBF7;
                    --vs-card: #ffffff;
                    --vs-muted: rgba(1, 87, 67, 0.72);
                    --vs-surface: #ffffff;
                    --vs-border: rgba(0, 109, 85, 0.16);
                    --font-vs-display: "Fraunces", "Iowan Old Style", Georgia, serif;
                    --font-vs-body: "Manrope", "Segoe UI", sans-serif;
                    color: var(--vs-ink);
                    background: var(--vs-bg);
                }
                .dark .vs-landing {
                    --vs-50: #0A2F26;
                    --vs-100: #0E3D32;
                    --vs-200: #33A07B;
                    --vs-400: #5BC49A;
                    --vs-500: #33A07B;
                    --vs-600: #5BC49A;
                    --vs-700: #99D2BC;
                    --vs-900: #021E18;
                    --vs-ink: #E8F7F1;
                    --vs-bg: #021E18;
                    --vs-card: #0A2F26;
                    --vs-muted: rgba(197, 229, 217, 0.82);
                    --vs-surface: #0A2F26;
                    --vs-border: rgba(153, 210, 188, 0.22);
                }
                @keyframes vs-kenburns {
                    from { transform: scale(1.05) translate3d(0,0,0); }
                    to { transform: scale(1.14) translate3d(-1.5%, 1%, 0); }
                }
                @keyframes vs-float {
                    0%,100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes vs-shimmer {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                @keyframes vs-pet-bob {
                    0%,100% { transform: translateY(0) rotate(-2deg); }
                    50% { transform: translateY(-8px) rotate(2deg); }
                }
                @keyframes vs-glow-pulse {
                    0%,100% { opacity: 0.45; }
                    50% { opacity: 0.85; }
                }
                .vs-landing .vs-display { font-family: var(--font-vs-display); }
                .vs-landing .vs-body { font-family: var(--font-vs-body); }
                .vs-landing .vs-kenburns { animation: vs-kenburns 22s ease-out forwards; }
                .vs-landing .vs-float { animation: vs-float 6s ease-in-out infinite; }
                .vs-landing .vs-pet-bob { animation: vs-pet-bob 3.2s ease-in-out infinite; }
                .vs-landing .vs-shimmer-text {
                    background: linear-gradient(110deg, #E6F4EF, #99D2BC, #fff, #99D2BC, #E6F4EF);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: vs-shimmer 5s linear infinite;
                }
                .vs-landing .vs-section-card {
                    background: var(--vs-card);
                    border: 1px solid var(--vs-border);
                }
                .vs-landing .vs-muted { color: var(--vs-muted); }
                .vs-landing .vs-plans {
                    --background: var(--vs-card);
                    --foreground: var(--vs-ink);
                    --muted-foreground: var(--vs-muted);
                    --border: var(--vs-border);
                    --primary: #006D55;
                    --primary-foreground: #ffffff;
                    --card: var(--vs-card);
                }
                .dark .vs-landing .vs-plans {
                    --primary: #33A07B;
                    --primary-foreground: #021E18;
                }
                @media (prefers-reduced-motion: reduce) {
                    .vs-landing .vs-kenburns,
                    .vs-landing .vs-float,
                    .vs-landing .vs-pet-bob,
                    .vs-landing .vs-shimmer-text { animation: none !important; }
                }
            `}</style>

            <VetSaaSScrollPet />

            {/* HERO */}
            <section className="relative min-h-[92svh] overflow-hidden bg-[#021E18] text-white">
                <div className="absolute inset-0">
                    <img
                        src="/images/vetsaas-hero-pets.png"
                        alt=""
                        className="vs-kenburns size-full object-cover object-[60%_center] opacity-55"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#021E18] via-[#021E18]/88 to-[#021E18]/25" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#021E18] via-transparent to-[#021E18]/50" />
                    <div
                        className="pointer-events-none absolute -left-20 top-1/3 size-72 rounded-full bg-[#33A07B]/25 blur-3xl"
                        style={{ animation: 'vs-glow-pulse 5s ease-in-out infinite' }}
                    />
                </div>

                <div className="relative mx-auto flex min-h-[92svh] max-w-6xl flex-col justify-end gap-10 px-5 pb-20 pt-28 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:pb-28">
                    <div className="max-w-xl">
                        <p className="vs-body inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C5E5D9]">
                            <PawPrint className="size-3.5" />
                            Software veterinario · Perú
                        </p>
                        <h1 className="vs-display mt-4 text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
                            <span className="vs-shimmer-text">VetSaaS</span>
                        </h1>
                        <p className="vs-body mt-5 max-w-lg text-base leading-relaxed text-[#E6F4EF]/95 sm:text-lg">
                            Tu clínica en la nube con historia clínica, agenda, caja y SUNAT.
                            Además: asistente con IA, recordatorios por WhatsApp y PWA en tu
                            subdominio.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {HERO_PILLS.map(({ icon: Icon, label }) => (
                                <span
                                    key={label}
                                    className="vs-body inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#E6F4EF] backdrop-blur-sm"
                                >
                                    <Icon className="size-3.5 text-[#99D2BC]" />
                                    {label}
                                </span>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href="#planes"
                                className="vs-body inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#006D55] shadow-lg shadow-black/20 transition hover:bg-[#E6F4EF] hover:shadow-xl"
                            >
                                Ver planes
                            </a>
                            <a
                                href="#comparar"
                                className="vs-body inline-flex rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
                            >
                                Comparar cantidades
                            </a>
                        </div>
                    </div>

                    <div className="vs-float relative w-full max-w-sm space-y-3">
                        <div className="rounded-[1.75rem] border border-white/15 bg-[#04362B]/75 p-6 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-2 text-[#C5E5D9]">
                                <Sparkles className="size-4" />
                                <span className="vs-body text-[10px] uppercase tracking-[0.22em]">
                                    Clínicas con VetSaaS
                                </span>
                            </div>
                            <p className="vs-display mt-3 text-6xl font-bold tabular-nums text-white sm:text-7xl">
                                {countUp}
                                <span className="text-3xl text-[#99D2BC]">+</span>
                            </p>
                            <p className="vs-body mt-2 text-sm text-[#C5E5D9]/95">
                                Equipos que ya operan en su propio subdominio.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-[#25D366]/35 bg-[#04362B]/80 p-4 backdrop-blur-md">
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/20 text-[#25D366]">
                                    <MessageCircle className="size-5" />
                                </span>
                                <div>
                                    <p className="vs-body text-sm font-semibold text-white">
                                        Recordatorios por WhatsApp
                                    </p>
                                    <p className="vs-body mt-1 text-xs leading-relaxed text-[#C5E5D9]/95">
                                        Citas, vacunas y controles llegan al celular del dueño —
                                        menos ausencias, más agenda llena.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Capabilities */}
            <ScrollReveal direction="up">
                <section className="vs-body border-b border-[var(--vs-border)] bg-[var(--vs-bg)] py-14">
                    <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
                        {[
                            {
                                icon: Bot,
                                t: 'IA integrada',
                                d: 'Apoyo inteligente en flujos clínicos y operativos del día a día.',
                            },
                            {
                                icon: BellRing,
                                t: 'WhatsApp',
                                d: 'Recordatorios automáticos de citas y seguimientos al dueño.',
                            },
                            {
                                icon: Globe2,
                                t: 'Multi-tenant',
                                d: 'Cada clínica tiene su subdominio y datos aislados.',
                            },
                            {
                                icon: Smartphone,
                                t: 'PWA',
                                d: 'Instálalo en el celular o PC como app nativa.',
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.t}
                                    className="vs-section-card rounded-2xl p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <Icon className="size-5 text-[var(--vs-500)]" />
                                    <h2 className="vs-display mt-3 text-lg font-semibold">
                                        {item.t}
                                    </h2>
                                    <p className="vs-muted mt-1 text-sm">{item.d}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </ScrollReveal>

            {/* How multi-tenant + PWA */}
            <ScrollReveal direction="up">
                <section className="bg-[var(--vs-card)] py-16">
                    <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="vs-body text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--vs-500)]">
                                Arquitectura
                            </p>
                            <h2 className="vs-display mt-2 text-3xl font-bold sm:text-4xl">
                                Un producto, muchas clínicas
                            </h2>
                            <p className="vs-body vs-muted mt-3 text-sm leading-relaxed sm:text-base">
                                VetSaaS es multi-tenant: tu marca vive en{' '}
                                <span className="font-semibold text-[var(--vs-600)]">
                                    tuclinica.vetsaas.orvae.pe
                                </span>
                                . Los datos no se mezclan. La PWA abre el panel desde el icono del
                                teléfono. La IA y WhatsApp se suman al flujo clínico sin cambiar de
                                herramienta.
                            </p>
                            <ul className="vs-body mt-6 space-y-3 text-sm text-[var(--vs-ink)]">
                                {[
                                    'Subdominio y branding de tu clínica',
                                    'Recordatorios WhatsApp de citas y vacunas',
                                    'Asistencia con IA en el día a día',
                                    'Activación desde Orvae sin instalar servidores',
                                ].map((line) => (
                                    <li key={line} className="flex items-start gap-2">
                                        <Check className="mt-0.5 size-4 shrink-0 text-[var(--vs-500)]" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,#015743,#006D55_55%,#33A07B)] p-6 text-white shadow-xl">
                            <Zap className="size-6 text-[#E6F4EF]" />
                            <p className="vs-display mt-4 text-2xl font-bold text-white">
                                Flujo real
                            </p>
                            <ol className="vs-body mt-4 space-y-3 text-sm text-[#E6F4EF]/95">
                                <li>1. Eliges plan Free o de pago en Orvae</li>
                                <li>2. Confirmas (sin pasarela si es Free)</li>
                                <li>3. Te llevamos a tu subdominio</li>
                                <li>4. Creas tu contraseña y empiezas a operar</li>
                            </ol>
                            <div className="pointer-events-none absolute -bottom-8 -right-6 size-36 opacity-40">
                                <img
                                    src="/images/vetsaas-robot-pet.png"
                                    alt=""
                                    className="vs-pet-bob size-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* Clients */}
            {clients.length > 0 ? (
                <ScrollReveal direction="up">
                    <section className="bg-[var(--vs-bg)] py-14">
                        <div className="mx-auto max-w-6xl px-5 sm:px-8">
                            <p className="vs-body text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--vs-500)]">
                                En producción
                            </p>
                            <h2 className="vs-display mt-2 text-2xl font-bold sm:text-3xl">
                                Clínicas con marca propia
                            </h2>
                        </div>
                        <div className="mt-8">
                            <VetSaaSClientsCarousel clients={clients} compact />
                        </div>
                    </section>
                </ScrollReveal>
            ) : null}

            {/* Novelties + AlmaPet */}
            <ScrollReveal direction="up">
                <section className="bg-[var(--vs-card)] py-16">
                    <div className="mx-auto max-w-6xl px-5 sm:px-8">
                        <p className="vs-body text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--vs-500)]">
                            Novedades
                        </p>
                        <h2 className="vs-display mt-2 text-3xl font-bold">
                            Lo que está llegando a VetSaaS
                        </h2>
                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            {NOVELTIES.map((n) => (
                                <article
                                    key={n.title}
                                    className="rounded-2xl border border-[var(--vs-border)] bg-[var(--vs-bg)] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <span className="vs-body rounded-full bg-[#006D55] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                        {n.tag}
                                    </span>
                                    <h3 className="vs-display mt-3 text-lg font-semibold">
                                        {n.title}
                                    </h3>
                                    <p className="vs-body vs-muted mt-2 text-sm">{n.body}</p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(120deg,#0A1A24_0%,#123447_55%,#1B4B5C_100%)] p-6 text-white shadow-xl sm:p-8">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-xl">
                                    <div className="inline-flex items-center gap-2 text-[#9FD6E8]">
                                        <Fingerprint className="size-4" />
                                        <span className="vs-body text-[10px] uppercase tracking-[0.22em]">
                                            AlmaPet ID
                                        </span>
                                    </div>
                                    <h3 className="vs-display mt-3 text-2xl font-bold text-white sm:text-3xl">
                                        Identidad digital para mascotas
                                    </h3>
                                    <p className="vs-body mt-3 text-sm leading-relaxed text-white/80">
                                        Complementa VetSaaS con el registro nacional de mascotas:
                                        perfil público, búsqueda, certificados y activación para
                                        clínicas.
                                    </p>
                                </div>
                                <a
                                    href="https://almapetid.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="vs-body inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0A1A24] transition hover:bg-[#E8F4F8]"
                                >
                                    Conocer AlmaPet ID
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* Plans */}
            <section
                id="planes"
                className="vs-planes scroll-mt-24 bg-[var(--vs-bg)] py-16 text-[var(--vs-ink)] sm:py-20"
            >
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <ScrollReveal direction="up">
                        <div className="max-w-2xl">
                            <p className="vs-body text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--vs-500)]">
                                Planes
                            </p>
                            <h2 className="vs-display mt-2 text-3xl font-bold sm:text-4xl">
                                Mismos módulos. Distintas cantidades.
                            </h2>
                            <p className="vs-body vs-muted mt-3 text-sm leading-relaxed sm:text-base">
                                {modulesNote}
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="mt-10">
                        <SoftwareDetailPlansPicker
                            plans={enrichedPlans}
                            selectedPlanId={selectedPlanId}
                            onSelectPlanId={onSelectPlanId}
                            semanticAccents={['#006D55', '#008762', '#33A07B', '#015743']}
                            brand="vetsaas"
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

            {/* Comparison */}
            <section id="comparar" className="scroll-mt-24 bg-[#021E18] py-16 text-white sm:py-20">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <p className="vs-body text-[10px] font-semibold uppercase tracking-[0.24em] text-[#99D2BC]">
                        Comparativa
                    </p>
                    <h2 className="vs-display mt-2 text-3xl font-bold text-white sm:text-4xl">
                        Límites por plan
                    </h2>
                    <p className="vs-body mt-3 max-w-2xl text-sm text-[#C5E5D9]/90">
                        Sedes, usuarios, pacientes, propietarios, productos y comprobantes SUNAT.
                        Los módulos operativos —incluida IA y recordatorios WhatsApp— están en
                        todos.
                    </p>

                    <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-[#04362B]/70 shadow-2xl">
                        <table className="vs-body w-full min-w-[720px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-4 py-4 font-medium text-[#99D2BC]">
                                        Cantidad
                                    </th>
                                    {comparisonCols.map((col) => {
                                        const meta = marketing.plans.find((p) => p.codigo === col);
                                        return (
                                            <th
                                                key={col}
                                                className="vs-display px-4 py-4 text-base font-semibold text-white"
                                            >
                                                {meta?.nombre ?? col}
                                                {meta?.badge ? (
                                                    <span className="ml-2 rounded-full bg-[#008762] px-2 py-0.5 font-[family-name:var(--font-vs-body)] text-[10px] font-medium uppercase tracking-wide text-white">
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
                                        <td className="px-4 py-3.5 text-[#C5E5D9]">
                                            {row.label}
                                        </td>
                                        {comparisonCols.map((col) => (
                                            <td
                                                key={col}
                                                className="px-4 py-3.5 tabular-nums text-white"
                                            >
                                                {row[col] ?? '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Closing */}
            <section className="relative overflow-hidden bg-[var(--vs-bg)] py-16 sm:py-20">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_50%,color-mix(in_oklab,var(--vs-200)_45%,transparent),transparent_60%)]" />
                <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                    <div className="max-w-xl">
                        <h2 className="vs-display text-3xl font-bold sm:text-4xl">
                            Tu clínica, tu subdominio
                        </h2>
                        <p className="vs-body vs-muted mt-3 text-sm leading-relaxed sm:text-base">
                            Activa Free o un plan de pago en Orvae. Al confirmar, entras a crear tu
                            contraseña en VetSaaS — con IA y WhatsApp listos para tu equipo.
                        </p>
                    </div>
                    <a
                        href="#planes"
                        className="vs-body inline-flex shrink-0 rounded-xl bg-[#006D55] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#006D55]/35 transition hover:bg-[#015743]"
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
