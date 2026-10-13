import { Link } from '@inertiajs/react';
import { ArrowRight, KeyRound, Layers3, Rocket } from 'lucide-react';
import type { CSSProperties } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import HeroTechLogosCarousel from '@/components/marketing/HeroTechLogosCarousel';
import GeometricBackground from '@/components/welcome/GeometricBackground';

const pillars = [
    { icon: Layers3, label: 'Desarrollo de software', color: '#2563EB' },
    { icon: KeyRound, label: 'Venta de licencias', color: '#EA580C' },
    { icon: Rocket, label: 'SaaS propio', color: '#0D9488' },
] as const;

export default function HomeHero() {
    return (
        <section
            id="inicio"
            aria-labelledby="home-hero-title"
            className="relative flex min-w-0 flex-col justify-center overflow-hidden scroll-mt-28"
            style={{ minHeight: 'min(92vh, 56rem)' }}
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
                className="home-blob home-blob--pulse absolute -right-24 -top-16 size-[30rem] opacity-70"
                data-parallax="10"
                style={{ background: 'radial-gradient(circle, color-mix(in oklab, #ea580c 55%, transparent) 0%, transparent 70%)' }}
                aria-hidden
            />
            <div
                className="home-blob home-blob--pulse absolute -left-24 top-24 size-[22rem] opacity-60"
                data-parallax="-8"
                style={{ background: 'radial-gradient(circle, color-mix(in oklab, #0d9488 50%, transparent) 0%, transparent 70%)', animationDelay: '1.4s' }}
                aria-hidden
            />
            <div
                className="home-blob absolute bottom-8 left-1/3 size-[18rem] opacity-40"
                data-parallax="6"
                style={{ background: 'radial-gradient(circle, color-mix(in oklab, #2563eb 42%, transparent) 0%, transparent 70%)' }}
                aria-hidden
            />

            <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pt-14 lg:pb-20">
                <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--o-amber)_35%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--o-amber)] shadow-sm backdrop-blur-md">
                            <AppLogoIcon className="size-3.5 shrink-0 fill-[var(--o-amber)]" />
                            Casa de software · Perú
                        </p>

                        <h1
                            id="home-hero-title"
                            className="font-display mt-6 max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                        >
                            Desarrollamos software y vendemos licencias.
                            <span className="mt-2 block bg-gradient-to-br from-foreground via-[var(--o-amber)] to-[var(--o-tech)] bg-clip-text text-transparent dark:from-[var(--o-cream2)]">
                                Tú empiezas a operar.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
                            ORVAE construye sistemas, entrega licencias y opera SaaS propios:{' '}
                            <strong className="font-semibold text-foreground">VetSaaS</strong> para
                            clínicas veterinarias y{' '}
                            <strong className="font-semibold text-foreground">TallerSaaS</strong> para
                            talleres y car wash. También software a medida.
                        </p>

                        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Lo que hacemos">
                            {pillars.map(({ icon: Icon, label, color }) => (
                                <li
                                    key={label}
                                    className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-foreground"
                                    style={{
                                        borderColor: `color-mix(in oklab, ${color} 38%, var(--border))`,
                                        background: `color-mix(in oklab, ${color} 12%, var(--card))`,
                                    }}
                                >
                                    <Icon className="size-3.5" style={{ color }} aria-hidden />
                                    {label}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/software"
                                data-magnetic
                                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_6px_24px_-6px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-[box-shadow,filter] duration-200 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                Ver software
                                <ArrowRight className="size-4" aria-hidden />
                            </Link>
                            <Link
                                href="/licencias"
                                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-[color-mix(in_oklab,var(--foreground)_22%,var(--border))] bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_55%,var(--border))] hover:bg-[color-mix(in_oklab,var(--primary)_10%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                Ver licencias
                            </Link>
                            <Link
                                href="/contacto"
                                className="inline-flex min-h-12 cursor-pointer items-center justify-center px-2 text-sm font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Hablar con ventas
                            </Link>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                        <div className="relative aspect-[5/4] sm:aspect-[4/3]">
                            <Link
                                href="/software/VETSAAS"
                                className="home-hero-card home-hero-card--vet group absolute left-0 top-0 z-10 w-[78%] overflow-hidden rounded-2xl border border-white/20 shadow-[0_24px_60px_-24px_rgba(0,80,60,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                style={{ '--home-hero-tilt': '-4deg' } as CSSProperties}
                            >
                                <img
                                    src="/images/vetsaas-hero-pets.webp"
                                    alt="VetSaaS, software para clínicas veterinarias"
                                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    width={640}
                                    height={400}
                                    fetchPriority="high"
                                />
                                <span className="absolute bottom-3 left-3 rounded-md bg-[#015743] px-2.5 py-1 text-[11px] font-semibold text-white">
                                    VetSaaS · clínicas
                                </span>
                            </Link>
                            <Link
                                href="/software/TALLERSAAS"
                                className="home-hero-card home-hero-card--taller group absolute bottom-0 right-0 z-20 w-[78%] overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_60px_-24px_rgba(234,88,12,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                style={{ '--home-hero-tilt': '3deg' } as CSSProperties}
                            >
                                <img
                                    src="/images/tallersaas/hero.jpg"
                                    alt="TallerSaaS, software para talleres mecánicos y car wash"
                                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    width={640}
                                    height={400}
                                />
                                <span className="absolute bottom-3 left-3 rounded-md bg-[#ea580c] px-2.5 py-1 text-[11px] font-semibold text-white">
                                    TallerSaaS · talleres
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-6">
                    {[
                        ['2 SaaS', 'propios'],
                        ['Licencias', 'listas'],
                        ['A medida', 'en Perú'],
                    ].map(([k, v]) => (
                        <div key={k}>
                            <dt className="font-display text-base font-bold text-foreground sm:text-lg">{k}</dt>
                            <dd className="mt-0.5 text-xs text-muted-foreground">{v}</dd>
                        </div>
                    ))}
                </dl>

                <div className="mt-12 lg:mt-16">
                    <HeroTechLogosCarousel />
                </div>
            </div>

            <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 0%, var(--hero-line) 15%, var(--o-amber2) 50%, var(--hero-line) 85%, transparent 100%)',
                }}
                aria-hidden
            />
        </section>
    );
}
