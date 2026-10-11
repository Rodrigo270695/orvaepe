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

function useReducedMotion() {
    const [reduce, setReduce] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const sync = () => setReduce(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    return reduce;
}

function useInView<T extends Element>(threshold = 0.35) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, inView] as const;
}

function CountUp({ to, duration = 1600 }: { to: number; duration?: number }) {
    const [ref, inView] = useInView<HTMLSpanElement>(0.5);
    const reduce = useReducedMotion();
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduce) {
            setValue(to);
            return;
        }
        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, reduce, to, duration]);

    return (
        <span ref={ref} className="tabular-nums">
            {value}
        </span>
    );
}

function HeroStage() {
    const [frame, setFrame] = useState(0);
    const reduce = useReducedMotion();

    useEffect(() => {
        if (reduce) {
            return;
        }
        const id = window.setInterval(() => {
            setFrame((current) => (current + 1) % HERO_FRAMES.length);
        }, 4600);
        return () => window.clearInterval(id);
    }, [reduce]);

    return (
        <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[#99D2BC] bg-[#CFEBDF] shadow-[0_40px_80px_-40px_rgba(0,109,85,0.7)] sm:aspect-[5/5] lg:aspect-[4/5]">
                {HERO_FRAMES.map((item, index) => (
                    <img
                        key={item.src}
                        src={item.src}
                        alt={item.alt}
                        className={[
                            'absolute inset-0 size-full object-cover transition-[opacity,transform,filter] duration-[1400ms] ease-out',
                            index === frame
                                ? 'vs-hero-drift scale-100 opacity-100 blur-0'
                                : 'scale-110 opacity-0 blur-sm',
                        ].join(' ')}
                    />
                ))}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#06241C]/55 to-transparent" />
                <div className="absolute right-5 top-5 flex gap-2 rounded-full border border-white/40 bg-[#06241C]/30 px-2.5 py-2 backdrop-blur">
                    {HERO_FRAMES.map((item, index) => (
                        <button
                            key={item.src}
                            type="button"
                            aria-label={`Ver imagen ${index + 1}`}
                            onClick={() => setFrame(index)}
                            className={[
                                'h-2 cursor-pointer rounded-full border border-white/70 transition-all duration-500',
                                index === frame ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60',
                            ].join(' ')}
                        />
                    ))}
                </div>
            </div>

            <div className="vs-float-in vs-float absolute -left-4 top-8 w-[15.5rem] rounded-2xl border border-[#99D2BC] bg-white/95 p-3.5 shadow-[0_20px_40px_-20px_rgba(6,36,28,0.45)] backdrop-blur sm:-left-10 [animation-delay:0.5s]">
                <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-full border border-[#99D2BC] bg-[#E7F6EF] text-[#006D55]">
                        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Z" />
                        </svg>
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#06241C]">Recordatorio enviado</p>
                        <p className="text-[11px] text-[#3E5C52]">WhatsApp · 2 h antes</p>
                    </div>
                </div>
                <p className="mt-2.5 rounded-xl border border-[#CDEBDD] bg-[#F3FBF7] px-3 py-2 text-xs leading-snug text-[#1F6B52]">
                    Hola Ana, Rocky tiene control hoy a las 4:00 pm.
                </p>
            </div>

            <div className="vs-float-in vs-float-slow absolute -right-3 top-[46%] w-[12.5rem] rounded-2xl border border-[#99D2BC] bg-white/95 p-3.5 shadow-[0_20px_40px_-20px_rgba(6,36,28,0.45)] backdrop-blur sm:-right-8 [animation-delay:0.8s]">
                <p className="text-[11px] font-medium text-[#3E5C52]">Sala de espera</p>
                <p className="font-display mt-1 text-2xl font-semibold text-[#06241C]">3 pacientes</p>
                <div className="mt-2 flex gap-1">
                    <span className="h-1.5 flex-1 rounded-full bg-[#006D55]" />
                    <span className="h-1.5 flex-1 rounded-full bg-[#33A07B]" />
                    <span className="h-1.5 flex-1 rounded-full bg-[#99D2BC]" />
                </div>
            </div>

            <div className="vs-float-in vs-float absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-[#015743] bg-[#006D55] px-4 py-3 text-white shadow-[0_20px_40px_-18px_rgba(0,109,85,0.8)] sm:left-10 [animation-delay:1.1s]">
                <span className="grid size-8 place-items-center rounded-full border border-white/30 bg-white/10">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <div>
                    <p className="text-xs font-semibold">Boleta SUNAT emitida</p>
                    <p className="text-[11px] text-[#CDEDE0]">B001-00245 · S/ 85.00</p>
                </div>
            </div>
        </div>
    );
}

function HeroTitle() {
    const lines = [
        { words: ['La', 'clínica', 'en', 'orden.'], className: 'text-[#06241C]' },
        { words: ['La', 'IA', 'en', 'el', 'WhatsApp.'], className: 'text-[#008762]' },
    ];
    let i = 0;

    return (
        <h1 className="font-display mt-6 text-[2.75rem] font-semibold leading-[0.98] tracking-tight sm:text-6xl xl:text-7xl">
            {lines.map((line) => (
                <span key={line.words.join(' ')} className={`block ${line.className}`}>
                    {line.words.map((word) => {
                        const delay = 0.15 + i++ * 0.08;
                        return (
                            <span
                                key={`${word}-${delay}`}
                                className="vs-word inline-block pr-[0.22em]"
                                style={{ animationDelay: `${delay}s` }}
                            >
                                {word}
                            </span>
                        );
                    })}
                </span>
            ))}
        </h1>
    );
}

function StatsBand({ clinics }: { clinics: number }) {
    const items = [
        {
            value: (
                <>
                    <CountUp to={clinics} />+
                </>
            ),
            label: 'veterinarias operan con nosotros',
        },
        { value: '48 h · 2 h', label: 'antes de cada cita sale el recordatorio' },
        { value: '8', label: 'módulos en un solo panel' },
        { value: '24/7', label: 'asistente de IA en el WhatsApp' },
    ];

    return (
        <section className="relative overflow-hidden border-y border-[#015743] bg-[#006D55] text-white">
            <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
                    backgroundSize: '22px 22px',
                }}
                aria-hidden
            />
            <div className="relative mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
                {items.map((item, index) => (
                    <VetSaaSReveal key={item.label}>
                        <div
                            className={[
                                'h-full px-5 py-9 sm:px-8 lg:py-12',
                                index % 2 === 1 ? 'border-l border-white/15' : '',
                                index >= 2 ? 'border-t border-white/15 lg:border-t-0' : '',
                                index === 2 ? 'lg:border-l' : '',
                            ].join(' ')}
                        >
                            <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl xl:text-6xl">
                                {item.value}
                            </p>
                            <p className="font-body mt-2 max-w-[14rem] text-sm leading-snug text-[#CDEDE0] sm:text-base">
                                {item.label}
                            </p>
                        </div>
                    </VetSaaSReveal>
                ))}
            </div>
        </section>
    );
}

