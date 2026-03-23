import { Quote } from 'lucide-react';

import GeometricBackground from '@/components/welcome/GeometricBackground';

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

export default function TestimonialsSection() {
    return (
        <section
            id="comentarios"
            className="relative scroll-mt-28 border-t border-border py-20 md:py-28"
        >
            <GeometricBackground variant="rings" opacity={0.06} />
            <GeometricBackground variant="circles-blur" opacity={0.08} />

            <div className="relative mx-auto w-full max-w-6xl px-4">
                <header className="mb-12 text-center md:mb-16">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.4em] text-[var(--o-amber)]">
                        Comentarios
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Lo que dicen de nosotros
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl font-body text-muted-foreground">
                        Experiencias de clientes con nuestro software y servicios.
                    </p>
                </header>

                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((t) => (
                        <blockquote
                            key={t.author}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[var(--o-amber)]/40 hover:shadow-[0_20px_50px_var(--hero-glow-soft),0_0_0_1px_var(--hero-card-inset)] md:p-8"
                        >
                            {/* Círculo decorativo de fondo */}
                            <div
                                className="absolute -right-12 -top-12 h-32 w-32 rounded-full border border-[var(--o-amber)] opacity-0 transition-opacity duration-300 group-hover:opacity-15"
                                aria-hidden
                            />
                            <div className="absolute left-6 top-6 text-[var(--o-amber)]/20 transition-colors group-hover:text-[var(--o-amber)]/50">
                                <Quote className="size-10" strokeWidth={1} fill="currentColor" />
                            </div>
                            <p className="relative mt-6 font-body leading-relaxed text-foreground">
                                "{t.quote}"
                            </p>
                            <footer className="mt-6 border-t border-border pt-4">
                                <p className="font-display font-semibold text-foreground">
                                    {t.author}
                                </p>
                                <p className="text-sm text-muted-foreground">{t.role}</p>
                                <p className="text-xs text-muted-foreground/80">{t.company}</p>
                            </footer>
                        </blockquote>
                    ))}
                </div>
            </div>
        </section>
    );
}
