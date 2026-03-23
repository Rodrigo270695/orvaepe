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

export default function OfferingsSummary() {
    return (
        <section
            id="que-ofrecemos"
            className="relative scroll-mt-28 border-t border-border bg-background/80 py-20 md:py-28"
        >
            <GeometricBackground variant="grid-hex" opacity={0.06} />
            <GeometricBackground variant="circles-blur" opacity={0.1} />

            <div className="relative mx-auto w-full max-w-6xl px-4">
                <header className="mb-14 text-center md:mb-20">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.4em] text-[var(--o-amber)]">
                        Resumen
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.75rem]">
                        Todo lo que ofrecemos
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl font-body text-muted-foreground">
                        Software desarrollado, licencias flexibles, servicios de implementación y más.
                        Elige lo que necesitas y escala por módulos.
                    </p>
                </header>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {offerings.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group relative flex flex-col rounded-2xl border border-border bg-card/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_20px_50px_var(--hero-glow-soft),0_0_0_1px_var(--hero-card-inset)] md:p-8"
                            >
                                {/* Esquina geométrica decorativa */}
                                <div
                                    className="absolute right-0 top-0 h-20 w-20 overflow-hidden rounded-tr-2xl"
                                    aria-hidden
                                >
                                    <div
                                        className="absolute -right-10 -top-10 h-20 w-20 rotate-45 border border-[var(--o-amber)] opacity-0 transition-opacity duration-300 group-hover:opacity-25"
                                    />
                                </div>
                                <div
                                    className="absolute left-0 right-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[var(--o-amber)] to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                                    aria-hidden
                                />
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background/80 text-[var(--o-amber)] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:shadow-[0_0_20px_var(--hero-glow-soft)]">
                                        <Icon className="size-6" strokeWidth={1.5} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-[var(--o-amber)]">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--o-amber)] opacity-0 transition-opacity group-hover:opacity-100">
                                    Ver más
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
