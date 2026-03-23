import { Link } from '@inertiajs/react';

export default function WelcomeFooter() {
    return (
        <footer
            className={[
                'relative overflow-hidden border-t',
                'border-[color-mix(in_oklab,var(--o-tech)_45%,var(--border))]',
                'bg-[#1f2730] text-slate-100',
            ].join(' ')}
        >
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

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200/90">
                        <Link
                            href="/software"
                            className="transition-colors hover:text-[var(--o-tech)]"
                        >
                            Software
                        </Link>
                        <Link
                            href="/licencias"
                            className="transition-colors hover:text-[var(--o-tech)]"
                        >
                            Precios
                        </Link>
                        <Link
                            href="/servicios"
                            className="transition-colors hover:text-[var(--o-tech)]"
                        >
                            Servicios
                        </Link>
                        <a
                            href="#contacto"
                            className="transition-colors hover:text-[var(--o-tech)]"
                        >
                            Contacto
                        </a>
                        <Link
                            href="/"
                            className="transition-colors hover:text-[var(--o-tech)]"
                        >
                            Inicio
                        </Link>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-2 border-t border-slate-500/35 pt-6 text-sm text-slate-300/85 md:flex-row md:items-center md:justify-between">
                    <span>© {new Date().getFullYear()} Orvae. Todos los derechos reservados.</span>
                    <span className="text-slate-300/70">
                        SLA • Uptime • Changelog en {` `}
                        <a
                            href="https://status.orvae.com"
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-[var(--o-tech)] hover:underline"
                        >
                            status.orvae.com
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}

