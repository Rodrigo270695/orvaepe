import { Eye, Target } from 'lucide-react';

import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

const items = [
    {
        icon: Target,
        label: 'Misión',
        title: 'Software que se entrega',
        text: 'Desarrollar y entregar sistemas listos para operar, con documentación clara, trazabilidad y soporte real. Que cada cliente pueda escalar por módulos sin ataduras.',
        step: '01',
    },
    {
        icon: Eye,
        label: 'Visión',
        title: 'Referencia en software empresarial',
        text: 'Ser la opción confiable para empresas que buscan software desarrollado, implementación rápida y modelos flexibles: SaaS, licencia o módulos sueltos.',
        step: '02',
    },
];

const semanticCycle = [
    'var(--state-success)',
    'var(--state-info)',
    'var(--state-alert)',
    'var(--state-danger)',
] as const;

export default function MissionVision() {
    return (
        <section
            id="mision-vision"
            className="relative scroll-mt-28 overflow-hidden border-t border-border py-20 md:py-28"
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-50"
                style={{
                    background: `linear-gradient(135deg, color-mix(in oklab, var(--card) 88%, var(--o-amber) 12%) 0%, transparent 45%, color-mix(in oklab, var(--o-amber) 6%, transparent) 65%, transparent 100%)`,
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full opacity-30 blur-3xl dark:opacity-20"
                style={{
                    background: `radial-gradient(circle, color-mix(in oklab, var(--o-amber) 25%, transparent) 0%, transparent 70%)`,
                }}
                aria-hidden
            />
            <GeometricBackground variant="triangles" opacity={0.07} />
            <GeometricBackground variant="grid-dots" opacity={0.05} />

            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
                <LandingSectionHeader
                    className="mb-12 md:mb-16"
                    eyebrow="Nos define"
                    title="Misión y visión"
                    description="Lo que nos mueve y hacia dónde vamos."
                    layout="default"
                    descriptionClassName="max-w-xl"
                />

                <div className="relative grid gap-8 md:grid-cols-2 md:gap-10">
                    {/* Conector desktop */}
                    <div
                        className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/95 shadow-[0_0_0_8px_var(--background),0_8px_32px_var(--hero-shadow)] backdrop-blur-md md:flex"
                        aria-hidden
                    >
                        <span className="font-mono text-xs font-bold tabular-nums text-[var(--o-amber)]">
                            +
                        </span>
                    </div>

                    {items.map((item, index) => {
                        const Icon = item.icon;
                        const accent = semanticCycle[index % semanticCycle.length];
                        return (
                            <article
                                key={item.label}
                                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-8 shadow-sm ring-1 ring-border/30 backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:ring-[color-mix(in_oklab,var(--o-amber)_35%,var(--border))] hover:shadow-[0_24px_56px_-12px_var(--hero-glow-soft),0_0_0_1px_var(--hero-card-inset),0_0_40px_-8px_color-mix(in_oklab,var(--o-amber)_20%,transparent)] md:p-10"
                                style={{
                                    background: `linear-gradient(165deg, color-mix(in oklab, var(--card) 70%, var(--background)) 0%, var(--card) 60%)`,
                                }}
                            >
                                <div
                                    className="absolute -right-16 -top-16 h-40 w-40 rounded-full border opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                                    style={{ borderColor: accent }}
                                    aria-hidden
                                />
                                <div className="relative">
                                    <div className="flex items-center justify-between gap-4">
                                        <div
                                            className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background/80 shadow-sm transition-all duration-300 group-hover:scale-105"
                                            style={{ color: accent }}
                                        >
                                            <Icon className="size-7" strokeWidth={1.5} />
                                        </div>
                                        <span className="font-mono text-3xl font-bold tabular-nums text-[color-mix(in_oklab,var(--foreground)_12%,var(--border))] dark:text-[color-mix(in_oklab,var(--foreground)_15%,transparent)]">
                                            {item.step}
                                        </span>
                                    </div>
                                    <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: accent }}>
                                        {item.label}
                                    </p>
                                    <h3 className="mt-2 font-display text-xl font-bold text-foreground md:text-2xl">
                                        {item.title}
                                    </h3>
                                    <p className="mt-4 font-body leading-relaxed text-muted-foreground">
                                        {item.text}
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
