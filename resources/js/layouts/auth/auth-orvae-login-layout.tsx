import { Link } from '@inertiajs/react';

import AppearanceDarkLightToggle from '@/components/appearance-dark-light-toggle';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import type { AuthLayoutProps } from '@/types';

import '@/components/welcome/home-orvae.css';

const authHighlights = [
    { label: 'Enterprise', accent: 'var(--state-info)' },
    { label: 'Perú & LATAM', accent: 'var(--state-success)' },
    { label: '99.9% uptime', accent: 'var(--state-alert)' },
] as const;

export default function AuthOrvaeLoginLayout({
    children,
    title,
    description,
    maxWidthClass,
}: AuthLayoutProps) {
    return (
        <div className="landing-page relative min-h-dvh w-full overflow-x-clip text-foreground">
            <div className="landing-grain absolute inset-0 z-0" aria-hidden />
            <div className="landing-ambient-orbs" aria-hidden>
                <div className="landing-orb landing-orb--a" />
                <div className="landing-orb landing-orb--b" />
            </div>

            <header className="relative z-30 flex items-center justify-between px-5 py-4 sm:px-8 lg:absolute lg:inset-x-0 lg:top-0 lg:px-10">
                <Link
                    href="/"
                    className="inline-flex shrink-0 items-center gap-3 font-display font-semibold text-(--o-amber)"
                >
                    <img
                        src="/logo/orvae-logo-h-transparent-light.webp"
                        alt="ORVAE"
                        className="h-9 w-auto dark:hidden"
                    />
                    <img
                        src="/logo/orvae-logo-h-transparent-dark.webp"
                        alt="ORVAE"
                        className="hidden h-9 w-auto dark:block"
                    />
                </Link>
                <AppearanceDarkLightToggle />
            </header>

            <div className="relative z-10 grid min-h-dvh lg:grid-cols-2 lg:pt-[4.5rem]">
                <div className="relative hidden overflow-hidden p-8 lg:flex lg:p-10 xl:p-12">
                    <GeometricBackground variant="floating-shapes" opacity={0.06} />
                    <div
                        className="home-blob home-blob--pulse absolute -left-20 top-24 size-[22rem] opacity-50"
                        style={{
                            background:
                                'radial-gradient(circle, color-mix(in oklab, #0d9488 48%, transparent) 0%, transparent 70%)',
                        }}
                        aria-hidden
                    />
                    <div
                        className="home-blob home-blob--pulse absolute -right-16 bottom-20 size-[26rem] opacity-45"
                        style={{
                            background:
                                'radial-gradient(circle, color-mix(in oklab, #2563eb 40%, transparent) 0%, transparent 70%)',
                            animationDelay: '1.2s',
                        }}
                        aria-hidden
                    />

                    <div className="relative flex w-full flex-col justify-between">
                        <div className="landing-section-flair mt-2 max-w-md" aria-hidden />

                        <div className="home-glass space-y-6 rounded-3xl p-7 lg:my-auto">
                            <div className="flex items-center">
                                <img
                                    src="/logo/orvae-logo-h-transparent-light.webp"
                                    alt="ORVAE"
                                    className="h-24 w-auto dark:hidden"
                                />
                                <img
                                    src="/logo/orvae-logo-h-transparent-dark.webp"
                                    alt="ORVAE"
                                    className="hidden h-24 w-auto dark:block"
                                />
                            </div>

                            <div className="space-y-3">
                                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color-mix(in_oklab,var(--state-info)_62%,var(--muted-foreground))]">
                                    Acceso seguro
                                </p>
                                <p className="max-w-sm font-body text-sm leading-relaxed text-(--muted-foreground)">
                                    {description ??
                                        'Accede de forma segura a tu plataforma ORVAE, con trazabilidad y soporte para tu operación.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pb-2">
                            {authHighlights.map((item) => (
                                <span
                                    key={item.label}
                                    className="rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest"
                                    style={{
                                        borderColor: `color-mix(in oklab, ${item.accent} 58%, var(--foreground))`,
                                        color: `color-mix(in oklab, ${item.accent} 45%, var(--foreground))`,
                                        background: `linear-gradient(135deg, color-mix(in oklab, ${item.accent} 18%, transparent), color-mix(in oklab, ${item.accent} 8%, transparent))`,
                                        boxShadow: `0 0 22px -12px color-mix(in oklab, ${item.accent} 78%, transparent)`,
                                    }}
                                >
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative flex w-full flex-col items-center justify-center px-5 pb-10 pt-[4.75rem] sm:px-8 sm:pb-12 lg:px-10 lg:pb-10 lg:pt-8">
                    <div
                        className={`relative mx-auto w-full ${maxWidthClass ?? 'max-w-[420px]'} overflow-hidden rounded-2xl border p-8 shadow-xl backdrop-blur-2xl`}
                        style={{
                            borderColor: 'color-mix(in oklab, var(--state-info) 24%, var(--border))',
                            background:
                                'linear-gradient(165deg, color-mix(in oklab, var(--card) 90%, transparent) 0%, color-mix(in oklab, var(--state-info) 5%, var(--card)) 52%, color-mix(in oklab, var(--state-success) 4%, var(--card)) 100%)',
                            boxShadow:
                                '0 30px 70px -36px color-mix(in oklab, var(--foreground) 32%, transparent), 0 0 0 1px color-mix(in oklab, var(--state-info) 12%, transparent) inset',
                        }}
                    >
                        <div
                            className="pointer-events-none absolute inset-x-0 top-0 h-px"
                            style={{
                                background:
                                    'linear-gradient(90deg, transparent, color-mix(in oklab, var(--state-info) 56%, transparent), color-mix(in oklab, var(--state-success) 52%, transparent), color-mix(in oklab, var(--state-alert) 50%, transparent), transparent)',
                            }}
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.06]"
                            style={{
                                backgroundImage:
                                    'radial-gradient(color-mix(in oklab, var(--foreground) 100%, transparent) 1px, transparent 1px)',
                                backgroundSize: '18px 18px',
                            }}
                            aria-hidden
                        />
                        <div className="relative">{children}</div>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-center gap-2 lg:hidden">
                        {authHighlights.map((item) => (
                            <span
                                key={item.label}
                                className="rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-widest"
                                style={{
                                    borderColor: `color-mix(in oklab, ${item.accent} 58%, var(--foreground))`,
                                    color: `color-mix(in oklab, ${item.accent} 45%, var(--foreground))`,
                                    background: `linear-gradient(135deg, color-mix(in oklab, ${item.accent} 18%, transparent), color-mix(in oklab, ${item.accent} 8%, transparent))`,
                                }}
                            >
                                {item.label}
                            </span>
                        ))}
                    </div>

                    <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[color-mix(in_oklab,var(--state-info)_50%,var(--muted-foreground))]">
                        {title ?? 'ORVAE ACCESS'}
                    </p>
                </div>
            </div>
        </div>
    );
}
