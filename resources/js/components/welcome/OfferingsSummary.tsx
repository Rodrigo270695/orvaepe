import { Link, usePage } from '@inertiajs/react';
import { Box, Key, Server } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';
import {
    marketingPreciosLinks,
    marketingServiciosSectionLinks,
} from '@/constants/marketingNavLinks';
import { cn } from '@/lib/utils';

const semanticCycle = [
    'var(--state-info)',
    'var(--state-success)',
    'var(--state-alert)',
] as const;

const defaultSoftwareLinks: { label: string; href: string }[] = [
    { label: 'Software desarrollado', href: '/software' },
    { label: 'Contabilidad', href: '/software#contabilidad' },
    { label: 'Ventas', href: '/software#ventas' },
    { label: 'Matrículas', href: '/software#matriculas' },
    { label: 'Contratos', href: '/software#contratos' },
    { label: 'Inventario', href: '/software#inventario' },
    { label: 'Reportes', href: '/software#reportes' },
    { label: 'Veterinaria', href: '/software#veterinaria' },
    { label: 'Transporte', href: '/software#transporte' },
    { label: 'Mensajería', href: '/software#mensajeria' },
];

type CardShellProps = {
    index: number;
    accent: string;
    colSpan: string;
    isFeatured?: boolean;
    Icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
};

function OfferingCardShell({
    index,
    accent,
    colSpan,
    isFeatured,
    Icon,
    title,
    description,
    children,
    footer,
}: CardShellProps) {
    return (
        <div
            className={cn(
                'landing-offer-shine group relative flex flex-col rounded-3xl border border-[color-mix(in_oklab,var(--foreground)_10%,var(--border))] bg-card/90 p-6 shadow-[0_1px_0_0_color-mix(in_oklab,var(--foreground)_6%,transparent),0_8px_24px_-12px_color-mix(in_oklab,var(--foreground)_8%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--foreground)_5%,transparent)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_-12px_var(--hero-glow-soft),0_0_0_1px_var(--hero-card-inset)] focus-within:ring-2 focus-within:ring-ring dark:border-border/80 dark:shadow-sm dark:ring-border/40 md:p-8',
                'border-l-[3px]',
                colSpan,
                isFeatured && 'lg:flex-row lg:items-start lg:gap-10 lg:p-10',
            )}
            style={{
                borderLeftColor: `color-mix(in oklab, ${accent} 55%, var(--border))`,
            }}
        >
            <span
                className="absolute right-5 top-5 font-mono text-[10px] font-bold tabular-nums text-muted-foreground/50 transition-colors"
                style={{ color: `color-mix(in oklab, ${accent} 70%, var(--muted-foreground))` }}
                aria-hidden
            >
                {String(index + 1).padStart(2, '0')}
            </span>
            <div className="absolute right-0 top-0 h-20 w-20 overflow-hidden rounded-tr-3xl" aria-hidden>
                <div
                    className="absolute -right-10 -top-10 h-20 w-20 rotate-45 border opacity-0 transition-opacity duration-300 group-hover:opacity-25"
                    style={{ borderColor: accent }}
                />
            </div>
            <div
                className="absolute left-0 right-0 top-0 h-[2px] rounded-t-3xl opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
                style={{
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                }}
            />
            <div className={cn('flex items-start gap-4', isFeatured && 'lg:items-center')}>
                <div
                    className={cn(
                        'flex shrink-0 items-center justify-center rounded-2xl border border-border bg-background/80 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_var(--hero-glow-soft)]',
                        isFeatured ? 'size-16 md:size-20' : 'size-12',
                    )}
                    style={{ color: accent }}
                >
                    <Icon
                        className={cn(isFeatured ? 'size-9 md:size-10' : 'size-6')}
                        strokeWidth={1.5}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <h3
                        className={cn(
                            'font-display font-bold text-foreground transition-colors',
                            isFeatured ? 'text-xl md:text-2xl' : 'text-lg',
                        )}
                    >
                        {title}
                    </h3>
                    <p
                        className={cn(
                            'mt-2 leading-relaxed text-muted-foreground',
                            isFeatured ? 'text-base md:max-w-2xl' : 'text-sm',
                        )}
                    >
                        {description}
                    </p>
                    {children}
                </div>
            </div>
            {footer}
        </div>
    );
}

