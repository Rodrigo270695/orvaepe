import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { SHIFT_STEPS } from '../data';

gsap.registerPlugin(ScrollTrigger);

function PinnedShift() {
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
            const step = SHIFT_STEPS[i];
            if (indexRef.current) indexRef.current.textContent = step.index;
            if (titleRef.current) titleRef.current.textContent = step.title;
            if (bodyRef.current) bodyRef.current.textContent = step.body;
            if (photoRef.current && photoRef.current.getAttribute('src') !== step.image) {
                photoRef.current.src = step.image;
                photoRef.current.alt = step.alt;
                gsap.fromTo(photoRef.current, { opacity: 0.2 }, { opacity: 1, duration: 0.5, overwrite: true });
            }
            if (copyRef.current) {
                gsap.fromTo(copyRef.current, { y: 14, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.32, overwrite: true });
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
                    SHIFT_STEPS.slice(1).forEach((step) => {
                        new Image().src = step.image;
                    });
                },
                onUpdate: (self) => {
                    const next = Math.min(SHIFT_STEPS.length - 1, Math.floor(self.progress * SHIFT_STEPS.length));
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

    const first = SHIFT_STEPS[0];

    return (
        <section ref={rootRef} className="relative hidden bg-[#101826] text-[#f4efe6] md:block">
            <div className="mx-auto flex h-[100dvh] max-w-6xl items-center gap-16 px-8">
                <div ref={copyRef} className="w-[46%]">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#ea580c]">Un turno en el taller</p>
                    <p ref={indexRef} className="font-display mt-6 text-sm tabular-nums text-[#f97316]">
                        {first.index}
                    </p>
                    <h3 ref={titleRef} className="font-display mt-3 text-5xl font-extrabold leading-[0.95] xl:text-6xl">
                        {first.title}
                    </h3>
                    <p ref={bodyRef} className="font-body mt-5 max-w-md text-lg leading-snug text-[#cfc6b8]">
                        {first.body}
                    </p>
                    <div className="mt-10 h-px w-44 bg-white/15">
                        <span
                            ref={barRef}
                            className="block h-px w-full origin-left bg-[#ea580c]"
                            style={{ transform: 'scaleX(0.08)' }}
                        />
                    </div>
                </div>
                <div className="h-[70vh] w-[54%] overflow-hidden rounded-sm border border-white/10">
                    <img ref={photoRef} src={first.image} alt={first.alt} className="size-full object-cover" />
                </div>
            </div>
        </section>
    );
}

export default function ShiftScroll() {
    const reduce = useReducedMotion();

    if (reduce) {
        return (
            <section className="bg-[#101826] px-5 py-20 text-[#f4efe6] sm:px-8">
                <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
                    {SHIFT_STEPS.map((step) => (
                        <article key={step.index}>
                            <img src={step.image} alt={step.alt} className="aspect-[4/3] w-full object-cover" />
                            <p className="mt-4 font-mono text-xs text-[#ea580c]">{step.index}</p>
                            <h3 className="font-display mt-1 text-3xl font-extrabold">{step.title}</h3>
                            <p className="mt-2 text-[#cfc6b8]">{step.body}</p>
                        </article>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <>
            <PinnedShift />
            <section className="bg-[#101826] px-5 py-16 text-[#f4efe6] md:hidden">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#ea580c]">Un turno en el taller</p>
                <div className="mt-8 space-y-12">
                    {SHIFT_STEPS.map((step) => (
                        <article key={step.index}>
                            <img src={step.image} alt={step.alt} className="aspect-[4/3] w-full object-cover" />
                            <p className="mt-4 font-mono text-xs text-[#f97316]">{step.index}</p>
                            <h3 className="font-display mt-1 text-3xl font-extrabold">{step.title}</h3>
                            <p className="mt-2 text-[#cfc6b8]">{step.body}</p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
