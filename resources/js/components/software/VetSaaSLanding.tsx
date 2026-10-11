import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import SoftwareDetailPlansPicker from '@/components/software/SoftwareDetailPlansPicker';
import SoftwareDetailPlanSelectionPanel from '@/components/software/SoftwareDetailPlanSelectionPanel';
import SoftwareDetailStickyPurchaseBar from '@/components/software/SoftwareDetailStickyPurchaseBar';
import VetSaaSClientsCarousel, {
    type VetSaaSShowcaseClient,
} from '@/components/software/VetSaaSClientsCarousel';
import VetSaaSMotionRoot from '@/components/software/VetSaaSMotionRoot';
import VetSaaSReveal from '@/components/software/VetSaaSReveal';
import VetSaaSReviews, { type VetSaaSPublicReview } from '@/components/software/VetSaaSReviews';
import type { SoftwarePricingPlan, SoftwareSystem } from '@/marketplace/softwareCatalog';

gsap.registerPlugin(ScrollTrigger);

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
        trial_days?: number;
        referral_reward_days?: number;
        highlights: string[];
    }>;
    comparison: Array<Record<string, string>>;
    clients: VetSaaSShowcaseClient[];
    reviews?: VetSaaSPublicReview[];
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

const DAY_STEPS = [
    {
        index: '01',
        title: 'Historia clínica',
        body: 'La ficha del paciente, las vacunas y los controles quedan en la nube de tu clínica.',
    },
    {
        index: '02',
        title: 'Agenda y WhatsApp',
        body: 'La cita sale al celular del dueño. Menos ausencias y la agenda se mantiene llena.',
    },
    {
        index: '03',
        title: 'Caja y SUNAT',
        body: 'Cobras y emites el comprobante en el mismo panel, sin abrir otro sistema.',
    },
] as const;

