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
import VetSaaSWalkingPet from '@/components/software/VetSaaSWalkingPet';
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
        body: 'Ficha del paciente, vacunas, plan de tratamiento y el historial de cada consulta.',
        image: '/images/vetsaas-consulta.jpg',
        alt: 'Consulta veterinaria en la sala de examen',
    },
    {
        index: '02',
        title: 'Agenda, grooming y hotel',
        body: 'Citas, peluquería y guardería en el mismo calendario. El recordatorio sale por WhatsApp.',
        image: '/images/vetsaas-grooming.jpg',
        alt: 'Peluquería canina dentro de la clínica',
    },
    {
        index: '03',
        title: 'Caja y SUNAT',
        body: 'Cobras en recepción y emites el comprobante electrónico sin abrir otro sistema.',
        image: '/images/vetsaas-recepcion.jpg',
        alt: 'Recepción de una clínica veterinaria',
    },
] as const;

const HERO_FRAMES = [
    {
        src: '/images/vetsaas-hero-pets.png',
        alt: 'Pacientes de una clínica veterinaria',
    },
    {
        src: '/images/vetsaas-consulta.jpg',
        alt: 'Consulta veterinaria',
    },
    {
        src: '/images/vetsaas-grooming.jpg',
        alt: 'Grooming en la clínica',
    },
    {
        src: '/images/vetsaas-recepcion.jpg',
        alt: 'Recepción de la clínica',
    },
] as const;

const CLINIC_MODULES = [
    {
        title: 'Historia clínica',
        body: 'Consultas, vacunas, plan de tratamiento y el historial completo del paciente.',
    },
    {
        title: 'Sala de espera',
        body: 'Ves quién llegó, en qué orden pasa y cuándo entra a consulta.',
    },
    {
        title: 'Agenda',
        body: 'Citas clínicas, grooming y hotel en un solo calendario por sede.',
    },
    {
        title: 'Grooming',
        body: 'Servicios, insumos, adelantos y el estado de cada mascota en peluquería.',
    },
    {
        title: 'Hotel y guardería',
        body: 'Estadías, diario de cuidado y cargos que pasan directo a caja.',
    },
    {
        title: 'Inventario',
        body: 'Medicinas, alimento y productos de petshop, con stock por sede.',
    },
    {
        title: 'Caja y SUNAT',
        body: 'Cobros, descuentos y comprobantes electrónicos desde la recepción.',
    },
    {
        title: 'WhatsApp',
        body: 'Recordatorios de citas y vacunas al celular del dueño.',
    },
] as const;

const FAQS = [
    {
        q: '¿Qué es VetSaaS?',
        a: 'Es el sistema de la clínica en la nube: historia clínica, sala de espera, agenda, grooming, hotel, inventario, caja y comprobantes SUNAT. Cada veterinaria entra por su propio subdominio.',
    },
    {
        q: '¿La inteligencia artificial responde en WhatsApp?',
        a: 'Sí. Un asistente de IA atiende el WhatsApp de la clínica: responde consultas de citas y operación, sin reemplazar el criterio del veterinario.',
    },
    {
        q: '¿Qué recordatorios salen solos?',
        a: 'La cita se avisa 48 horas antes y otra vez 2 horas antes. También puedes activar recordatorios de vacunas, cumpleaños de la mascota y el aviso de que el grooming está listo.',
    },
    {
        q: '¿Sirve para clínicas en Perú?',
        a: 'Sí. Emite comprobantes electrónicos SUNAT, cobra en soles y los datos de cada clínica quedan aislados de las demás.',
    },
    {
        q: '¿Grooming y hotel van en el mismo sistema?',
        a: 'Sí. Peluquería y guardería comparten calendario con las citas clínicas. Los cargos pasan a caja.',
    },
    {
        q: '¿Cómo lo activo?',
        a: 'Eliges Free o un plan de pago en Orvae, confirmas y entras a tu subdominio a crear la contraseña.',
    },
] as const;

