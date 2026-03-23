import { ArrowRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section id="contacto" className="w-full py-16">
            <div className="mx-auto w-full max-w-6xl px-4">
                <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-background/60 p-8 md:p-12">
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--o-glow)] blur-2xl" />
                    <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[var(--o-glow)] blur-2xl" />

                    <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.35em] text-[var(--o-amber)]">
                                Próximo paso
                            </p>
                            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--foreground)]">
                                Pide una demo y recibe un plan claro
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                                En 20 minutos entendemos tu operación y te mostramos la ruta
                                exacta: módulos, timeline, modelo de venta y costos.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)] bg-card/60 p-6">
                            <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
                                <label className="text-sm font-semibold text-[var(--foreground)]">
                                    Email de contacto
                                </label>
                                <input
                                    type="email"
                                    placeholder="tuempresa@dominio.com"
                                    className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                                />

                                <button
                                    type="submit"
                                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-95"
                                >
                                    Solicitar demo
                                    <ArrowRight className="ml-2 size-4" />
                                </button>

                                <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                                    Al enviar, aceptas ser contactado por Orvae. No enviamos spam.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

