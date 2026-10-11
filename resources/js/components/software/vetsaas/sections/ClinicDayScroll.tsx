import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { DAY_STEPS } from '../data';

gsap.registerPlugin(ScrollTrigger);

function PinnedSteps() {
    const rootRef = useRef<HTMLElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);
    const indexRef = useRef<HTMLParagraphElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const bodyRef = useRef<HTMLParagraphElement>(null);
    const barRef = useRef<HTMLSpanElement>(null);
    const photoRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        let current = 0;
        const apply = (i: number) => {
            const step = DAY_STEPS[i];
            if (indexRef.current) indexRef.current.textContent = step.index;
            if (titleRef.current) titleRef.current.textContent = step.title;
            if (bodyRef.current) bodyRef.current.textContent = step.body;
            if (photoRef.current && photoRef.current.getAttribute('src') !== step.image) {
                photoRef.current.src = step.image;
                photoRef.current.alt = step.alt;
                gsap.fromTo(photoRef.current, { opacity: 0.15 }, { opacity: 1, duration: 0.55, overwrite: true });
            }
            if (copyRef.current) {
                gsap.fromTo(copyRef.current, { y: 16, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.35, overwrite: true });
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
                onUpdate: (self) => {
                    const next = Math.min(DAY_STEPS.length - 1, Math.floor(self.progress * DAY_STEPS.length));
                    if (next !== current) {
                        current = next;
                        apply(next);
                    }
                    if (barRef.current) {
                        barRef.current.style.transform = `scaleX(${Math.max(0.06, self.progress)})`;
                    }
                },
            });
            return () => trigger.kill();
        });

        return () => mm.revert();
    }, []);

    const first = DAY_STEPS[0];

    return (
        <section ref={rootRef} className="relative hidden bg-[#06241C] text-white md:block">
            <div className="mx-auto flex h-[100dvh] max-w-6xl items-center gap-16 px-8">
                <div ref={copyRef} className="w-[46%]">
                    <p ref={indexRef} className="font-mono text-sm tabular-nums text-[#7DCAA8]">
                        {first.index}
                    </p>
                    <h2 ref={titleRef} className="font-display mt-4 text-5xl font-semibold leading-[1.02] tracking-tight xl:text-6xl">
                        {first.title}
                    </h2>
                    <p ref={bodyRef} className="font-body mt-5 max-w-md text-lg leading-snug text-[#D5EBE2]">
                        {first.body}
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
                    <img ref={photoRef} src={first.image} alt={first.alt} className="size-full object-cover" />
                </div>
            </div>
        </section>
    );
}

function StackedSteps({ className }: { className: string }) {
    return (
        <section className={`bg-[#06241C] px-5 py-16 text-white ${className}`}>
            <ol className="space-y-10">
                {DAY_STEPS.map((step) => (
                    <li key={step.index}>
                        <img
                            src={step.image}
                            alt={step.alt}
                            className="mb-4 aspect-[4/3] w-full rounded-3xl border border-white/15 object-cover"
                        />
                        <p className="font-mono text-sm text-[#7DCAA8]">{step.index}</p>
                        <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">{step.title}</h2>
                        <p className="font-body mt-3 text-base leading-snug text-[#D5EBE2]">{step.body}</p>
                    </li>
                ))}
            </ol>
        </section>
    );
}

export default function ClinicDayScroll() {
    const reduce = useReducedMotion();

    if (reduce) {
        return <StackedSteps className="" />;
    }

    return (
        <>
            <PinnedSteps />
            <StackedSteps className="md:hidden" />
        </>
    );
}
