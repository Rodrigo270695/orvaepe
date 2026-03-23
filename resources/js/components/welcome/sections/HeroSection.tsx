import { Link } from '@inertiajs/react';
import { Bolt, ShieldCheck, Sparkles } from 'lucide-react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function HeroSection() {
    return (
        <section id="inicio" className="relative overflow-hidden scroll-mt-28">
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-[-240px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--o-glow)] blur-2xl" />
                <div className="absolute bottom-[-320px] left-[-160px] h-[520px] w-[520px] rounded-full bg-[var(--o-glow)] blur-3xl" />
            </div>

            <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-10 md:pb-16 md:pt-14">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-background/60 px-4 py-2">
                            <AppLogoIcon className="size-5 fill-[var(--o-amber)]" />
                            <span className="font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-[0.35em] text-[var(--o-amber)]">
                                Software empresarial por categorías
                            </span>
                        </div>

                        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.06] text-[var(--foreground)] md:text-5xl">
                            Orvae: sistemas de software confiables
                            <span className="text-[var(--o-amber)]"> para tu operación</span>.
                        </h1>

                        <p className="mt-5 max-w-xl font-[family-name:var(--font-body)] text-[16px] leading-relaxed text-[var(--muted-foreground)]">
                            Vendemos soluciones listas para operar por categorías: Activos
                            (Assets), Inventario (Stock), Multi-zona (Zones), Licenciamiento
                            (Vault) y Documentos (Docs). Elige <b>servicio</b> (SaaS),
                            <b> licencia</b> o <b>módulos sueltos</b> con implementación en días
                            o semanas.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/licencias"
                                className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-95"
                            >
                                Ver precios
                            </Link>
                            <Link
                                href="/software"
                                className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-background px-5 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--accent)]/10"
                            >
                                Ver categorías
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-[var(--border)] bg-background/60 p-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-[var(--o-amber)]" />
                                    <p className="text-sm font-semibold text-[var(--foreground)]">
                                        SLA documentado
                                    </p>
                                </div>
                                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                                    Penalidades reales & respuesta comprometida
                                </p>
                            </div>
                            <div className="rounded-xl border border-[var(--border)] bg-background/60 p-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-[var(--o-amber)]" />
                                    <p className="text-sm font-semibold text-[var(--foreground)]">
                                        Listo rápido
                                    </p>
                                </div>
                                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                                    Setup en días o semanas
                                </p>
                            </div>
                            <div className="rounded-xl border border-[var(--border)] bg-background/60 p-4">
                                <div className="flex items-center gap-2">
                                    <Bolt className="size-4 text-[var(--o-amber)]" />
                                    <p className="text-sm font-semibold text-[var(--foreground)]">
                                        Modelos flexibles
                                    </p>
                                </div>
                                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                                    SaaS, licencia o módulos sueltos por categoría
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-3xl border border-[var(--border)] bg-card/60 p-6 shadow-sm backdrop-blur">
                            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                                Diferenciador central
                            </h3>
                            <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[var(--muted-foreground)]">
                                Confiabilidad demostrable: uptime público, changelog
                                visible y soporte comprometido por escrito.
                            </p>

                            <ul className="mt-5 space-y-3">
                                {[
                                    'SLA documentado con penalidades reales',
                                    'Uptime público en status.orvae.com',
                                    'Historial de versiones y changelog público',
                                    'Contratos simples en español sin cláusulas ocultas',
                                ].map((t) => (
                                    <li
                                        key={t}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="mt-1 size-2 rounded-full bg-[var(--o-amber)]" />
                                        <span className="text-sm text-[var(--foreground)]">
                                            {t}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pointer-events-none absolute -bottom-6 -left-4 h-16 w-16 rounded-2xl bg-[var(--o-amber)]/15 blur-xl" />
                        <div className="pointer-events-none absolute -top-6 -right-4 h-24 w-24 rounded-3xl bg-[var(--o-amber)]/10 blur-xl" />
                    </div>
                </div>
            </div>
        </section>
    );
}

