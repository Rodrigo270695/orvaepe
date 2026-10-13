import { Link } from '@inertiajs/react';
import { ArrowRight, Globe, LayoutTemplate, Lock, Mail, Megaphone, Server } from 'lucide-react';

import {
    ORVAE_CONTACT_EMAIL,
    ORVAE_SERVICIO_LANDING_SLUG,
    ORVAE_SERVICIO_SOFTWARE_MEDIDA_SLUG,
} from '@/marketing/orvaeContact';
import HomeSection from '@/components/welcome/HomeSection';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

const included = [
    { icon: Globe, label: 'Dominio .com' },
    { icon: Server, label: 'Hosting' },
    { icon: Mail, label: 'Correo ilimitado' },
    { icon: Lock, label: 'SSL' },
] as const;

const featured = [
    {
        n: '01',
        slug: ORVAE_SERVICIO_SOFTWARE_MEDIDA_SLUG,
        title: 'Software a medida',
        description:
            'Paneles, roles y flujos de tu operación. Lo administras tú, sin depender de un tercero en cada cambio.',
        icon: LayoutTemplate,
        mailSubject: 'Cotización: desarrollo a medida',
        color: '#2563EB',
    },
    {
        n: '02',
        slug: ORVAE_SERVICIO_LANDING_SLUG,
        title: 'Landing e informativa',
        description:
            'Presencia web clara: mensaje, contacto y secciones. Textos e imágenes se actualizan cuando tú quieras.',
        icon: Megaphone,
        mailSubject: 'Cotización: landing / página informativa',
        color: '#EA580C',
    },
] as const;

export default function HomeFeaturedServices() {
    return (
        <HomeSection id="servicios-destacados" alt aria-label="Servicios de desarrollo">
            <LandingSectionHeader
                className="mb-12 md:mb-16"
                eyebrow="A medida"
                title="También lo construimos para ti."
                description="Software a medida o una landing. El primer año incluye dominio, hosting, correo y SSL."
                layout="wide"
                titleSize="hero"
            />

            <div className="grid gap-5 lg:grid-cols-2">
                {featured.map((item) => {
                    const Icon = item.icon;
                    return (
                        <article
                            key={item.n}
                            className="home-glass flex flex-col rounded-3xl p-6 sm:p-8"
                            style={{
                                borderTop: `3px solid ${item.color}`,
                                background: `linear-gradient(180deg, color-mix(in oklab, ${item.color} 12%, var(--card)) 0%, var(--card) 38%)`,
                            }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div
                                    className="flex size-12 items-center justify-center rounded-2xl border bg-background"
                                    style={{ color: item.color, borderColor: `color-mix(in oklab, ${item.color} 40%, var(--border))` }}
                                >
                                    <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                                </div>
                                <span className="font-mono text-sm font-bold tabular-nums" style={{ color: item.color }}>
                                    {item.n}
                                </span>
                            </div>
                            <h3 className="font-display mt-5 text-xl font-bold text-foreground">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

                            <ul className="mt-5 flex flex-wrap gap-2">
                                {included.map(({ icon: ChipIcon, label }) => (
                                    <li
                                        key={`${item.n}-${label}`}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground"
                                    >
                                        <ChipIcon className="size-3 text-[var(--o-amber)]" aria-hidden />
                                        {label}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex flex-wrap gap-2">
                                <Link
                                    href={`/servicios/${item.slug}`}
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    Ver ficha
                                    <ArrowRight className="size-4" aria-hidden />
                                </Link>
                                <a
                                    href={`mailto:${ORVAE_CONTACT_EMAIL}?subject=${encodeURIComponent(item.mailSubject)}`}
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    Cotizar
                                </a>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="mt-8 text-center">
                <Link
                    href="/servicios"
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--o-amber)_12%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    Ver todos los servicios
                </Link>
            </div>
        </HomeSection>
    );
}