export default function OfferingsSummary() {
    const { softwareNavLinks } = usePage().props as {
        softwareNavLinks?: { label: string; href: string }[];
    };

    const softwareLinks =
        softwareNavLinks && softwareNavLinks.length > 0 ? softwareNavLinks : defaultSoftwareLinks;

    return (
        <section
            id="que-ofrecemos"
            className="relative scroll-mt-28 border-t border-border bg-[color-mix(in_oklab,var(--landing-surface-2)_92%,transparent)] py-20 backdrop-blur-[2px] md:py-28 dark:bg-[color-mix(in_oklab,var(--landing-surface-2)_88%,transparent)]"
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30"
                style={{
                    background: `radial-gradient(ellipse 90% 60% at 50% -20%, color-mix(in oklab, var(--o-amber) 12%, transparent), transparent 55%)`,
                }}
                aria-hidden
            />
            <GeometricBackground variant="grid-hex" opacity={0.06} />
            <GeometricBackground variant="circles-blur" opacity={0.1} />

            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
                <LandingSectionHeader
                    className="mb-14 md:mb-20"
                    eyebrow="Resumen"
                    title="Todo lo que ofrecemos"
                    description="Software desarrollado, licencias flexibles y servicios de implementación. Elige lo que necesitas y escala por módulos."
                    layout="wide"
                    titleSize="hero"
                />

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
                    <OfferingCardShell
                        index={0}
                        accent={semanticCycle[0]}
                        colSpan="sm:col-span-2 lg:col-span-12"
                        isFeatured
                        Icon={Box}
                        title="Software desarrollado"
                        description="Sistemas ya construidos y listos para operar: contabilidad, ventas, inventario y más."
                        footer={
                            <Link
                                href="/software"
                                className={cn(
                                    'mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold transition-opacity duration-300',
                                    'max-md:min-h-11 max-md:rounded-xl max-md:border-2 max-md:border-solid max-md:bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] max-md:px-4 max-md:py-2.5 max-md:shadow-sm',
                                    'md:inline-flex md:min-h-0 md:w-auto md:justify-start md:border-0 md:bg-transparent md:p-0 md:shadow-none',
                                    'opacity-100 md:opacity-0 md:group-hover:opacity-100',
                                )}
                                style={{
                                    color: semanticCycle[0],
                                    borderColor: `color-mix(in oklab, ${semanticCycle[0]} 48%, var(--border))`,
                                }}
                            >
                                Ver catálogo completo
                                <span className="transition-transform group-hover:translate-x-0.5">→</span>
                            </Link>
                        }
                    >
                        <div className="mt-4 flex flex-wrap gap-2">
                            {softwareLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="inline-flex items-center rounded-xl border border-[color-mix(in_oklab,var(--foreground)_12%,var(--border))] bg-background/90 px-3 py-2 text-left text-xs font-semibold text-foreground shadow-sm transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--state-info)_35%,var(--border))] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </OfferingCardShell>

                    <OfferingCardShell
                        index={1}
                        accent={semanticCycle[1]}
                        colSpan="sm:col-span-1 lg:col-span-6"
                        Icon={Key}
                        title="Licencias y precios"
                        description="Modelos flexibles: SaaS, licencia perpetua o módulos sueltos."
                        footer={
                            <Link
                                href="/licencias"
                                className={cn(
                                    'mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold transition-opacity duration-300',
                                    'max-md:min-h-11 max-md:rounded-xl max-md:border-2 max-md:border-solid max-md:bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] max-md:px-4 max-md:py-2.5 max-md:shadow-sm',
                                    'md:inline-flex md:min-h-0 md:w-auto md:justify-start md:border-0 md:bg-transparent md:p-0 md:shadow-none',
                                    'opacity-100 md:opacity-0 md:group-hover:opacity-100',
                                )}
                                style={{
                                    color: semanticCycle[1],
                                    borderColor: `color-mix(in oklab, ${semanticCycle[1]} 48%, var(--border))`,
                                }}
                            >
                                Explorar
                                <span className="transition-transform group-hover:translate-x-0.5">→</span>
                            </Link>
                        }
                    >
                        <div className="mt-4 flex flex-wrap gap-2">
                            {marketingPreciosLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="inline-flex rounded-full border border-[color-mix(in_oklab,var(--foreground)_10%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] px-2.5 py-1 text-[11px] font-medium text-foreground/90 transition-colors hover:bg-[color-mix(in_oklab,var(--state-success)_12%,var(--card))] sm:text-xs"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </OfferingCardShell>

                    <OfferingCardShell
                        index={2}
                        accent={semanticCycle[2]}
                        colSpan="sm:col-span-1 lg:col-span-6"
                        Icon={Server}
                        title="Servicios"
                        description="Implementación, soporte y consultoría por categoría."
                        footer={
                            <Link
                                href="/servicios"
                                className={cn(
                                    'mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold transition-opacity duration-300',
                                    'max-md:min-h-11 max-md:rounded-xl max-md:border-2 max-md:border-solid max-md:bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] max-md:px-4 max-md:py-2.5 max-md:shadow-sm',
                                    'md:inline-flex md:min-h-0 md:w-auto md:justify-start md:border-0 md:bg-transparent md:p-0 md:shadow-none',
                                    'opacity-100 md:opacity-0 md:group-hover:opacity-100',
                                )}
                                style={{
                                    color: semanticCycle[2],
                                    borderColor: `color-mix(in oklab, ${semanticCycle[2]} 48%, var(--border))`,
                                }}
                            >
                                Explorar
                                <span className="transition-transform group-hover:translate-x-0.5">→</span>
                            </Link>
                        }
                    >
                        <div className="mt-4 flex flex-wrap gap-2">
                            {marketingServiciosSectionLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="inline-flex rounded-full border border-[color-mix(in_oklab,var(--foreground)_10%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] px-2.5 py-1 text-[11px] font-medium text-foreground/90 transition-colors hover:bg-[color-mix(in_oklab,var(--state-alert)_12%,var(--card))] sm:text-xs"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </OfferingCardShell>
                </div>
            </div>
        </section>
    );
}
