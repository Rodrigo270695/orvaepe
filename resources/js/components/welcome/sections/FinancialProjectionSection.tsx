import Section from '@/components/welcome/Section';
import { LineChart, Wallet } from 'lucide-react';

export default function FinancialProjectionSection() {
    return (
        <Section
            id="proyeccion"
            eyebrow="Proyección financiera inicial"
            title="Crecimiento conservador, impulsado por ingresos recurrentes"
            description="Escenario conservador con enfoque en SaaS mensual y costos fijos bajos. Objetivo: alcanzar $1,000 MRR como umbral de validación."
        >
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-6 lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <LineChart className="size-5 text-[var(--o-amber)]" />
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            Proyección de MRR (extracto)
                        </h3>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {[
                            { month: '3', clients: '5', mrr: '$445' },
                            { month: '6', clients: '12', mrr: '$1,068' },
                            { month: '12', clients: '28', mrr: '$2,492' },
                            { month: '24', clients: '90', mrr: '$8,010' },
                        ].map((r) => (
                            <div
                                key={r.month}
                                className="rounded-xl border border-[var(--border)] bg-card/60 p-4"
                            >
                                <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.35em] text-[var(--o-amber)] opacity-90">
                                    Mes {r.month}
                                </p>
                                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                                    {r.clients} clientes activos
                                </p>
                                <p className="mt-1 text-lg font-bold text-[var(--foreground)]">
                                    {r.mrr}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                    <div className="flex items-center gap-3">
                        <Wallet className="size-5 text-[var(--o-amber)]" />
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            Punto de equilibrio
                        </h3>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        Con ARPU de $89 y costos fijos de ~$150/mes, el punto de equilibrio es de{' '}
                        <span className="font-semibold text-[var(--foreground)]">2 clientes activos</span>. A partir del tercer cliente todo es margen.
                    </p>

                    <div className="mt-6 rounded-xl border border-[var(--border)] bg-card/60 p-4">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                            Primer objetivo financiero
                        </p>
                        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                            <span className="font-semibold text-[var(--foreground)]">$1,000 MRR = 12 clientes activos</span>
                        </p>
                    </div>
                </div>
            </div>
        </Section>
    );
}