function FaqAccordion() {
    const [open, setOpen] = useState(0);

    return (
        <div className="mt-8 space-y-3">
            {FAQS.map((item, index) => {
                const isOpen = open === index;
                return (
                    <div
                        key={item.q}
                        className="overflow-hidden rounded-2xl border border-[#99D2BC] bg-white"
                    >
                        <button
                            type="button"
                            className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D55]"
                            aria-expanded={isOpen}
                            onClick={() => setOpen(isOpen ? -1 : index)}
                        >
                            <span className="font-display text-base font-semibold text-[#06241C]">
                                {item.q}
                            </span>
                            <span
                                className={[
                                    'grid size-7 shrink-0 place-items-center rounded-full border border-[#99D2BC] text-lg leading-none text-[#006D55] transition-transform duration-300',
                                    isOpen ? 'rotate-45 bg-[#E7F6EF]' : '',
                                ].join(' ')}
                                aria-hidden
                            >
                                +
                            </span>
                        </button>
                        <div
                            className={[
                                'grid transition-[grid-template-rows] duration-300 ease-out',
                                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                            ].join(' ')}
                        >
                            <div className="overflow-hidden">
                                <p className="font-body px-5 pb-5 text-sm leading-relaxed text-[#1F6B52]">
                                    {item.a}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function HeroStage() {
    const [frame, setFrame] = useState(0);
    const [reduce, setReduce] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const sync = () => setReduce(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    useEffect(() => {
        if (reduce) {
            return;
        }
        const id = window.setInterval(() => {
            setFrame((current) => (current + 1) % HERO_FRAMES.length);
        }, 4200);
        return () => window.clearInterval(id);
    }, [reduce]);

    return (
        <div className="relative m-4 min-h-[52vh] overflow-hidden rounded-3xl border border-[#99D2BC] shadow-[0_24px_60px_-28px_rgba(0,109,85,0.55)] lg:m-8 lg:min-h-[calc(100dvh-4rem)]">
            {HERO_FRAMES.map((item, index) => (
                <img
                    key={item.src}
                    src={item.src}
                    alt={item.alt}
                    className={[
                        'absolute inset-0 size-full object-cover transition-opacity duration-1000',
                        index === frame ? 'opacity-100' : 'opacity-0',
                    ].join(' ')}
                />
            ))}
        </div>
    );
}

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
            if (photoRef.current && photoRef.current.getAttribute('src') !== step.image) {
                photoRef.current.src = step.image;
                photoRef.current.alt = step.alt;
                gsap.fromTo(
                    photoRef.current,
                    { opacity: 0.15 },
                    { opacity: 1, duration: 0.55, overwrite: true },
                );
            }
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
                    <div className="h-[72vh] w-[54%] overflow-hidden rounded-3xl border border-white/15">
                        <img
                            ref={photoRef}
                            src={DAY_STEPS[0].image}
                            alt={DAY_STEPS[0].alt}
                            className="size-full object-cover"
                        />
                    </div>
                </div>
            </section>

            <section className={reduce ? 'bg-[#06241C] px-5 py-16 text-white' : 'bg-[#06241C] px-5 py-16 text-white md:hidden'}>
                <ol className="space-y-10">
                    {DAY_STEPS.map((step) => (
                        <li key={step.index}>
                            <img
                                src={step.image}
                                alt={step.alt}
                                className="mb-4 aspect-[4/3] w-full rounded-3xl border border-white/15 object-cover"
                            />
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
                @keyframes vs-hero-in {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: none; }
                }
                @keyframes vs-hero-drift {
                    from { transform: scale(1.04); }
                    to { transform: scale(1.1); }
                }
                .vs-landing .vs-hero-copy { animation: vs-hero-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .vs-landing .vs-hero-drift { animation: vs-hero-drift 18s ease-in-out infinite alternate; }
                @keyframes vs-scan {
                    from { transform: translateY(-20%); }
                    to { transform: translateY(420%); }
                }
                .vs-landing .vs-scan { animation: vs-scan 7s linear infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .vs-landing .vs-hero-copy,
                    .vs-landing .vs-hero-drift,
                    .vs-landing .vs-scan { animation: none !important; }
                }
            `}</style>

            <section className="grid min-h-[100dvh] bg-[#E7F6EF] text-[#06241C] lg:grid-cols-2">
                <div className="vs-hero-copy flex flex-col justify-center border-l-[6px] border-[#006D55] px-5 py-16 sm:px-10 lg:px-14 lg:py-20">
                    <h1 className="font-display text-6xl font-semibold leading-[0.92] tracking-tight text-[#006D55] sm:text-7xl lg:text-8xl">
                        VetSaaS
                    </h1>
                    <p className="font-body mt-6 max-w-md text-lg leading-snug text-[#1F6B52]">
                        Historia clínica, agenda, caja, SUNAT e IA en el subdominio de tu clínica.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-6">
                        <a
                            href="#planes"
                            className="font-body inline-flex cursor-pointer rounded-xl border border-[#015743] bg-[#006D55] px-5 py-3 text-sm font-semibold text-white transition-transform hover:bg-[#015743] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D55] focus-visible:ring-offset-2 active:translate-y-px"
                        >
                            Ver planes
                        </a>
                        <a
                            href="#comparar"
                            className="font-body inline-flex cursor-pointer rounded-xl border border-[#006D55] bg-white px-5 py-3 text-sm font-medium text-[#006D55] hover:bg-[#F3FBF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D55]"
                        >
                            Comparar
                        </a>
                    </div>
                </div>
                <div className="relative min-h-[52vh] lg:min-h-[100dvh]">
                    <HeroStage />
                </div>
            </section>

            <p className="bg-[#006D55] px-5 py-4 font-body text-sm text-[#E8F7F1] sm:px-10 lg:px-14">
                {display}+ veterinarias ya operan con nosotros.
            </p>

            <section className="relative overflow-hidden bg-[#041910] py-16 text-white sm:py-20">
                <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(60,184,138,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(60,184,138,0.18) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                    aria-hidden
                />
                <div className="vs-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#3CB88A]/25 to-transparent" />
                <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <p className="font-body text-sm font-medium text-[#7DCAA8]">
                            Inteligencia artificial en el WhatsApp de la clínica
                        </p>
                        <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                            El asistente responde. Los recordatorios salen solos.
                        </h2>
                        <ul className="font-body mt-6 space-y-3 text-sm leading-relaxed text-[#D5EBE2] sm:text-base">
                            <li>Atiende mensajes de citas y operación en el WhatsApp de la veterinaria.</li>
                            <li>Avisa la cita 48 horas antes y otra vez 2 horas antes.</li>
                            <li>Recuerda vacunas, cumpleaños de la mascota y cuando el grooming está listo.</li>
                        </ul>
                    </div>
                    <div className="rounded-3xl border border-[#3CB88A]/40 bg-[#06241C]/80 px-4 py-6 shadow-[0_0_40px_rgba(60,184,138,0.18)]">
                        <VetSaaSWalkingPet className="scale-125" />
                        <p className="font-body mt-2 text-center text-xs text-[#7DCAA8]">
                            Compañero de la clínica. La IA trabaja en el chat.
                        </p>
                    </div>
                </div>
            </section>

            <ClinicDayScroll />

            <section className="bg-[#F3FBF7] py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <h2 className="font-display text-3xl font-semibold tracking-tight text-[#006D55] sm:text-4xl">
                        Lo que ya opera en la clínica
                    </h2>
                    <p className="font-body mt-3 max-w-2xl text-sm leading-relaxed text-[#1F6B52] sm:text-base">
                        El mismo panel cubre la consulta, la peluquería, el hotel, el stock y la caja.
                        Los módulos van en todos los planes. Lo que cambia es la cantidad.
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {CLINIC_MODULES.map((item, index) => (
                            <article
                                key={item.title}
                                className={[
                                    'rounded-2xl border border-[#99D2BC] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(0,109,85,0.65)]',
                                    index === 0 ? 'sm:col-span-2' : '',
                                ].join(' ')}
                            >
                                <h3 className="font-display text-lg font-semibold text-[#06241C]">
                                    {item.title}
                                </h3>
                                <p className="font-body mt-2 text-sm leading-relaxed text-[#1F6B52]">
                                    {item.body}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Clients */}
            {clients.length > 0 ? (
                <VetSaaSReveal>
                    <section className="bg-[var(--vs-bg)] py-14">
                        <div className="mx-auto max-w-6xl px-5 sm:px-8">
                            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#006D55] sm:text-4xl">
                                Veterinarias que operan con nosotros
                            </h2>
                            <p className="font-body mt-2 text-sm text-[#1F6B52]">
                                Cada una con su subdominio y su marca.
                            </p>
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
                                className="font-body inline-flex shrink-0 cursor-pointer rounded-xl border border-[#06241C] bg-[#06241C] px-5 py-3 text-sm font-semibold text-white transition-transform hover:bg-[#015743] active:translate-y-px"
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
                        <h2 className="font-display text-3xl font-semibold tracking-tight text-[#006D55]">
                            Preguntas de la clínica
                        </h2>
                        <FaqAccordion />
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
                            className="font-body inline-flex shrink-0 cursor-pointer rounded-xl border border-[#015743] bg-[#006D55] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:bg-[#015743] active:translate-y-px"
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