function ClinicDayScroll() {
    const rootRef = useRef<HTMLElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);
    const indexRef = useRef<HTMLParagraphElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const bodyRef = useRef<HTMLParagraphElement>(null);
    const barRef = useRef<HTMLSpanElement>(null);
    const photoRef = useRef<HTMLImageElement>(null);
    const [reduce, setReduce] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const sync = () => setReduce(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return;
        }

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || !root) {
            return;
        }

        let current = 0;
        const apply = (i: number) => {
            const step = DAY_STEPS[i];
            if (indexRef.current) indexRef.current.textContent = step.index;
            if (titleRef.current) titleRef.current.textContent = step.title;
            if (bodyRef.current) bodyRef.current.textContent = step.body;
        };

        const mm = gsap.matchMedia();
        mm.add('(min-width: 768px)', () => {
            const tween = ScrollTrigger.create({
                trigger: root,
                start: 'top top',
                end: '+=180%',
                pin: true,
                scrub: 0.45,
                anticipatePin: 1,
                onUpdate: (self) => {
                    const next = Math.min(
                        DAY_STEPS.length - 1,
                        Math.floor(self.progress * DAY_STEPS.length),
                    );
                    if (next !== current) {
                        current = next;
                        apply(next);
                        if (copyRef.current) {
                            gsap.fromTo(
                                copyRef.current,
                                { y: 16, opacity: 0.35 },
                                { y: 0, opacity: 1, duration: 0.35, overwrite: true },
                            );
                        }
                    }
                    if (barRef.current) {
                        barRef.current.style.transform = `scaleX(${Math.max(0.06, self.progress)})`;
                    }
                    if (photoRef.current) {
                        photoRef.current.style.transform = `scale(${1.04 + self.progress * 0.08})`;
                    }
                },
            });

            return () => tween.kill();
        });

        return () => mm.revert();
    }, []);

    return (
        <>
            <section
                ref={rootRef}
                className={reduce ? 'relative hidden' : 'relative hidden bg-[#06241C] text-white md:block'}
            >
                <div className="mx-auto flex h-[100dvh] max-w-6xl items-center gap-16 px-8">
                    <div ref={copyRef} className="w-[46%]">
                        <p
                            ref={indexRef}
                            className="font-mono text-sm tabular-nums text-[#7DCAA8]"
                        >
                            01
                        </p>
                        <h2
                            ref={titleRef}
                            className="font-display mt-4 text-5xl font-semibold leading-[1.02] tracking-tight xl:text-6xl"
                        >
                            Historia clínica
                        </h2>
                        <p
                            ref={bodyRef}
                            className="font-body mt-5 max-w-md text-lg leading-snug text-[#D5EBE2]"
                        >
                            La ficha del paciente, las vacunas y los controles quedan en la nube de tu clínica.
                        </p>
                        <div className="mt-10 h-px w-40 bg-white/20">
                            <span
                                ref={barRef}
                                className="block h-px w-full origin-left bg-[#3CB88A]"
                                style={{ transform: 'scaleX(0.06)' }}
                            />
                        </div>
                    </div>
                    <div className="h-[72vh] w-[54%] overflow-hidden">
                        <img
                            ref={photoRef}
                            src="/images/vetsaas-hero-pets.png"
                            alt="Pacientes de una clínica veterinaria"
                            className="size-full object-cover object-[60%_center]"
                            style={{ transform: 'scale(1.04)' }}
                        />
                    </div>
                </div>
            </section>

            <section className={reduce ? 'bg-[#06241C] px-5 py-16 text-white' : 'bg-[#06241C] px-5 py-16 text-white md:hidden'}>
                <ol className="space-y-10">
                    {DAY_STEPS.map((step) => (
                        <li key={step.index}>
                            <p className="font-mono text-sm text-[#7DCAA8]">{step.index}</p>
                            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">
                                {step.title}
                            </h2>
                            <p className="font-body mt-3 text-base leading-snug text-[#D5EBE2]">
                                {step.body}
                            </p>
                        </li>
                    ))}
                </ol>
            </section>
        </>
    );
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
    const clients = showcaseClients.length > 0 ? showcaseClients : marketing.clients;
    const reviews = marketing.reviews ?? [];

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
        <VetSaaSMotionRoot>
        <div className="vs-landing relative">
            <style>{`
                .vs-landing {
                    --vs-500: #008762;
                    --vs-600: #006D55;
                    --vs-700: #015743;
                    --vs-ink: #06241C;
                    --vs-bg: #F4F7F5;
                    --vs-card: #ffffff;
                    --vs-muted: #3E5C52;
                    --vs-border: rgba(6, 36, 28, 0.12);
                    color: var(--vs-ink);
                    background: var(--vs-bg);
                    font-family: var(--font-body), "DM Sans", sans-serif;
                }
                .vs-landing .vs-display { font-family: var(--font-display), Syne, sans-serif; }
                .vs-landing .vs-body { font-family: var(--font-body), "DM Sans", sans-serif; }
                .vs-landing .vs-muted { color: var(--vs-muted); }
                .vs-landing .vs-plans {
                    --background: #ffffff;
                    --foreground: #06241C;
                    --muted-foreground: #3E5C52;
                    --border: rgba(6, 36, 28, 0.12);
                    --primary: #006D55;
                    --primary-foreground: #ffffff;
                    --card: #ffffff;
                }
            `}</style>

            <section className="grid min-h-[100dvh] bg-[#F4F7F5] text-[#06241C] lg:grid-cols-2">
                <div className="flex flex-col justify-center px-5 py-16 sm:px-10 lg:px-14 lg:py-20">
                    <h1 className="font-display text-6xl font-semibold leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
                        VetSaaS
                    </h1>
                    <p className="font-body mt-6 max-w-md text-lg leading-snug text-[#31584C]">
                        Historia clínica, agenda, caja, SUNAT e IA en el subdominio de tu clínica.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-6">
                        <a
                            href="#planes"
                            className="font-body inline-flex bg-[#006D55] px-5 py-3 text-sm font-semibold text-white transition-transform hover:bg-[#015743] active:translate-y-px"
                        >
                            Ver planes
                        </a>
                        <a
                            href="#comparar"
                            className="font-body text-sm font-medium text-[#06241C] underline decoration-[#006D55] underline-offset-4"
                        >
                            Comparar
                        </a>
                    </div>
                </div>
                <div className="relative min-h-[52vh] lg:min-h-[100dvh]">
                    <img
                        src="/images/vetsaas-hero-pets.png"
                        alt="Mascotas atendidas en una clínica veterinaria"
                        className="absolute inset-0 size-full object-cover object-[62%_center]"
                    />
                </div>
            </section>

            <p className="border-y border-[#06241C]/10 bg-[#F4F7F5] px-5 py-4 font-body text-sm text-[#31584C] sm:px-10 lg:px-14">
                {display}+ clínicas ya operan en su propio subdominio.
            </p>

            <ClinicDayScroll />

            {/* Clients */}
            {clients.length > 0 ? (
                <VetSaaSReveal>
                    <section className="bg-[var(--vs-bg)] py-14">
                        <div className="mx-auto max-w-6xl px-5 sm:px-8">
                            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                Clínicas con marca propia
                            </h2>
                        </div>
                        <div className="mt-8">
                            <VetSaaSClientsCarousel clients={clients} compact />
                        </div>
                    </section>
                </VetSaaSReveal>
            ) : null}

            {reviews.length > 0 ? (
                <VetSaaSReveal>
                    <VetSaaSReviews reviews={reviews} />
                </VetSaaSReveal>
            ) : null}

            {/* Novelties + AlmaPet */}
            <VetSaaSReveal>
                <section className="bg-[var(--vs-card)] py-16">
                    <div className="mx-auto max-w-6xl px-5 sm:px-8">
                        <h2 className="font-display text-3xl font-semibold tracking-tight">
                            Lo que está llegando
                        </h2>
                        <div className="mt-8 divide-y divide-[#06241C]/10 border-y border-[#06241C]/10">
                            {NOVELTIES.map((n) => (
                                <article
                                    key={n.title}
                                    className="grid gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-8"
                                >
                                    <p className="font-body text-sm font-medium text-[#006D55]">
                                        {n.tag}
                                    </p>
                                    <div>
                                        <h3 className="font-display text-xl font-semibold">
                                            {n.title}
                                        </h3>
                                        <p className="font-body vs-muted mt-1 text-sm">{n.body}</p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-14 flex flex-col gap-6 border-t border-[#06241C]/10 pt-10 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-xl">
                                <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Identidad digital para mascotas
                                </h3>
                                <p className="font-body vs-muted mt-3 text-sm leading-relaxed">
                                    AlmaPet ID complementa VetSaaS: perfil público, búsqueda y
                                    certificados para la clínica.
                                </p>
                            </div>
                            <a
                                href="https://almapetid.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-body inline-flex shrink-0 bg-[#06241C] px-5 py-3 text-sm font-semibold text-white transition-transform hover:bg-[#015743] active:translate-y-px"
                            >
                                Conocer AlmaPet ID
                            </a>
                        </div>
                    </div>
                </section>
            </VetSaaSReveal>

            <VetSaaSReveal>
                <section
                    id="faq-software-veterinario"
                    className="scroll-mt-24 border-t border-[var(--vs-border)] bg-[var(--vs-bg)] py-16"
                >
                    <div className="mx-auto max-w-3xl px-5 sm:px-8">
                        <h2 className="font-display text-3xl font-semibold tracking-tight">
                            Preguntas de la clínica
                        </h2>
                        <div className="mt-8 divide-y divide-[#06241C]/10 border-y border-[#06241C]/10">
                            {[
                                {
                                    q: '¿Qué es un software veterinario?',
                                    a: 'Centraliza historia clínica, agenda, inventario, caja y facturación. VetSaaS lo entrega en la nube, con subdominio, IA y WhatsApp.',
                                },
                                {
                                    q: '¿Sirve para clínicas en Perú?',
                                    a: 'Sí. Es multi-tenant, emite comprobantes SUNAT y se activa desde Orvae.',
                                },
                                {
                                    q: '¿Cómo lo activo?',
                                    a: 'Eliges Free o un plan de pago, confirmas y entras a tu subdominio a crear la contraseña.',
                                },
                            ].map((item) => (
                                <article key={item.q} className="py-6">
                                    <h3 className="font-display text-lg font-semibold">{item.q}</h3>
                                    <p className="font-body vs-muted mt-2 text-sm leading-relaxed">
                                        {item.a}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </VetSaaSReveal>

            {/* Plans */}
            <section
                id="planes"
                className="vs-planes scroll-mt-24 bg-[var(--vs-bg)] py-16 text-[var(--vs-ink)] sm:py-20"
            >
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <VetSaaSReveal>
                        <div className="max-w-2xl">
                            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                Mismos módulos. Distintas cantidades.
                            </h2>
                            <p className="vs-body vs-muted mt-3 text-sm leading-relaxed sm:text-base">
                                {modulesNote}
                            </p>
                        </div>
                    </VetSaaSReveal>

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
            <section id="comparar" className="scroll-mt-24 border-t border-[#06241C]/10 bg-[#F4F7F5] py-16 text-[#06241C] sm:py-20">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                        Límites por plan
                    </h2>
                    <p className="font-body vs-muted mt-3 max-w-2xl text-sm">
                        Sedes, usuarios, pacientes, propietarios, productos y comprobantes SUNAT.
                        IA y WhatsApp están en todos los planes.
                    </p>

                    <div className="mt-10 overflow-x-auto border-y border-[#06241C]/15">
                        <table className="font-body w-full min-w-[720px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#06241C]/15">
                                    <th className="px-4 py-4 font-medium text-[#3E5C52]">
                                        Cantidad
                                    </th>
                                    {comparisonCols.map((col) => {
                                        const meta = marketing.plans.find((p) => p.codigo === col);
                                        return (
                                            <th
                                                key={col}
                                                className="font-display px-4 py-4 text-base font-semibold text-[#06241C]"
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
                                        className="border-b border-[#06241C]/10 last:border-0"
                                    >
                                        <td className="px-4 py-3.5 text-[#3E5C52]">
                                            {row.label}
                                        </td>
                                        {comparisonCols.map((col) => (
                                            <td
                                                key={col}
                                                className="px-4 py-3.5 tabular-nums text-[#06241C]"
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
            <VetSaaSReveal>
                <section className="bg-[#F4F7F5] py-16 sm:py-20">
                    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                        <div className="max-w-xl">
                            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                Tu clínica, tu subdominio
                            </h2>
                            <p className="font-body vs-muted mt-3 text-sm leading-relaxed sm:text-base">
                                Activa Free o un plan de pago. Al confirmar, entras a crear tu
                                contraseña en VetSaaS.
                            </p>
                        </div>
                        <a
                            href="#planes"
                            className="font-body inline-flex shrink-0 bg-[#006D55] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:bg-[#015743] active:translate-y-px"
                        >
                            Ver planes
                        </a>
                    </div>
                </section>
            </VetSaaSReveal>

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
        </VetSaaSMotionRoot>
    );
}
