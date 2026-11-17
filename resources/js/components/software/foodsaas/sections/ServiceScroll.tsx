import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
    {
        index: '01',
        title: 'La mesa pide.',
        body: 'El salón abre la cuenta. El plato sale de la carta y queda en la comanda.',
        image: '/images/foodsaas/salon.jpg',
        alt: 'Salón de un restaurante con mesas puestas',
    },
    {
        index: '02',
        title: 'La cocina recibe.',
        body: 'El pase ve el pedido sin que nadie lo grite. El plato se marca listo.',
        image: '/images/foodsaas/cocina.jpg',
        alt: 'Pase de cocina con lomo saltado y ceviche',
    },
    {
        index: '03',
        title: 'La caja cierra.',
        body: 'Turno, medios de pago y el ticket del día en el mismo movimiento.',
        image: '/images/foodsaas/caja.jpg',
        alt: 'Caja del restaurante con tablet, efectivo y tarjeta',
    },
    {
        index: '04',
        title: 'La carta manda.',
        body: 'Precios, fotos y lo que sí se puede vender hoy. El salón no improvisa.',
        image: '/images/foodsaas/carta.jpg',
        alt: 'Plato de lomo saltado con arroz y papas',
    },
] as const;

function PinnedService() {
    const rootRef = useRef<HTMLElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);
    const indexRef = useRef<HTMLParagraphElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const bodyRef = useRef<HTMLParagraphElement>(null);
    const barRef = useRef<HTMLSpanElement>(null);
    const photoRef = useRef<HTMLImageElement>(null);
    const preloaded = useRef(false);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        let current = 0;
        const apply = (i: number) => {
            const step = STEPS[i];
            if (indexRef.current) indexRef.current.textContent = step.index;
            if (titleRef.current) titleRef.current.textContent = step.title;
            if (bodyRef.current) bodyRef.current.textContent = step.body;
            if (photoRef.current && photoRef.current.getAttribute('src') !== step.image) {
                photoRef.current.src = step.image;
                photoRef.current.alt = step.alt;
                gsap.fromTo(photoRef.current, { opacity: 0.25 }, { opacity: 1, duration: 0.45, overwrite: true });
            }
            if (copyRef.current) {
                gsap.fromTo(copyRef.current, { y: 14, opacity: 0.45 }, { y: 0, opacity: 1, duration: 0.32, overwrite: true });
            }
        };

        const mm = gsap.matchMedia();
        mm.add('(min-width: 768px)', () => {
            const trigger = ScrollTrigger.create({
                trigger: root,
                start: 'top top',
                end: '+=180%',
                pin: true,
                scrub: 0.45,
                anticipatePin: 1,
                onEnter: () => {
                    if (preloaded.current) return;
                    preloaded.current = true;
                    STEPS.slice(1).forEach((step) => {
                        new Image().src = step.image;
                    });
                },
                onUpdate: (self) => {
                    const next = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
                    if (next !== current) {
                        current = next;
                        apply(next);
                    }
                    if (barRef.current) {
                        barRef.current.style.transform = `scaleX(${Math.max(0.08, self.progress)})`;
                    }
                },
            });
            return () => trigger.kill();
        });

        return () => mm.revert();
    }, []);

    const first = STEPS[0];

    return (
        <section ref={rootRef} className="relative hidden md:block" style={{ background: 'var(--fs-paper-2)', color: 'var(--fs-ink)' }}>
            <div className="mx-auto flex h-[100dvh] max-w-6xl items-center gap-16 px-8">
                <div ref={copyRef} className="w-[46%]">
                    <p className="fs-kicker">Un servicio en el local</p>
                    <p ref={indexRef} className="mt-6 font-mono text-sm tabular-nums text-[var(--fs-wine)]">
                        {first.index}
                    </p>
                    <h3 ref={titleRef} className="fs-display mt-3 text-5xl xl:text-6xl">
                        {first.title}
                    </h3>
                    <p ref={bodyRef} className="mt-5 max-w-md font-sans text-lg leading-snug text-[var(--fs-muted)]">
                        {first.body}
                    </p>
                    <div className="mt-10 h-px w-44 bg-[var(--fs-rule)]">
                        <span
                            ref={barRef}
                            className="block h-px w-full origin-left bg-[var(--fs-wine)]"
                            style={{ transform: 'scaleX(0.08)' }}
                        />
                    </div>
                </div>
                <div className="h-[70vh] w-[54%] overflow-hidden rounded-3xl border border-[var(--fs-rule)]">
                    <img ref={photoRef} src={first.image} alt={first.alt} className="size-full object-cover" />
                </div>
            </div>
        </section>
    );
}

export default function ServiceScroll() {
    const reduce = useReducedMotion();

    if (reduce) {
        return (
            <section className="px-5 py-20 sm:px-8" style={{ background: 'var(--fs-paper-2)', color: 'var(--fs-ink)' }}>
                <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
                    {STEPS.map((step) => (
                        <article key={step.index}>
                            <img src={step.image} alt={step.alt} className="aspect-[4/3] w-full rounded-3xl object-cover" />
                            <p className="mt-4 font-mono text-xs text-[var(--fs-wine)]">{step.index}</p>
                            <h3 className="fs-display mt-1 text-3xl">{step.title}</h3>
                            <p className="mt-2 font-sans text-[var(--fs-muted)]">{step.body}</p>
                        </article>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <>
            <PinnedService />
            <section className="px-5 py-16 md:hidden" style={{ background: 'var(--fs-paper-2)', color: 'var(--fs-ink)' }}>
                <p className="fs-kicker">Un servicio en el local</p>
                <div className="mt-8 space-y-12">
                    {STEPS.map((step) => (
                        <article key={step.index}>
                            <img src={step.image} alt={step.alt} className="aspect-[4/3] w-full rounded-3xl object-cover" />
                            <p className="mt-4 font-mono text-xs text-[var(--fs-wine)]">{step.index}</p>
                            <h3 className="fs-display mt-1 text-3xl">{step.title}</h3>
                            <p className="mt-2 font-sans text-[var(--fs-muted)]">{step.body}</p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
