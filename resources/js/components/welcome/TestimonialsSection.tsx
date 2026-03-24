import { Quote } from 'lucide-react';

import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

const testimonials = [
    {
        quote: 'Implementamos en dos semanas. El equipo entendió nuestra operación y el software estaba listo para usar desde el día uno.',
        author: 'María G.',
        role: 'Directora de operaciones',
        company: 'Empresa sector retail',
    },
    {
        quote: 'Por fin una opción que no nos ata a módulos que no usamos. Escalamos por lo que necesitamos y el soporte responde.',
        author: 'Carlos R.',
        role: 'CTO',
        company: 'Startup logística',
    },
    {
        quote: 'Documentación clara, SLA con penalidades reales y un catálogo de software que sí se puede operar. Referencia en su sector.',
        author: 'Ana L.',
        role: 'Gerente de sistemas',
        company: 'Grupo industrial',
    },
];

const semanticCycle = [
    'var(--state-success)',
    'var(--state-info)',
    'var(--state-alert)',
    'var(--state-danger)',
] as const;

function initialsFromAuthor(name: string): string {
    const parts = name
        .replace(/\./g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length >= 2) {
        const a = parts[0]?.[0] ?? '';
        const b = parts[parts.length - 1]?.[0] ?? '';
        return `${a}${b}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function Stars({ className = '' }: { className?: string }) {
    return (
        <div
            className={`flex gap-0.5 text-[color-mix(in_oklab,var(--o-amber)_85%,var(--foreground))] ${className}`.trim()}
            aria-hidden
        >
            {'★★★★★'.split('').map((s, i) => (
                <span key={i} className="text-[13px] leading-none">
                    {s}
                </span>
            ))}
        </div>
    );
}

export default function TestimonialsSection() {
    return (
        <section
            id="comentarios"
            className="relative scroll-mt-28 border-t border-border bg-[color-mix(in_oklab,var(--landing-surface-1)_40%,transparent)] py-20 md:py-28 dark:bg-[color-mix(in_oklab,var(--landing-surface-1)_55%,transparent)]"
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                    background: `radial-gradient(ellipse 80% 50% at 50% 100%, color-mix(in oklab, var(--o-amber) 10%, transparent), transparent 55%)`,
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute left-1/4 top-24 h-64 w-64 rounded-full opacity-30 blur-3xl dark:opacity-25"
                style={{
                    background: `radial-gradient(circle, color-mix(in oklab, var(--o-tech) 30%, transparent), transparent 70%)`,
                }}
                aria-hidden
            />
            <GeometricBackground variant="rings" opacity={0.06} />
            <GeometricBackground variant="circles-blur" opacity={0.08} />

            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
                <LandingSectionHeader
                    className="mb-12 md:mb-16"
                    eyebrow="Comentarios"
                    title="Lo que dicen de nosotros"
                    description="Experiencias de clientes con nuestro software y servicios."
                    layout="default"
                    descriptionClassName="max-w-xl"
                />

                <div className="grid gap-6 md:grid-cols-3 md:gap-8">
                    {testimonials.map((t, idx) => {
                        const accent = semanticCycle[idx % semanticCycle.length];
                        return (
                        <blockquote
                            key={t.author}
                            className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm ring-1 ring-border/35 backdrop-blur-md transition-all duration-300 hover:shadow-[0_24px_56px_-12px_var(--hero-glow-soft),0_0_0_1px_var(--hero-card-inset)] md:p-8 ${
                                idx === 1
                                    ? 'md:-translate-y-1 md:shadow-[0_28px_60px_-16px_var(--hero-glow-soft)]'
                                    : ''
                            }`}
                            style={{ borderColor: `color-mix(in oklab, ${accent} 24%, var(--border))` }}
                        >
                            <div
                                className="absolute -right-12 -top-12 h-32 w-32 rounded-full border opacity-0 transition-opacity duration-300 group-hover:opacity-15"
                                style={{ borderColor: accent }}
                                aria-hidden
                            />
                            <div className="absolute left-6 top-6 transition-colors" style={{ color: `color-mix(in oklab, ${accent} 34%, transparent)` }}>
                                <Quote className="size-10" strokeWidth={1} fill="currentColor" />
                            </div>

                            <div className="relative mt-8 flex gap-4 md:mt-10">
                                <div
                                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-bold text-foreground shadow-inner ring-2"
                                    style={{
                                        background: `linear-gradient(135deg, color-mix(in oklab, ${accent} 35%, var(--card)), color-mix(in oklab, ${accent} 18%, var(--card)))`,
                                        boxShadow: `inset 0 1px 0 color-mix(in oklab, ${accent} 25%, transparent)`,
                                        borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`,
                                    }}
                                    aria-hidden
                                >
                                    {initialsFromAuthor(t.author)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Stars className="justify-start pb-2" />
                                    <p
                                        className={`font-body leading-relaxed text-foreground ${
                                            idx === 0 ? 'text-[17px]' : 'text-[15px]'
                                        }`}
                                    >
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                </div>
                            </div>

                            <footer className="mt-6 border-t border-border/80 pt-4 text-left">
                                <p className="font-display font-semibold text-foreground">{t.author}</p>
                                <p className="text-sm text-muted-foreground">{t.role}</p>
                                <p className="text-xs text-muted-foreground/80">{t.company}</p>
                            </footer>
                        </blockquote>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
