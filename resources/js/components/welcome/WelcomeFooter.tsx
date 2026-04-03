import { Link } from '@inertiajs/react';
import { ArrowUpRight, LayoutGrid, Mail, MessageCircle } from 'lucide-react';

import { whatsAppHref } from '@/lib/whatsapp';
import {
    ORVAE_CONTACT_EMAIL,
    ORVAE_LEGAL_NAME,
    ORVAE_RUC,
    orvaeSocialLinks,
    simpleIconUrl,
} from '@/marketing/orvaeContact';

const footerNav = [
    { href: '/software', label: 'Software' },
    { href: '/licencias', label: 'Precios' },
    { href: '/servicios', label: 'Servicios' },
    { href: '#contacto', label: 'Contacto', isAnchor: true },
    { href: '/', label: 'Inicio' },
] as const;

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
                className="pointer-events-none absolute inset-0 opacity-[0.32] dark:opacity-[0.45]"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 50% at 0% 100%, color-mix(in oklab, var(--state-info) 14%, transparent), transparent 55%),
                        radial-gradient(ellipse 70% 45% at 100% 0%, color-mix(in oklab, var(--o-amber) 12%, transparent), transparent 50%)
                    `,
                }}
                aria-hidden
            />

            <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
                    {/* Marca */}
                    <div className="lg:col-span-4">
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
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            Software, licencias y servicios para que operes con respaldo técnico y transparencia.
                        </p>
                        <Link
                            href="/servicios"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[color-mix(in_oklab,var(--state-info)_88%,#1e3a5f)] to-[color-mix(in_oklab,var(--state-success)_72%,#14532d)] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--state-info)_45%,transparent)] focus-visible:ring-offset-2"
                        >
                            <LayoutGrid className="size-4 shrink-0 opacity-95" aria-hidden />
                            Ver servicios
                            <ArrowUpRight className="size-4 shrink-0 opacity-90" aria-hidden />
                        </Link>
                    </div>

                    {/* Enlaces */}
                    <div className="lg:col-span-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Navegación
                        </p>
                        <nav
                            className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 sm:max-w-sm"
                            aria-label="Pie de página"
                        >
                            {footerNav.map((item) =>
                                item.isAnchor ? (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className="rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] hover:text-[var(--o-amber)] dark:hover:text-[var(--o-tech2)]"
                                    >
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] hover:text-[var(--o-amber)] dark:hover:text-[var(--o-tech2)]"
                                    >
                                        {item.label}
                                    </Link>
                                ),
                            )}
                            <a
                                href={whatsAppHref()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="col-span-2 mt-1 inline-flex items-center gap-2 rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[color-mix(in_oklab,var(--state-success)_85%,var(--foreground))]"
                            >
                                <MessageCircle className="size-4 shrink-0" aria-hidden />
                                WhatsApp
                            </a>
                        </nav>
                    </div>

                    {/* Contacto */}
                    <div className="lg:col-span-4">
                        <div
                            className="rounded-2xl border-2 p-5 shadow-sm"
                            style={{
                                borderColor: 'color-mix(in oklab, var(--state-info) 32%, var(--border))',
                                background: `linear-gradient(145deg,
                                    color-mix(in oklab, var(--state-info) 10%, var(--card)) 0%,
                                    color-mix(in oklab, var(--card) 94%, transparent) 100%)`,
                            }}
                        >
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--state-info)_75%,var(--muted-foreground))]">
                                Contacto
                            </p>
                            <a
                                href={`mailto:${ORVAE_CONTACT_EMAIL}`}
                                className="mt-3 inline-flex items-start gap-2 text-base font-semibold text-foreground transition-colors hover:text-[color-mix(in_oklab,var(--state-info)_80%,var(--foreground))]"
                            >
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--state-info)_18%,transparent)]">
                                    <Mail className="size-4 text-[color-mix(in_oklab,var(--state-info)_90%,var(--foreground))]" aria-hidden />
                                </span>
                                <span className="break-all leading-snug">{ORVAE_CONTACT_EMAIL}</span>
                            </a>
                            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Redes sociales
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {orvaeSocialLinks.map((s) => (
                                    <a
                                        key={s.id}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={s.label}
                                        className="flex size-11 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--foreground)_8%,var(--border))] bg-background/90 shadow-sm transition hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--o-amber)_40%,var(--border))] hover:shadow-md"
                                    >
                                        <img
                                            src={simpleIconUrl(s.iconKey, s.iconColor)}
                                            alt={s.label}
                                            className="size-5"
                                            loading="lazy"
                                        />
                                    </a>
                                ))}
                            </div>
                            <Link
                                href="/redesorvae"
                                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[color-mix(in_oklab,var(--state-info)_85%,var(--foreground))] underline-offset-4 hover:underline"
                            >
                                Página de redes ORVAE
                                <ArrowUpRight className="size-3.5" aria-hidden />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-border/50 pt-8">
                    <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <div>
                            <span>© {new Date().getFullYear()} Orvae. Todos los derechos reservados.</span>
                            <p className="mt-1 text-xs text-muted-foreground/85">
                                {ORVAE_LEGAL_NAME} · RUC {ORVAE_RUC}
                            </p>
                        </div>
                        <span className="text-muted-foreground/90">
                            SLA · Uptime · Changelog en{' '}
                            <a
                                href="https://status.orvae.com"
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium transition-colors hover:text-[var(--o-amber)] hover:underline dark:hover:text-[var(--o-tech2)]"
                            >
                                status.orvae.com
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
