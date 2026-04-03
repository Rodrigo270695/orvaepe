import { Link } from '@inertiajs/react';
import { LayoutDashboard, PanelsTopLeft } from 'lucide-react';

import {
    ORVAE_CONTACT_EMAIL,
    ORVAE_SERVICIO_SOFTWARE_MEDIDA_SLUG,
} from '@/marketing/orvaeContact';
import { cn } from '@/lib/utils';

const highlights = [
    {
        icon: LayoutDashboard,
        title: 'Software a medida',
        description:
            'Sistemas web administrables adaptados a tu operación: roles, flujos y reportes según tus reglas de negocio.',
    },
    {
        icon: PanelsTopLeft,
        title: 'Páginas web administrables',
        description:
            'Sitios con panel de gestión para que actualices contenido, secciones y avisos sin depender de un tercero cada vez.',
    },
] as const;

const serviceHref = `/servicios/${ORVAE_SERVICIO_SOFTWARE_MEDIDA_SLUG}`;

export default function HomeFeaturedServices() {
    return (
        <section
            id="servicios-destacados"
            className="relative scroll-mt-28 border-b border-border/60 bg-[color-mix(in_oklab,var(--landing-surface-2)_88%,transparent)] py-12 md:py-16 dark:bg-[color-mix(in_oklab,var(--landing-surface-2)_82%,transparent)]"
        >
            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="mb-8 max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Servicios destacados
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Software y sitios web administrables
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                        Desarrollo a medida con enfoque operativo. Incluye{' '}
                        <span className="font-medium text-foreground">
                            dominio .com, hosting, correo corporativo ilimitado y certificado SSL
                        </span>{' '}
                        durante el primer año, para que publiques con respaldo y transparencia.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {highlights.map(({ icon: Icon, title, description }) => (
                        <div
                            key={title}
                            className="flex flex-col rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm ring-1 ring-[color-mix(in_oklab,var(--foreground)_4%,transparent)] backdrop-blur-sm md:p-7"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background/80 text-[var(--state-info)]"
                                    aria-hidden
                                >
                                    <Icon className="size-6" strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-display text-lg font-bold text-foreground">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link
                                    href={serviceHref}
                                    className={cn(
                                        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold',
                                        'bg-primary text-primary-foreground shadow-sm',
                                        'transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    )}
                                >
                                    Ver servicio
                                </Link>
                                <a
                                    href={`mailto:${ORVAE_CONTACT_EMAIL}?subject=${encodeURIComponent(`Cotización: ${title}`)}`}
                                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background/80 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    Escribir a ventas
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
