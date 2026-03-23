import { Eye, Target } from 'lucide-react';

import GeometricBackground from '@/components/welcome/GeometricBackground';

const items = [
    {
        icon: Target,
        label: 'Misión',
        title: 'Software que se entrega',
        text: 'Desarrollar y entregar sistemas listos para operar, con documentación clara, trazabilidad y soporte real. Que cada cliente pueda escalar por módulos sin ataduras.',
    },
    {
        icon: Eye,
        label: 'Visión',
        title: 'Referencia en software empresarial',
        text: 'Ser la opción confiable para empresas que buscan software desarrollado, implementación rápida y modelos flexibles: SaaS, licencia o módulos sueltos.',
    },
];

export default function MissionVision() {
    return (
        <section
            id="mision-vision"
            className="relative scroll-mt-28 overflow-hidden border-t border-border py-20 md:py-28"
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                    background: `linear-gradient(135deg, var(--o-cream) 0%, transparent 40%, color-mix(in oklab, var(--o-amber) 5%, transparent) 60%, transparent 100%)`,
                }}
                aria-hidden
            />
            <GeometricBackground variant="triangles" opacity={0.07} />
            <GeometricBackground variant="grid-dots" opacity={0.05} />

            <div className="relative mx-auto w-full max-w-6xl px-4">
                <header className="mb-12 text-center md:mb-16">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.4em] text-[var(--o-amber)]">
                        Nos define
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Misión y visión
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl font-body text-muted-foreground">
                        Lo que nos mueve y hacia dónde vamos.
                    </p>
                </header>

                <div className="grid gap-8 md:grid-cols-2">
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <article
                                key={item.label}
                                className="group relative overflow-hidden rounded-2xl border border-[var(--o-border2)] bg-card/95 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-[0_20px_50px_var(--hero-glow-soft),0_0_0_1px_var(--hero-card-inset)] md:p-10"
                                style={{
                                    background: `linear-gradient(165deg, color-mix(in oklab, var(--o-cream) 25%, var(--background)) 0%, var(--card) 55%)`,
                                }}
                            >
                                {/* Forma geométrica de fondo en la tarjeta */}
                                <div
                                    className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-[var(--o-amber)] opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                                    aria-hidden
                                />
                                <div className="relative">
                                    <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background/80 text-[var(--o-amber)] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--o-amber)]/50 group-hover:bg-[var(--o-amber)]/10">
                                        <Icon className="size-7" strokeWidth={1.5} />
                                    </div>
                                    <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.35em] text-[var(--o-amber)]">
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
