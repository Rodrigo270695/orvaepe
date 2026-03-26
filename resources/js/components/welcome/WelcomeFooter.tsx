import { Link } from '@inertiajs/react';

import { whatsAppHref } from '@/lib/whatsapp';

export default function WelcomeFooter() {
    return (
        <footer
            className={[
                'relative overflow-hidden border-t',
                'border-border/70',
                'bg-[var(--landing-surface-1)]',
                'text-foreground',
            ].join(' ')}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.28] dark:opacity-[0.42]"
                style={{
                    background: `radial-gradient(ellipse 90% 55% at 50% 100%, color-mix(in oklab, var(--o-amber) 10%, transparent), transparent 58%)`,
                }}
                aria-hidden
            />
            <div className="relative mx-auto w-full max-w-6xl px-4 py-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center">
                        <img
                            src="/logo/orvae-logo-h-transparent-light.png"
                            alt="ORVAE"
                            className="h-14 w-auto dark:hidden"
                        />
                        <img
                            src="/logo/orvae-logo-h-transparent-dark.png"
                            alt="ORVAE"
                            className="hidden h-14 w-auto dark:block"
                        />
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <Link
                            href="/software"
                            className="transition-colors hover:text-[var(--o-amber)] dark:hover:text-[var(--o-tech2)]"
                        >
                            Software
                        </Link>
                        <Link
                            href="/licencias"
                            className="transition-colors hover:text-[var(--o-amber)] dark:hover:text-[var(--o-tech2)]"
                        >
                            Precios
                        </Link>
                        <Link
                            href="/servicios"
                            className="transition-colors hover:text-[var(--o-amber)] dark:hover:text-[var(--o-tech2)]"
                        >
                            Servicios
                        </Link>
                        <a
                            href="#contacto"
                            className="transition-colors hover:text-[var(--o-amber)] dark:hover:text-[var(--o-tech2)]"
                        >
                            Contacto
                        </a>
                        <Link
                            href="/"
                            className="transition-colors hover:text-[var(--o-amber)] dark:hover:text-[var(--o-tech2)]"
                        >
                            Inicio
                        </Link>
                        <a
                            href={whatsAppHref()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-[var(--o-amber)] dark:hover:text-[var(--o-tech2)]"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>

                <div className="mt-8 border-t border-border/50 pt-6">
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <span>© {new Date().getFullYear()} Orvae. Todos los derechos reservados.</span>
                        <span className="text-muted-foreground/90">
                            SLA • Uptime • Changelog en {` `}
                            <a
                                href="https://status.orvae.com"
                                target="_blank"
                                rel="noreferrer"
                                className="transition-colors hover:text-[var(--o-amber)] hover:underline dark:hover:text-[var(--o-tech2)]"
                            >
                                status.orvae.com
                            </a>
                        </span>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground/70">
                        Powered by{' '}
                        <span className="font-medium text-muted-foreground/90">
                            Cloud Byte SAC
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