const CHAT = [
    { from: 'owner', text: 'Hola, ¿hay cita para vacunar a Luna mañana?', time: '09:12' },
    { from: 'ai', text: 'Hola. Mañana hay 10:30 am y 4:00 pm con la Dra. Ríos. ¿Cuál te reservo?', time: '09:12' },
    { from: 'owner', text: '4 pm, por favor.', time: '09:13' },
    { from: 'ai', text: 'Listo. Luna queda agendada mañana a las 4:00 pm. Te aviso 2 horas antes.', time: '09:13' },
    { from: 'system', text: 'Recordatorio automático programado · 48 h y 2 h antes' },
] as const;

function AiChatDemo() {
    const [ref, inView] = useInView<HTMLDivElement>(0.4);
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduce) {
            setShown(CHAT.length);
            return;
        }
        const next = shown < CHAT.length ? (CHAT[shown].from === 'ai' ? 1500 : 900) : 5000;
        const id = window.setTimeout(() => {
            setShown((s) => (s >= CHAT.length ? 0 : s + 1));
        }, next);
        return () => window.clearTimeout(id);
    }, [inView, reduce, shown]);

    const typing = !reduce && shown < CHAT.length && CHAT[shown].from === 'ai';

    return (
        <div
            ref={ref}
            className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-[#3CB88A]/45 bg-[#0A2E23] shadow-[0_0_60px_-10px_rgba(60,184,138,0.35)]"
        >
            <div className="flex items-center gap-3 border-b border-[#3CB88A]/25 bg-[#06241C] px-5 py-4">
                <span className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-[#3CB88A]/60 bg-[#0F3B2E]">
                    <img src="/images/vetsaas-robot-pet.png" alt="" className="size-9 object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">Asistente IA · Tu veterinaria</p>
                    <p className="flex items-center gap-1.5 text-xs text-[#7DCAA8]">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3CB88A] opacity-70 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2 rounded-full bg-[#3CB88A]" />
                        </span>
                        en línea
                    </p>
                </div>
                <span className="rounded-full border border-[#3CB88A]/40 px-2.5 py-1 font-mono text-[10px] text-[#7DCAA8]">
                    IA
                </span>
            </div>

            <div
                className="flex min-h-[23rem] flex-col justify-end gap-2.5 px-4 py-5"
                aria-live="polite"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(125,202,168,0.12) 1px, transparent 0)',
                    backgroundSize: '18px 18px',
                }}
            >
                {CHAT.slice(0, shown).map((msg) =>
                    msg.from === 'system' ? (
                        <p
                            key={msg.text}
                            className="vs-bubble mx-auto rounded-full border border-[#3CB88A]/40 bg-[#3CB88A]/10 px-3 py-1.5 text-center text-[11px] font-medium text-[#99D2BC]"
                        >
                            {msg.text}
                        </p>
                    ) : (
                        <div
                            key={msg.text}
                            className={[
                                'vs-bubble max-w-[82%] rounded-2xl border px-3.5 py-2.5 text-sm leading-snug',
                                msg.from === 'ai'
                                    ? 'ml-auto rounded-br-md border-[#3CB88A]/50 bg-[#006D55] text-white'
                                    : 'rounded-bl-md border-white/10 bg-white/[0.07] text-[#E3F3EC]',
                            ].join(' ')}
                        >
                            {msg.text}
                            <span className="mt-1 block text-right text-[10px] opacity-60">{msg.time}</span>
                        </div>
                    ),
                )}
                {typing ? (
                    <div className="vs-bubble ml-auto flex gap-1 rounded-2xl rounded-br-md border border-[#3CB88A]/50 bg-[#006D55] px-4 py-3">
                        {[0, 1, 2].map((d) => (
                            <span
                                key={d}
                                className="size-1.5 animate-bounce rounded-full bg-white/80"
                                style={{ animationDelay: `${d * 0.15}s` }}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
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
                @keyframes vs-word-in {
                    from { opacity: 0; transform: translateY(0.45em); filter: blur(10px); }
                    to { opacity: 1; transform: none; filter: blur(0); }
                }
                .vs-landing .vs-word { animation: vs-word-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
                @keyframes vs-pop {
                    from { opacity: 0; transform: translateY(24px) scale(0.94); filter: blur(6px); }
                    to { opacity: 1; transform: none; filter: blur(0); }
                }
                @keyframes vs-bob {
                    0%, 100% { translate: 0 0; }
                    50% { translate: 0 -10px; }
                }
                .vs-landing .vs-float-in {
                    animation: vs-pop 0.9s cubic-bezier(0.22, 1, 0.36, 1) both, vs-bob 7s ease-in-out infinite;
                }
                .vs-landing .vs-float-slow { animation-duration: 0.9s, 9s; }
                @keyframes vs-bubble-in {
                    from { opacity: 0; transform: translateY(10px) scale(0.96); }
                    to { opacity: 1; transform: none; }
                }
                .vs-landing .vs-bubble { animation: vs-bubble-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
                @keyframes vs-cross {
                    from { transform: translateX(-16rem); }
                    to { transform: translateX(calc(100vw + 2rem)); }
                }
                .vs-landing .vs-cross { animation: vs-cross 26s linear infinite; }
                .vs-landing .vs-fade-up { animation: vs-hero-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .vs-landing .vs-hero-copy,
                    .vs-landing .vs-hero-drift,
                    .vs-landing .vs-scan,
                    .vs-landing .vs-word,
                    .vs-landing .vs-float-in,
                    .vs-landing .vs-bubble,
                    .vs-landing .vs-cross,
                    .vs-landing .vs-fade-up { animation: none !important; }
                }
            `}</style>

            <section className="relative overflow-hidden bg-[#E7F6EF] text-[#06241C]">
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            'radial-gradient(60rem 40rem at 0% 0%, rgba(255,255,255,0.85), transparent 60%), radial-gradient(40rem 30rem at 100% 100%, rgba(51,160,123,0.22), transparent 60%)',
                    }}
                    aria-hidden
                />
                <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
                    <div>
                        <p className="vs-fade-up inline-flex items-center gap-2 rounded-full border border-[#99D2BC] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#015743] shadow-sm">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3CB88A] opacity-70 motion-reduce:animate-none" />
                                <span className="relative inline-flex size-2 rounded-full bg-[#008762]" />
                            </span>
                            VetSaaS · Software veterinario con IA
                        </p>
                        <HeroTitle />
                        <p
                            className="vs-fade-up font-body mt-6 max-w-xl text-lg leading-relaxed text-[#1F6B52]"
                            style={{ animationDelay: '0.9s' }}
                        >
                            Historia clínica, agenda, grooming, hotel, caja y SUNAT en el subdominio de
                            tu clínica. El asistente responde en WhatsApp y los recordatorios salen solos.
                        </p>
                        <div
                            className="vs-fade-up mt-8 flex flex-wrap items-center gap-3"
                            style={{ animationDelay: '1.05s' }}
                        >
                            <a
                                href="#planes"
                                className="font-body group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#015743] bg-[#006D55] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_-14px_rgba(0,109,85,0.9)] transition-all hover:-translate-y-0.5 hover:bg-[#015743] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D55] focus-visible:ring-offset-2 active:translate-y-px"
                            >
                                Empieza gratis
                                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                            </a>
                            <a
                                href="#comparar"
                                className="font-body inline-flex cursor-pointer rounded-xl border border-[#006D55] bg-white px-6 py-3.5 text-sm font-semibold text-[#006D55] transition-colors hover:bg-[#F3FBF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D55]"
                            >
                                Comparar planes
                            </a>
                        </div>

                        <div
                            className="vs-fade-up mt-10 inline-flex flex-wrap items-center gap-5 rounded-2xl border border-[#99D2BC] bg-white/85 py-4 pl-4 pr-6 shadow-[0_20px_40px_-28px_rgba(0,109,85,0.6)] backdrop-blur"
                            style={{ animationDelay: '1.2s' }}
                        >
                            {clients.length > 0 ? (
                                <div className="flex">
                                    {clients.slice(0, 5).map((client, index) => (
                                        <img
                                            key={client.slug}
                                            src={client.logo_url}
                                            alt={client.name}
                                            className={[
                                                'size-12 rounded-full border-2 border-white bg-[#F3FBF7] object-contain p-1 shadow-sm ring-1 ring-[#99D2BC]',
                                                index > 0 ? '-ml-3' : '',
                                            ].join(' ')}
                                        />
                                    ))}
                                </div>
                            ) : null}
                            <div>
                                <p className="font-display text-4xl font-semibold leading-none tracking-tight text-[#006D55] sm:text-5xl">
                                    <CountUp to={display} />+
                                </p>
                                <p className="font-body mt-1 text-sm font-medium text-[#1F6B52]">
                                    veterinarias operan con nosotros
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="vs-fade-up px-4 sm:px-8 lg:px-6" style={{ animationDelay: '0.3s' }}>
                        <HeroStage />
                    </div>
                </div>
            </section>

            <StatsBand clinics={display} />

            {clients.length > 0 ? (
                <section className="bg-[#F3FBF7] pt-14">
                    <VetSaaSReveal>
                        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
                            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#06241C] sm:text-5xl">
                                Más de <span className="text-[#006D55]">{display}</span> veterinarias
                                operan con nosotros
                            </h2>
                            <p className="font-body mx-auto mt-3 max-w-xl text-base text-[#1F6B52]">
                                Cada una con su subdominio, su logo y su marca. Del Perú para las clínicas del Perú.
                            </p>
                        </div>
                    </VetSaaSReveal>
                    <div className="mt-10">
                        <VetSaaSClientsCarousel clients={clients} compact />
                    </div>
                </section>
            ) : null}

            <section className="relative overflow-hidden bg-[#041910] pb-44 pt-20 text-white sm:pb-48 sm:pt-24">
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
                <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <VetSaaSReveal>
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full border border-[#3CB88A]/40 bg-[#3CB88A]/10 px-3.5 py-1.5 font-mono text-xs text-[#99D2BC]">
                                <span className="size-1.5 rounded-full bg-[#3CB88A]" />
                                IA en el WhatsApp de la clínica
                            </p>
                            <h2 className="font-display mt-5 text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
                                El asistente responde.
                                <span className="block text-[#3CB88A]">Los recordatorios salen solos.</span>
                            </h2>
                            <ul className="font-body mt-8 space-y-4 text-base leading-relaxed text-[#D5EBE2]">
                                {[
                                    'Atiende los mensajes de citas y operación en el WhatsApp de tu veterinaria, de día y de noche.',
                                    'Avisa la cita 48 horas antes y otra vez 2 horas antes. Menos inasistencias.',
                                    'Recuerda vacunas a 7 días, cumpleaños de la mascota y avisa cuando el grooming está listo.',
                                    'No reemplaza al veterinario: agenda, informa y deja todo registrado en la ficha.',
                                ].map((text) => (
                                    <li key={text} className="flex gap-3">
                                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-[#3CB88A]/60 bg-[#3CB88A]/15 text-[#3CB88A]">
                                            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                                                <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </VetSaaSReveal>
                    <AiChatDemo />
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 border-t border-[#3CB88A]/25 bg-gradient-to-b from-[#3CB88A]/[0.06] to-transparent" aria-hidden>
                    <div className="vs-cross absolute bottom-3 left-0 w-56">
                        <VetSaaSWalkingPet />
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
                                    'group relative overflow-hidden rounded-2xl border border-[#99D2BC] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(0,109,85,0.65)] transition-all duration-300 hover:-translate-y-1 hover:border-[#006D55] hover:shadow-[0_28px_50px_-28px_rgba(0,109,85,0.8)]',
                                    index === 0 ? 'sm:col-span-2' : '',
                                ].join(' ')}
                            >
                                <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#006D55] transition-transform duration-500 group-hover:scale-x-100" />
                                <p className="font-mono text-xs tabular-nums text-[#33A07B]">
                                    {String(index + 1).padStart(2, '0')}
                                </p>
                                <h3 className="font-display mt-3 text-lg font-semibold text-[#06241C]">
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
