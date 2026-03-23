import { Link } from '@inertiajs/react';
import AppearanceDarkLightToggle from '@/components/appearance-dark-light-toggle';
import type { AuthLayoutProps } from '@/types';

export default function AuthOrvaeLoginLayout({
    children,
    title,
    description,
    maxWidthClass,
}: AuthLayoutProps) {
    return (
        <div
            className="min-h-dvh w-full"
            style={{
                background: `
                    linear-gradient(
                        165deg,
                        color-mix(in oklab, var(--background) 92%, var(--primary) 2%) 0%,
                        color-mix(in oklab, var(--background) 86%, var(--primary) 6%) 25%,
                        color-mix(in oklab, var(--background) 78%, var(--primary) 12%) 50%,
                        color-mix(in oklab, var(--background) 86%, var(--primary) 6%) 75%,
                        var(--background) 100%
                    ),
                    radial-gradient(
                        ellipse 100% 80% at 0% 20%,
                        color-mix(in oklab, var(--primary) 28%, transparent) 0%,
                        transparent 50%
                    ),
                    radial-gradient(
                        ellipse 80% 100% at 100% 80%,
                        color-mix(in oklab, var(--primary) 18%, transparent) 0%,
                        transparent 50%
                    )
                `,
            }}
        >
            <div className="grid min-h-dvh lg:grid-cols-2">
                {/* Left: branding */}
                <div
                    className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex"
                >
                <Link
                    href="/"
                    className="flex items-center gap-3 font-[family-name:var(--font-display)] font-semibold text-[var(--o-amber)]"
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

                <div className="space-y-4">
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
                </div>

                <div className="flex flex-wrap gap-2">
                    {['Enterprise', 'Perú & LATAM', '99.9% uptime'].map(
                        (tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-[var(--o-border)] px-4 py-1.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--o-warm)]"
                            >
                                {tag}
                            </span>
                        )
                    )}
                </div>
            </div>

                {/* Right: contenido sobre el mismo degradado de fondo */}
                <div className="relative flex w-full flex-col items-center justify-center p-6 sm:p-10">
                <Link
                    href="/"
                    className="mb-6 flex items-center justify-center gap-2 lg:hidden"
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

                {/* Toggle de tema arriba a la derecha */}
                <div className="pointer-events-auto absolute right-4 top-4 z-20">
                    <AppearanceDarkLightToggle />
                </div>

                {/* Card tipo glassmorphism */}
                <div
                    className={`mx-auto w-full ${maxWidthClass ?? 'max-w-[400px]'} rounded-2xl border border-[var(--border)] p-8 shadow-xl backdrop-blur-xl`}
                    style={{
                        backgroundColor: 'color-mix(in oklab, var(--card) 90%, transparent)',
                    }}
                >
                    {children}
                </div>
                </div>
            </div>
        </div>
    );
}
