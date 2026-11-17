import { ArrowRight } from 'lucide-react';

import { COURSES, DEMO } from '../data';

type Props = {
    demoUrl: string;
    demoUser: string;
    demoPassword: string;
};

export default function HeroSection({ demoUrl, demoUser, demoPassword }: Props) {
    return (
        <section className="relative overflow-hidden px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:pb-24">
            <div
                className="pointer-events-none absolute -right-24 top-10 size-[28rem] rounded-full opacity-70"
                style={{ background: 'radial-gradient(circle, #c4a574 0%, transparent 68%)' }}
                aria-hidden
            />
            <div className="relative mx-auto grid max-w-6xl items-end gap-12 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                    <p className="fs-kicker">Carta de servicio · Perú</p>
                    <h1 className="fs-display mt-5 max-w-xl text-5xl text-[var(--fs-wine-deep)] sm:text-6xl lg:text-7xl">
                        De la mesa al comprobante.
                    </h1>
                    <p className="mt-6 max-w-lg font-sans text-lg leading-relaxed text-[var(--fs-muted)]">
                        FoodSaaS es la casa del restaurante: salón, cocina, caja y SUNAT en el subdominio de tu local.
                        Tú abres el turno. El sistema lleva la comanda.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href="#planes" className="fs-btn">
                            Ver la carta de planes
                            <ArrowRight className="size-4" aria-hidden />
                        </a>
                        <a href={demoUrl} className="fs-btn-ghost" target="_blank" rel="noopener noreferrer">
                            Abrir la demo
                        </a>
                    </div>
                    <p className="mt-6 font-sans text-sm text-[var(--fs-muted)]">
                        Demo: <span className="text-[var(--fs-ink)]">{demoUser}</span>
                        <span className="mx-2 text-[var(--fs-rule)]">/</span>
                        <span className="text-[var(--fs-ink)]">{demoPassword || DEMO.password}</span>
                    </p>
                </div>

                <aside className="fs-ticket relative px-8 py-8 sm:px-10" aria-label="Recorrido del servicio">
                    <p className="fs-kicker">Comanda</p>
                    <p className="fs-display mt-3 text-4xl text-[var(--fs-wine)]">Mesa 12</p>
                    <p className="mt-1 font-sans text-sm text-[var(--fs-muted)]">4 comensales · un solo piso</p>
                    <div className="fs-rule my-6" />
                    <ol className="space-y-4">
                        {COURSES.map((course) => (
                            <li key={course.index} className="grid grid-cols-[auto_1fr] gap-4">
                                <span className="font-mono text-xs tracking-widest text-[var(--fs-rule)]">{course.index}</span>
                                <span>
                                    <span className="block font-sans text-base font-semibold text-[var(--fs-ink)]">{course.name}</span>
                                    <span className="mt-0.5 block font-sans text-sm leading-relaxed text-[var(--fs-muted)]">
                                        {course.detail}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ol>
                </aside>
            </div>
        </section>
    );
}
