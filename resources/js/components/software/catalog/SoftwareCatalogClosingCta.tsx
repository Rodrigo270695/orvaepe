import { Link } from '@inertiajs/react';
import { ArrowRight, Code2, KeyRound, MessagesSquare } from 'lucide-react';

const steps = [
    { icon: MessagesSquare, title: 'Nos cuentas tu operación', text: 'Una llamada para entender procesos y volumen.' },
    { icon: Code2, title: 'Diseñamos y construimos', text: 'Entregas por etapas, con demo en cada avance.' },
    { icon: KeyRound, title: 'Lo usas a tu manera', text: 'SaaS mensual o licencia con código fuente.' },
] as const;

export default function SoftwareCatalogClosingCta() {
    return (
        <section
            aria-labelledby="software-close-title"
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

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#fbbf24]">
                        ¿No está tu sistema?
                    </p>
                    <h2
                        id="software-close-title"
                        className="font-display mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl"
                    >
                        Lo construimos a medida.
                    </h2>
                    <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                        Si tu operación no encaja en un sistema del catálogo, desarrollamos el tuyo con el mismo
                        equipo que mantiene VetSaaS y TallerSaaS.
                    </p>
                </div>

                <ol className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-3">
                    {steps.map(({ icon: Icon, title, text }, i) => (
                        <li
                            key={title}
                            className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 text-left backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-[#fbbf24]">
                                    <Icon className="size-4" aria-hidden />
                                </span>
                                <span className="font-mono text-[11px] font-semibold tabular-nums text-white/55">
                                    0{i + 1}
                                </span>
                            </div>
                            <p className="mt-4 font-display text-base font-bold text-white">{title}</p>
                            <p className="mt-1 text-sm leading-relaxed text-white/70">{text}</p>
                        </li>
                    ))}
                </ol>

                <div className="mt-10 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/contacto"
                        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-3.5 text-sm font-semibold text-[#0b1220] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Contarnos tu proyecto
                        <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <Link
                        href="/servicios"
                        className="inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Ver servicios
                    </Link>
                    <Link
                        href="/licencias"
                        className="inline-flex min-h-12 cursor-pointer items-center px-2 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Ver licencias
                    </Link>
                </div>
            </div>
        </section>
    );
}
