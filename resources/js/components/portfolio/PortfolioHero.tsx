import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';

import GeometricBackground from '@/components/welcome/GeometricBackground';
import type { FeaturedSaasCard } from '@/components/portfolio/featuredPortfolio';

type Props = {
    systemCount: number;
    categoryCount: number;
    clientCount: number;
    featured: FeaturedSaasCard[];
};

export default function PortfolioHero({
    systemCount,
    categoryCount,
    clientCount,
    featured,
}: Props) {
    const stats = [
        { label: 'Sistemas', value: systemCount, color: '#2563eb' },
        { label: 'Rubros', value: categoryCount, color: '#0d9488' },
        { label: 'Empresas', value: clientCount, color: '#ea580c' },
    ];

    return (
        <section
            id="inicio"
            aria-labelledby="portfolio-hero-title"
            className="relative overflow-hidden scroll-mt-28 pb-16 pt-10 md:pb-20 md:pt-14"
        >
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(165deg, var(--background) 0%, color-mix(in oklab, var(--o-amber) 7%, var(--background)) 42%, var(--background) 100%)',
                }}
                aria-hidden
            />
            <GeometricBackground variant="floating-shapes" opacity={0.08} />
            <div
                className="home-blob home-blob--pulse absolute -right-24 -top-10 size-[28rem] opacity-70"
                data-parallax="10"
                style={{ background: 'radial-gradient(circle, color-mix(in oklab, #ea580c 55%, transparent) 0%, transparent 70%)' }}
                aria-hidden
            />
            <div
                className="home-blob home-blob--pulse absolute -left-20 top-28 size-[20rem] opacity-60"
                data-parallax="-8"
                style={{
                    background: 'radial-gradient(circle, color-mix(in oklab, #0d9488 50%, transparent) 0%, transparent 70%)',
                    animationDelay: '1.4s',
                }}
                aria-hidden
            />

            <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
                    <div>
                        <p className="inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--o-amber)_35%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--o-amber)] shadow-sm backdrop-blur-md">
                            Portafolio · Perú
                        </p>
                        <h1
                            id="portfolio-hero-title"
                            className="font-display mt-5 max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
                        >
                            Sistemas que ya operan.
                            <span className="mt-2 block bg-gradient-to-br from-foreground via-[var(--o-amber)] to-[var(--o-tech)] bg-clip-text text-transparent dark:from-[var(--o-cream2)]">
                                Entra y mira el trabajo.
                            </span>
                        </h1>
                        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
                            <strong className="font-semibold text-foreground">VetSaaS</strong> para
                            clínicas, <strong className="font-semibold text-foreground">TallerSaaS</strong>{' '}
                            para talleres, y el resto del catálogo ORVAE. Un clic abre la ficha o la
                            plataforma en vivo.
                        </p>

                        <dl className="mt-7 grid max-w-md grid-cols-3 gap-2.5">
                            {stats.map((stat) => (
                                <div key={stat.label} className="home-glass rounded-2xl px-3 py-3.5 text-center">
                                    <dt className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        {stat.label}
                                    </dt>
                                    <dd
                                        className="mt-1 font-display text-2xl font-bold tabular-nums md:text-3xl"
                                        style={{ color: stat.color }}
                                    >
                                        {stat.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <a
                                href="#sistemas"
                                className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-[#ea580c] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_22px_-12px_#ea580c] transition hover:bg-[#c2410c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Ver sistemas
                                <ArrowRight className="size-4" aria-hidden />
                            </a>
                            <a
                                href="#clientes"
                                className="inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-border bg-background/80 px-6 py-3.5 text-sm font-semibold text-foreground transition hover:border-[color-mix(in_oklab,var(--o-amber)_40%,var(--border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Ver empresas
                            </a>
                            <Link
                                href="/contacto"
                                className="inline-flex min-h-12 cursor-pointer items-center px-2 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Pedir demo
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        {featured.map((item, index) => (
                            <Link
                                key={item.slug}
                                href={item.href}
                                className={[
                                    'group relative overflow-hidden rounded-3xl border border-white/15 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    index === 0 ? 'home-hero-card--vet' : 'home-hero-card--taller',
                                ].join(' ')}
                                style={{ '--home-hero-tilt': index === 0 ? '-1.5deg' : '1.8deg' } as CSSProperties}
                            >
                                <img
                                    src={item.image}
                                    alt={`${item.name}, ${item.hint}`}
                                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] sm:aspect-[4/3] lg:aspect-[16/9]"
                                    width={720}
                                    height={405}
                                />
                                <span
                                    className="absolute bottom-3 left-3 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
                                    style={{ background: item.accent }}
                                >
                                    {item.name} · {item.hint}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
