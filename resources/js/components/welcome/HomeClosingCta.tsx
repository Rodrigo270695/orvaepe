import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function HomeClosingCta() {
    return (
        <section
            aria-labelledby="home-close-title"
            className="relative overflow-hidden py-20 md:py-24"
            style={{ background: 'color-mix(in oklab, var(--o-dark2, #0b1220) 92%, #1e3a5f)' }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    background:
                        'radial-gradient(ellipse 70% 80% at 80% 20%, color-mix(in oklab, var(--o-amber) 28%, transparent), transparent 60%)',
                }}
                aria-hidden
            />
            <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--o-amber)]">
                    Siguiente paso
                </p>
                <h2
                    id="home-close-title"
                    className="font-display mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl"
                >
                    Elige software, licencia o un SaaS. Hoy.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
                    VetSaaS para clínicas. TallerSaaS para talleres. Licencias y desarrollo a medida
                    para el resto de tu operación.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/software"
                        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-[var(--o-amber)] px-6 py-3.5 text-sm font-semibold text-[#0b1220] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Ver software
                        <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <Link
                        href="/licencias"
                        className="inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Ver licencias
                    </Link>
                    <Link
                        href="/contacto"
                        className="inline-flex min-h-12 cursor-pointer items-center px-2 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Hablar con ventas
                    </Link>
                </div>
            </div>
        </section>
    );
}
