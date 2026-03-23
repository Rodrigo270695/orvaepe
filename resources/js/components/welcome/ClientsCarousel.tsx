'use client';

import { Building2 } from 'lucide-react';

import GeometricBackground from '@/components/welcome/GeometricBackground';

/**
 * Logos de clientes. Sustituye "name" por el nombre y opcionalmente "logo" por URL de imagen.
 * Si no hay logo, se muestra un placeholder con iniciales.
 */
const clients = [
    { name: 'Empresa A', logo: null },
    { name: 'Empresa B', logo: null },
    { name: 'Empresa C', logo: null },
    { name: 'Empresa D', logo: null },
    { name: 'Empresa E', logo: null },
    { name: 'Empresa F', logo: null },
    { name: 'Empresa G', logo: null },
    { name: 'Empresa H', logo: null },
];

/** Duplicamos para scroll infinito */
const duplicated = [...clients, ...clients];

export default function ClientsCarousel() {
    return (
        <section
            id="clientes"
            className="relative scroll-mt-28 border-t border-border bg-[color-mix(in_oklab,var(--o-dark)_8%,var(--background))] py-16 md:py-20"
        >
            <GeometricBackground variant="diagonal-lines" opacity={0.05} />
            <GeometricBackground variant="grid-dots" opacity={0.04} />

            <div className="relative mx-auto w-full max-w-6xl px-4">
                <p className="mb-8 text-center font-mono text-xs font-semibold uppercase tracking-[0.4em] text-[var(--o-amber)]">
                    Confían en nosotros
                </p>
            </div>

            <div className="carousel-wrapper group/carousel relative overflow-hidden">
                {/* Gradientes laterales para fade */}
                <div
                    className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[var(--background)] to-transparent md:w-24"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[var(--background)] to-transparent md:w-24"
                    aria-hidden
                />

                {/* Al pasar el mouse sobre el área del carrusel, se detiene (ver .carousel-wrapper en app.css) */}
                <div
                    className="carousel-track flex w-max animate-marquee gap-12 px-8 [--duration:40s]"
                    style={{ animationDuration: 'var(--duration, 40s)' }}
                >
                    {duplicated.map((client, i) => (
                        <div
                            key={`${client.name}-${i}`}
                            className="group/item flex min-w-[7rem] shrink-0 cursor-default items-center gap-2 rounded-xl border border-border bg-card/50 px-5 py-5 opacity-80 grayscale transition-all duration-300 hover:min-w-[12rem] hover:border-[var(--o-amber)]/40 hover:bg-card hover:opacity-100 hover:grayscale-0 hover:px-6 md:py-6 md:hover:min-w-[14rem]"
                        >
                            {client.logo ? (
                                <>
                                    <img
                                        src={client.logo}
                                        alt={client.name}
                                        className="h-8 w-auto max-w-[120px] shrink-0 object-contain md:h-10"
                                    />
                                    <span className="min-w-0 max-w-0 shrink overflow-hidden whitespace-nowrap font-display text-sm font-semibold text-foreground transition-[max-width] duration-300 group-hover/item:max-w-[8rem]">
                                        {client.name}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Building2 className="size-8 shrink-0 text-muted-foreground transition-colors duration-300 group-hover/item:text-[var(--o-amber)] md:size-10" strokeWidth={1} />
                                    {/* Por defecto: solo inicial. Al hover: la tarjeta se expande y muestra nombre completo + color */}
                                    <span className="min-w-[1.25rem] shrink-0 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground transition-opacity duration-300 group-hover/item:opacity-0 md:text-base">
                                        {client.name.split(' ').pop()}
                                    </span>
                                    <span className="min-w-0 max-w-0 shrink overflow-hidden whitespace-nowrap font-display text-sm font-semibold text-foreground opacity-0 transition-[max-width,opacity] duration-300 group-hover/item:max-w-[7rem] group-hover/item:opacity-100">
                                        {client.name}
                                    </span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
