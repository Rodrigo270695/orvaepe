import { Link } from '@inertiajs/react';
import {
    Box,
    Key,
    Mail,
    Package,
    Server,
    Wrench,
} from 'lucide-react';

import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';
import { cn } from '@/lib/utils';

type Offering = {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
};

const offerings: Offering[] = [
    {
        title: 'Software desarrollado',
        description: 'Sistemas ya construidos y listos para operar: contabilidad, ventas, inventario y más.',
        href: '/software',
        icon: Box,
    },
    {
        title: 'Licencias y precios',
        description: 'Modelos flexibles: SaaS, licencia perpetua o módulos sueltos.',
        href: '/licencias',
        icon: Key,
    },
    {
        title: 'Servicios',
        description: 'Implementación, soporte y consultoría por categoría.',
        href: '/servicios',
        icon: Server,
    },
    {
        title: 'Software a medida',
        description: 'Desarrollo a medida cuando el catálogo no cubre tu caso.',
        href: '/software-a-medida',
        icon: Wrench,
    },
    {
        title: 'Correos corporativos',
        description: 'Email profesional con tu dominio y seguridad empresarial.',
        href: '/correos-corporativos',
        icon: Mail,
    },
    {
        title: 'Otros servicios',
        description: 'Formación, mantenimiento y servicios complementarios.',
        href: '/otros-servicios',
        icon: Package,
    },
];

const semanticCycle = [
    'var(--state-info)',
    'var(--state-success)',
    'var(--state-alert)',
    'var(--state-danger)',
] as const;

export default function OfferingsSummary() {
    return (
        <section
            id="que-ofrecemos"
            className="relative scroll-mt-28 border-t border-border bg-[color-mix(in_oklab,var(--landing-surface-2)_92%,transparent)] py-20 backdrop-blur-[2px] md:py-28 dark:bg-[color-mix(in_oklab,var(--landing-surface-2)_88%,transparent)]"
        >
            {/* Ambiente: viñeta + capa */}
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
                    description="Software desarrollado, licencias flexibles, servicios de implementación y más. Elige lo que necesitas y escala por módulos."
                    layout="wide"
                    titleSize="hero"
                />

                {/* Bento: fila 1 ancha + dos filas de 3 */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
                    {offerings.map((item, index) => {
                        const Icon = item.icon;
                        const isFeatured = index === 0;
                        const accent = semanticCycle[index % semanticCycle.length];
                        const colSpan =
                            isFeatured
                                ? 'sm:col-span-2 lg:col-span-12'
                                : index >= 1 && index <= 3
                                  ? 'lg:col-span-4'
                                  : 'lg:col-span-6';

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'landing-offer-shine group relative flex flex-col rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm ring-1 ring-border/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_-12px_var(--hero-glow-soft),0_0_0_1px_var(--hero-card-inset)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:p-8',
                                    index % 2 === 1 &&
                                        'border-l-[3px]',
                                    index % 2 === 0 &&
                                        !isFeatured &&
                                        'border-l-[3px]',
                                    colSpan,
                                    isFeatured &&
                                        'border-l-[3px] lg:flex-row lg:items-center lg:gap-10 lg:p-10',
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
                                <div
                                    className="absolute right-0 top-0 h-20 w-20 overflow-hidden rounded-tr-3xl"
                                    aria-hidden
                                >
                                    <div
                                        className="absolute -right-10 -top-10 h-20 w-20 rotate-45 border opacity-0 transition-opacity duration-300 group-hover:opacity-25"
                                        style={{ borderColor: accent }}
                                    />
                                </div>
                                <div
                                    className="absolute left-0 right-0 top-0 h-[2px] rounded-t-3xl bg-gradient-to-r from-transparent via-[var(--o-amber)] to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                                    aria-hidden
                                    style={{
                                        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                                    }}
                                />
                                <div
                                    className={cn(
                                        'flex items-start gap-4',
                                        isFeatured && 'lg:items-center',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex shrink-0 items-center justify-center rounded-2xl border border-border bg-background/80 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_var(--hero-glow-soft)]',
                                            isFeatured ? 'size-16 md:size-20' : 'size-12',
                                        )}
                                        style={{
                                            color: accent,
                                        }}
                                    >
                                        <Icon
                                            className={cn(
                                                isFeatured ? 'size-9 md:size-10' : 'size-6',
                                            )}
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
                                            {item.title}
                                        </h3>
                                        <p
                                            className={cn(
                                                'mt-2 leading-relaxed text-muted-foreground',
                                                isFeatured ? 'text-base md:max-w-2xl' : 'text-sm',
                                            )}
                                        >
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                                    style={{ color: accent }}
                                >
                                    Explorar
                                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
