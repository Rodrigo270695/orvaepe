import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';

import VetSaaSReveal from '@/components/software/VetSaaSReveal';

import { NOVELTIES } from '../data';

function Timeline() {
    const ref = useRef<HTMLOListElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
    const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

    return (
        <ol ref={ref} className="relative space-y-10 pl-10">
            <span className="absolute bottom-2 left-[0.6875rem] top-2 w-px bg-[var(--vs-border)] opacity-60" aria-hidden />
            <motion.span
                className="absolute bottom-2 left-[0.6875rem] top-2 w-px origin-top bg-[var(--vs-accent-strong)]"
                style={{ scaleY: reduce ? 1 : scaleY }}
                aria-hidden
            />
            {NOVELTIES.map((item, index) => (
                <motion.li
                    key={item.title}
                    className="relative"
                    initial={reduce ? false : { opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="vs-timeline-dot absolute -left-10 top-1 grid size-6 place-items-center rounded-full" aria-hidden>
                        <span className="size-2 rounded-full bg-[var(--vs-accent-strong)]" />
                    </span>
                    <span className="vs-timeline-tag">{item.tag}</span>
                    <h3 className="font-display mt-2 text-xl font-semibold vs-text-ink sm:text-2xl">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed vs-text-muted sm:text-base">{item.body}</p>
                </motion.li>
            ))}
        </ol>
    );
}

function AlmaPetCard() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-[#015743] bg-[#006D55] p-7 text-white shadow-[0_30px_60px_-30px_rgba(0,109,85,0.8)] sm:p-9">
            <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                }}
                aria-hidden
            />
            <div className="relative">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#CDEDE0]">Integración</p>
                <h3 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight">
                    Identidad digital para mascotas
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#E3F3EC] sm:text-base">
                    AlmaPet ID complementa VetSaaS: perfil público, búsqueda por microchip y certificados emitidos por la clínica.
                </p>
                <a
                    href="https://almapetid.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white bg-white px-5 py-3 text-sm font-semibold text-[#006D55] transition-all hover:-translate-y-0.5 hover:bg-[#E7F6EF] active:translate-y-px"
                >
                    Conocer AlmaPet ID
                    <span aria-hidden>→</span>
                </a>
            </div>
        </div>
    );
}

export default function NoveltiesSection() {
    return (
        <section className="vs-bg-surface py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                    <VetSaaSReveal>
                        <h2 className="font-display text-3xl font-semibold tracking-tight vs-text-ink sm:text-5xl">
                            Lo que está llegando
                        </h2>
                        <p className="mt-3 max-w-md text-base vs-text-muted">
                            VetSaaS se actualiza solo. Las mejoras llegan a tu subdominio sin instalar nada.
                        </p>
                    </VetSaaSReveal>
                    <div className="mt-10">
                        <Timeline />
                    </div>
                </div>
                <VetSaaSReveal delay={0.15}>
                    <AlmaPetCard />
                </VetSaaSReveal>
            </div>
        </section>
    );
}
