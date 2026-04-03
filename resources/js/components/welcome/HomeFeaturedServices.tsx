import { Link } from '@inertiajs/react';
import { Globe, LayoutTemplate, Lock, Mail, Server, Sparkles } from 'lucide-react';

import {
    ORVAE_CONTACT_EMAIL,
    ORVAE_SERVICIO_SOFTWARE_MEDIDA_SLUG,
} from '@/marketing/orvaeContact';
import { cn } from '@/lib/utils';

const serviceDetailHref = `/servicios/${ORVAE_SERVICIO_SOFTWARE_MEDIDA_SLUG}`;

const includedChips = [
    { icon: Globe, label: 'Dominio .com', tone: 'from-sky-500/90 to-cyan-600/85' },
    { icon: Server, label: 'Hosting', tone: 'from-violet-500/85 to-indigo-600/80' },
    { icon: Mail, label: 'Correo ilimitado', tone: 'from-amber-500/85 to-orange-600/80' },
    { icon: Lock, label: 'SSL (HTTPS)', tone: 'from-emerald-500/85 to-teal-600/80' },
] as const;

export default function HomeFeaturedServices() {
    return (
        <section
            id="servicios-destacados"
            className="relative scroll-mt-28 overflow-hidden border-b border-border/50 py-14 md:py-20"
        >
            <div
                className="pointer-events-none absolute inset-0 bg-[color-mix(in_oklab,var(--landing-surface-2)_75%,transparent)] dark:bg-[color-mix(in_oklab,var(--landing-surface-2)_70%,transparent)]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-24 top-1/2 h-[min(28rem,70vw)] w-[min(28rem,70vw)] -translate-y-1/2 rounded-full opacity-40 blur-3xl dark:opacity-25"
                style={{
                    background:
                        'radial-gradient(circle, color-mix(in oklab, var(--state-info) 55%, transparent) 0%, transparent 70%)',
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -right-20 bottom-0 h-[min(22rem,55vw)] w-[min(22rem,55vw)] rounded-full opacity-35 blur-3xl dark:opacity-20"
                style={{
                    background:
                        'radial-gradient(circle, color-mix(in oklab, var(--o-amber) 50%, transparent) 0%, transparent 72%)',
                }}
                aria-hidden
            />

            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <p className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--state-info)_35%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_12%,transparent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[color-mix(in_oklab,var(--state-info)_90%,var(--foreground))]">
                            <Sparkles className="size-3.5 shrink-0" aria-hidden />
                            Servicio destacado
                        </p>
                        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                            Software y sitios web{' '}
                            <span className="bg-gradient-to-r from-[color-mix(in_oklab,var(--state-info)_95%,var(--foreground))] via-[color-mix(in_oklab,var(--o-amber)_90%,var(--foreground))] to-[color-mix(in_oklab,var(--state-success)_85%,var(--foreground))] bg-clip-text text-transparent">
                                administrables
                            </span>
                        </h2>
                        <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
                            Un solo servicio de desarrollo a medida: aplicaciones web con panel de gestión y
                            páginas que tú puedes actualizar. Incluye{' '}
                            <strong className="font-semibold text-foreground">
                                dominio .com, hosting, correo corporativo ilimitado y SSL
                            </strong>{' '}
                            el primer año.
                        </p>
                    </div>
                </div>

                <div
                    className="relative overflow-hidden rounded-[1.35rem] border-2 shadow-[0_24px_64px_-24px_color-mix(in_oklab,var(--state-info)_28%,transparent)]"
                    style={{
                        borderColor: 'color-mix(in oklab, var(--state-info) 38%, var(--border))',
                        background: `linear-gradient(135deg,
                            color-mix(in oklab, var(--state-info) 14%, var(--card)) 0%,
                            color-mix(in oklab, var(--o-amber) 8%, var(--card)) 48%,
                            color-mix(in oklab, var(--card) 96%, transparent) 100%)`,
                    }}
                >
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234A80B8' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                        aria-hidden
                    />

                    <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
                        <div className="min-w-0">
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[color-mix(in_oklab,var(--state-info)_88%,white)] to-[color-mix(in_oklab,var(--state-success)_75%,white)] text-white shadow-lg shadow-[color-mix(in_oklab,var(--state-info)_25%,transparent)] dark:from-[color-mix(in_oklab,var(--state-info)_70%,transparent)] dark:to-[color-mix(in_oklab,var(--state-success)_55%,transparent)]"
                                    aria-hidden
                                >
                                    <LayoutTemplate className="size-7" strokeWidth={1.75} />
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">
                                        Desarrollo de software a medida
                                    </h3>
                                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                                        Paneles de administración, roles, flujos a tu medida y sitios web que
                                        puedes gestionar sin depender de un tercero en cada cambio.
                                    </p>
                                </div>
                            </div>

                            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Incluido el primer año
                            </p>
                            <ul className="mt-3 flex flex-wrap gap-2">
                                {includedChips.map(({ icon: Icon, label, tone }) => (
                                    <li
                                        key={label}
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/80 px-3 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[color-mix(in_oklab,var(--card)_92%,transparent)]',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
                                                tone,
                                            )}
                                        >
                                            <Icon className="size-4" strokeWidth={2} aria-hidden />
                                        </span>
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-[min(100%,20rem)] lg:flex-col">
                            <Link
                                href={serviceDetailHref}
                                className={cn(
                                    'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-center text-sm font-bold text-white shadow-md transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--state-info)_50%,transparent)] focus-visible:ring-offset-2',
                                    'bg-gradient-to-r from-[color-mix(in_oklab,var(--state-info)_92%,#1e3a5f)] to-[color-mix(in_oklab,var(--state-success)_75%,#14532d)]',
                                )}
                            >
                                Ver ficha del servicio
                            </Link>
                            <Link
                                href="/servicios"
                                className={cn(
                                    'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-center text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                    'border-[color-mix(in_oklab,var(--o-amber)_45%,var(--border))] bg-[color-mix(in_oklab,var(--o-amber)_14%,var(--background))] text-foreground hover:bg-[color-mix(in_oklab,var(--o-amber)_22%,var(--background))]',
                                )}
                            >
                                Catálogo de servicios
                            </Link>
                            <a
                                href={`mailto:${ORVAE_CONTACT_EMAIL}?subject=${encodeURIComponent('Cotización: desarrollo a medida')}`}
                                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background/90 px-5 py-3 text-center text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Mail className="size-4 shrink-0 opacity-70" aria-hidden />
                                Escribir a ventas
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
