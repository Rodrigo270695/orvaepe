import { Link } from '@inertiajs/react';
import {
    FileSpreadsheet,
    Globe,
    LayoutTemplate,
    Lock,
    Mail,
    Megaphone,
    Server,
    Sparkles,
} from 'lucide-react';

import {
    ORVAE_CONTACT_EMAIL,
    ORVAE_SERVICIO_LANDING_SLUG,
    ORVAE_SERVICIO_SOFTWARE_MEDIDA_SLUG,
} from '@/marketing/orvaeContact';
import { cn } from '@/lib/utils';

const includedChips = [
    { icon: Globe, label: 'Dominio .com', tone: 'from-sky-500/90 to-cyan-600/85' },
    { icon: Server, label: 'Hosting', tone: 'from-violet-500/85 to-indigo-600/80' },
    { icon: Mail, label: 'Correo ilimitado', tone: 'from-amber-500/85 to-orange-600/80' },
    { icon: Lock, label: 'SSL (HTTPS)', tone: 'from-emerald-500/85 to-teal-600/80' },
] as const;

type FeaturedService = {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: typeof LayoutTemplate;
    mailSubject: string;
    borderAccent: string;
    cardGradient: string;
    iconBox: string;
    primaryBtnClass: string;
};

const featured: FeaturedService[] = [
    {
        id: 'software-medida',
        slug: ORVAE_SERVICIO_SOFTWARE_MEDIDA_SLUG,
        title: 'Desarrollo de software a medida',
        description:
            'Paneles de administración, roles y flujos a tu medida. Sitios web que puedes gestionar sin depender de un tercero en cada cambio.',
        icon: LayoutTemplate,
        mailSubject: 'Cotización: desarrollo a medida',
        borderAccent: 'color-mix(in oklab, var(--state-info) 38%, var(--border))',
        cardGradient: `linear-gradient(135deg,
            color-mix(in oklab, var(--state-info) 14%, var(--card)) 0%,
            color-mix(in oklab, var(--o-amber) 8%, var(--card)) 48%,
            color-mix(in oklab, var(--card) 96%, transparent) 100%)`,
        iconBox:
            'from-[color-mix(in_oklab,var(--state-info)_88%,white)] to-[color-mix(in_oklab,var(--state-success)_75%,white)] dark:from-[color-mix(in_oklab,var(--state-info)_70%,transparent)] dark:to-[color-mix(in_oklab,var(--state-success)_55%,transparent)]',
        primaryBtnClass:
            'bg-gradient-to-r from-[color-mix(in_oklab,var(--state-info)_92%,#1e3a5f)] to-[color-mix(in_oklab,var(--state-success)_75%,#14532d)]',
    },
    {
        id: 'landing-informativa',
        slug: ORVAE_SERVICIO_LANDING_SLUG,
        title: 'Landing y página informativa',
        description:
            'Presencia web clara y rápida: mensaje, contacto y secciones esenciales. Sitio administrable para actualizar textos e imágenes cuando quieras.',
        icon: Megaphone,
        mailSubject: 'Cotización: landing / página informativa',
        borderAccent: 'color-mix(in oklab, var(--state-alert) 42%, var(--border))',
        cardGradient: `linear-gradient(135deg,
            color-mix(in oklab, var(--state-alert) 12%, var(--card)) 0%,
            color-mix(in oklab, var(--state-info) 8%, var(--card)) 50%,
            color-mix(in oklab, var(--card) 96%, transparent) 100%)`,
        iconBox:
            'from-[color-mix(in_oklab,var(--state-alert)_82%,white)] to-[color-mix(in_oklab,var(--o-amber)_78%,white)] dark:from-[color-mix(in_oklab,var(--state-alert)_58%,transparent)] dark:to-[color-mix(in_oklab,var(--o-amber)_48%,transparent)]',
        primaryBtnClass:
            'bg-gradient-to-r from-[color-mix(in_oklab,var(--state-alert)_88%,#713f12)] to-[color-mix(in_oklab,var(--state-info)_78%,#1e3a5f)]',
    },
];

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
                <div className="mb-10 max-w-3xl">
                    <p className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--state-info)_35%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_12%,transparent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[color-mix(in_oklab,var(--state-info)_90%,var(--foreground))]">
                        <Sparkles className="size-3.5 shrink-0" aria-hidden />
                        Servicios destacados
                    </p>
                    <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Dos formas de crecer{' '}
                        <span className="bg-gradient-to-r from-[color-mix(in_oklab,var(--state-info)_95%,var(--foreground))] via-[color-mix(in_oklab,var(--o-amber)_90%,var(--foreground))] to-[color-mix(in_oklab,var(--state-success)_85%,var(--foreground))] bg-clip-text text-transparent">
                            en la web
                        </span>
                    </h2>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
                        Software a medida o una landing informativa. Ambos incluyen{' '}
                        <strong className="font-semibold text-foreground">
                            dominio .com, hosting, correo ilimitado y SSL
                        </strong>{' '}
                        el primer año.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2 lg:gap-7">
                    {featured.map((item) => {
                        const Icon = item.icon;
                        const detailHref = `/servicios/${item.slug}`;
                        return (
                            <div
                                key={item.id}
                                className="relative flex flex-col overflow-hidden rounded-[1.35rem] border-2 shadow-[0_20px_48px_-20px_color-mix(in_oklab,var(--foreground)_12%,transparent)]"
                                style={{
                                    borderColor: item.borderAccent,
                                    background: item.cardGradient,
                                }}
                            >
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.1]"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234A80B8' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                    }}
                                    aria-hidden
                                />

                                <div className="relative flex flex-1 flex-col p-6 sm:p-7">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={cn(
                                                'flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                                                item.iconBox,
                                            )}
                                            aria-hidden
                                        >
                                            <Icon className="size-7" strokeWidth={1.75} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-display text-lg font-bold text-foreground md:text-xl">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Incluido el primer año
                                    </p>
                                    <ul className="mt-2 flex flex-wrap gap-1.5">
                                        {includedChips.map(({ icon: ChipIcon, label, tone }) => (
                                            <li
                                                key={`${item.id}-${label}`}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/80 px-2 py-1.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[color-mix(in_oklab,var(--card)_92%,transparent)]"
                                            >
                                                <span
                                                    className={cn(
                                                        'flex size-6 items-center justify-center rounded-md bg-gradient-to-br text-white shadow-sm',
                                                        tone,
                                                    )}
                                                >
                                                    <ChipIcon className="size-3" strokeWidth={2} aria-hidden />
                                                </span>
                                                {label}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                                        <Link
                                            href={detailHref}
                                            className={cn(
                                                'inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-center text-sm font-bold text-white shadow-md transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                                item.primaryBtnClass,
                                            )}
                                        >
                                            <FileSpreadsheet className="size-4 shrink-0 opacity-95" aria-hidden />
                                            Ver ficha
                                        </Link>
                                        <a
                                            href={`mailto:${ORVAE_CONTACT_EMAIL}?subject=${encodeURIComponent(item.mailSubject)}`}
                                            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background/90 px-4 py-2.5 text-center text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <Mail className="size-4 shrink-0 opacity-70" aria-hidden />
                                            Cotizar
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-center">
                    <Link
                        href="/servicios"
                        className={cn(
                            'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 px-6 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            'border-[color-mix(in_oklab,var(--o-amber)_45%,var(--border))] bg-[color-mix(in_oklab,var(--o-amber)_14%,var(--background))] text-foreground hover:bg-[color-mix(in_oklab,var(--o-amber)_22%,var(--background))]',
                        )}
                    >
                        Ver catálogo completo de servicios
                    </Link>
                </div>
            </div>
        </section>
    );
}
