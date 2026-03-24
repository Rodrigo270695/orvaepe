import { Link } from '@inertiajs/react';

import AppearanceDarkLightToggle from '@/components/appearance-dark-light-toggle';
import type { AuthLayoutProps } from '@/types';

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
        <div
            className="relative min-h-dvh w-full overflow-hidden"
            style={{
                background: `
                    linear-gradient(
                        165deg,
                        color-mix(in oklab, var(--background) 94%, var(--state-info) 1%) 0%,
                        color-mix(in oklab, var(--background) 88%, var(--state-info) 4%) 26%,
                        color-mix(in oklab, var(--background) 82%, var(--state-success) 6%) 50%,
                        color-mix(in oklab, var(--background) 88%, var(--state-alert) 4%) 74%,
                        var(--background) 100%
                    ),
                    radial-gradient(
                        ellipse 95% 75% at 0% 20%,
                        color-mix(in oklab, var(--state-info) 22%, transparent) 0%,
                        transparent 56%
                    ),
                    radial-gradient(
                        ellipse 85% 95% at 100% 80%,
                        color-mix(in oklab, var(--state-success) 18%, transparent) 0%,
                        transparent 55%
                    )
                `,
            }}
        >
            <div className="landing-grain absolute inset-0 z-0" aria-hidden />
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
                <div className="absolute -left-24 top-20 h-72 w-72 rounded-full blur-3xl [background:radial-gradient(circle,color-mix(in_oklab,var(--state-info)_26%,transparent)_0%,transparent_68%)]" />
                <div className="absolute -right-28 bottom-24 h-80 w-80 rounded-full blur-3xl [background:radial-gradient(circle,color-mix(in_oklab,var(--state-success)_22%,transparent)_0%,transparent_70%)]" />
            </div>

            <div className="relative z-10 grid min-h-dvh lg:grid-cols-2">
                {/* Left: branding / narrativa visual */}
                <div className="relative hidden overflow-hidden p-10 lg:flex">
                    <div className="flex w-full flex-col justify-between">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 font-display font-semibold text-(--o-amber)"
                        >
                            <img
                                src="/logo/orvae-logo-h-transparent-light.png"
                                alt="ORVAE"
                                className="h-6 w-auto dark:hidden"
                            />
                            <img
                                src="/logo/orvae-logo-h-transparent-dark.png"
                                alt="ORVAE"
                                className="hidden h-6 w-auto dark:block"
                            />
                        </Link>

                        <div className="space-y-6 rounded-3xl border border-[color-mix(in_oklab,var(--border)_65%,transparent)] bg-[color-mix(in_oklab,var(--card)_55%,transparent)] p-7 shadow-[0_24px_64px_-32px_color-mix(in_oklab,var(--foreground)_24%,transparent)] backdrop-blur-xl">
                            <div className="flex items-center">
                                <img
                                    src="/logo/orvae-logo-h-transparent-light.png"
                                    alt="ORVAE"
                                    className="h-16 w-auto dark:hidden"
                                />
                                <img
                                    src="/logo/orvae-logo-h-transparent-dark.png"
                                    alt="ORVAE"
                                    className="hidden h-16 w-auto dark:block"
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

                        <div className="flex flex-wrap gap-2">
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

                {/* Right: contenido */}
                <div className="relative flex w-full flex-col items-center justify-center p-6 sm:p-10">
                    <Link href="/" className="mb-6 flex items-center justify-center gap-2 lg:hidden">
                        <img
                            src="/logo/orvae-logo-h-transparent-light.png"
                            alt="ORVAE"
                            className="h-6 w-auto dark:hidden"
                        />
                        <img
                            src="/logo/orvae-logo-h-transparent-dark.png"
                            alt="ORVAE"
                            className="hidden h-6 w-auto dark:block"
                        />
                    </Link>

                    <div className="pointer-events-auto absolute right-4 top-4 z-20">
                        <AppearanceDarkLightToggle />
                    </div>

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

                    <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[color-mix(in_oklab,var(--state-info)_50%,var(--muted-foreground))] lg:hidden">
                        {title ?? 'ORVAE ACCESS'}
                    </p>
                </div>
            </div>
        </div>
    );
}
