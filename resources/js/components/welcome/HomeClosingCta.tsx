import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function HomeClosingCta() {
    return (
        <section
            aria-labelledby="home-close-title"
            className="relative overflow-hidden py-20 md:py-24"
            style={{ background: 'linear-gradient(135deg, #0b1220 0%, #12324a 48%, #7c2d12 140%)' }}
        >
            <div
                className="home-blob home-blob--pulse -left-10 top-0 size-[22rem] opacity-50"
                data-parallax="10"
                style={{ background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)' }}
                aria-hidden
            />
            <div
                className="home-blob home-blob--pulse -right-8 bottom-0 size-[24rem] opacity-60"
                data-parallax="-8"
                style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 68%)', animationDelay: '1.2s' }}
                aria-hidden
            />
            <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#fbbf24]">
                    Siguiente paso
                </p>
                <h2
                    id="home-close-title"
                    className="font-display mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl"
                >
                    Elige software, licencia o un SaaS. Hoy.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                    VetSaaS para clínicas. TallerSaaS para talleres. Licencias y desarrollo a medida
                    para el resto de tu operación.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-[#0d9488] px-3 py-1 text-[11px] font-semibold text-white">
                        VetSaaS
                    </span>
                    <span className="rounded-full bg-[#ea580c] px-3 py-1 text-[11px] font-semibold text-white">
                        TallerSaaS
                    </span>
                    <span className="rounded-full bg-[#2563eb] px-3 py-1 text-[11px] font-semibold text-white">
                        Licencias
                    </span>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/software"
                        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-3.5 text-sm font-semibold text-[#0b1220] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
