import { Quote, Star } from 'lucide-react';

import HomeSection from '@/components/welcome/HomeSection';
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

function initialsFromAuthor(name: string): string {
    const parts = name.replace(/\./g, ' ').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export default function TestimonialsSection() {
    return (
        <HomeSection id="comentarios" alt aria-label="Comentarios de clientes">
            <LandingSectionHeader
                className="mb-12 md:mb-16"
                eyebrow="Confianza"
                title="Lo que dicen de nosotros"
                description="Experiencias de clientes con el software, las licencias y el soporte de ORVAE."
                layout="wide"
            />

            <div className="grid gap-5 md:grid-cols-3">
                {testimonials.map((t) => (
                    <blockquote key={t.author} className="home-glass relative flex flex-col rounded-3xl p-6 md:p-7">
                        <Quote className="size-8 text-[var(--o-amber)]" strokeWidth={1.25} aria-hidden />
                        <div className="mt-3 flex gap-0.5" aria-label="Cinco estrellas">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className="size-3.5 fill-[var(--o-amber)] text-[var(--o-amber)]"
                                    aria-hidden
                                />
                            ))}
                        </div>
                        <p className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground">
                            “{t.quote}”
                        </p>
                        <footer className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                            <span
                                className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--o-amber)_18%,var(--background))] font-display text-sm font-bold text-foreground"
                                aria-hidden
                            >
                                {initialsFromAuthor(t.author)}
                            </span>
                            <span>
                                <cite className="block font-display not-italic font-semibold text-foreground">
                                    {t.author}
                                </cite>
                                <span className="block text-xs text-muted-foreground">
                                    {t.role} · {t.company}
                                </span>
                            </span>
                        </footer>
                    </blockquote>
                ))}
            </div>
        </HomeSection>
    );
}
