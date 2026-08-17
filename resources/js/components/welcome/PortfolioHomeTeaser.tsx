import { Link } from '@inertiajs/react';
import { ArrowUpRight, Layers } from 'lucide-react';

import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

export default function PortfolioHomeTeaser() {
    return (
        <section
            id="portafolio"
            className="relative scroll-mt-28 border-t border-border bg-[color-mix(in_oklab,var(--landing-surface-2)_90%,var(--background))] py-16 backdrop-blur-[1px] md:py-20 dark:bg-[color-mix(in_oklab,var(--landing-surface-2)_82%,var(--background))]"
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--o-amber)_35%,transparent)] to-transparent"
                aria-hidden
            />
            <GeometricBackground variant="diagonal-lines" opacity={0.05} />
            <GeometricBackground variant="grid-dots" opacity={0.04} />

            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="text-center">
                    <LandingSectionHeader
                        eyebrow="Portafolio"
                        title="Sistemas ya en operación"
                        description="Contabilidad, ventas, inventario, veterinaria y más — con empresas que ya trabajan con ORVAE."
                        variant="sparkles"
                        layout="sparkles"
                        titleClassName="font-display text-2xl font-bold tracking-tight md:text-3xl"
                        descriptionClassName="mt-3 max-w-lg text-sm font-body"
                    />
                </div>

                <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-border/60 bg-[color-mix(in_oklab,var(--background)_75%,var(--card))] p-1 shadow-[0_20px_50px_-20px_var(--hero-glow-soft)] ring-1 ring-border/40">
                    <div
                        className="landing-carousel-glow pointer-events-none absolute inset-0 bg-gradient-to-b from-[color-mix(in_oklab,var(--state-info)_12%,transparent)] to-transparent opacity-80"
                        aria-hidden
                    />
                    <div className="relative flex flex-col items-center gap-6 rounded-[1.35rem] bg-background/50 px-6 py-10 text-center sm:px-10 md:flex-row md:text-left">
                        <div
                            className="flex size-16 shrink-0 items-center justify-center rounded-2xl border"
                            style={{
                                borderColor: 'color-mix(in oklab, var(--state-info) 35%, var(--border))',
                                background:
                                    'linear-gradient(135deg, color-mix(in oklab, var(--state-info) 18%, transparent), color-mix(in oklab, var(--state-success) 10%, transparent))',
                            }}
                            aria-hidden
                        >
                            <Layers className="size-7 text-[color-mix(in_oklab,var(--state-info)_80%,var(--foreground))]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
                                Mira el trabajo, no solo el catálogo
                            </p>
                            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                                Capturas, módulos y empresas que operan con cada sistema — en una vista
                                clara para decidir con contexto.
                            </p>
                        </div>
                        <Link
                            href="/portafolio"
                            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_6px_24px_-6px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            Ver portafolio
                            <ArrowUpRight className="size-4 opacity-90" aria-hidden />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
