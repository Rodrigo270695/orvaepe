import Section from '@/components/welcome/Section';
import { Building, Database, CreditCard, Globe, ShieldCheck, Zap } from 'lucide-react';

const operations = [
    {
        title: 'Fase actual: fundador único',
        desc: 'En la etapa inicial, el fundador cubre desarrollo, ventas, soporte y marketing con automatización para escalar.',
    },
    {
        title: 'Cuándo contratar',
        desc: 'Soporte > 3 horas/día o > 30 clientes activos. Segundo colaborador al superar $3,000/mes o múltiples personalizaciones.',
    },
    {
        title: 'Herramientas del día a día',
        desc: 'Mail, videollamadas, propuestas comerciales, plantillas de contratos y gestión de tareas.',
    },
];

const platform = [
    { title: 'Storefront público', desc: 'Marketing, catálogo, precios públicos y checkout.' },
    { title: 'Panel del cliente', desc: 'Licencias, descargas, facturas, tickets y suscripción.' },
    { title: 'Panel del admin', desc: 'Métricas, aprobación de pagos por transferencia y configuración del catálogo.' },
];

const payments = [
    { title: 'Culqi', desc: 'Tarjetas (Visa, Mastercard, Amex) en soles/dólares con cargos recurrentes para suscripciones.' },
    { title: 'PayPal', desc: 'Clientes internacionales y LATAM con comisión y conversión de divisa.' },
    { title: 'Transferencia manual', desc: 'Para institucionales: comprobante + aprobación manual en máximo 24h hábiles.' },
];

export default function OperationsAndPaymentsSection() {
    return (
        <Section
            id="operativa"
            eyebrow="Estructura operativa y plataforma"
            title="Operación que escala con confiabilidad"
            description="Orvae automatiza la operación comercial para que el fundador maneje 100+ clientes con SLA documentado."
        >
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {operations.map((o) => (
                    <div
                        key={o.title}
                        className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                    >
                        <Building className="size-6 text-[var(--o-amber)]" />
                        <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            {o.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                            {o.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {platform.map((p) => (
                    <div
                        key={p.title}
                        className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                    >
                        <Database className="size-6 text-[var(--o-amber)]" />
                        <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            {p.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                            {p.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-10 rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                <div className="flex items-center gap-3">
                    <CreditCard className="size-5 text-[var(--o-amber)]" />
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                        Pasarelas de pago
                    </h3>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-3">
                    {payments.map((pay) => (
                        <div
                            key={pay.title}
                            className="rounded-2xl border border-[var(--border)] bg-card/60 p-5"
                        >
                            <h4 className="font-semibold text-[var(--foreground)]">
                                {pay.title}
                            </h4>
                            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                                {pay.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-card/60 p-5">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 size-5 text-[var(--o-amber)]" />
                        <div>
                            <p className="font-semibold text-[var(--foreground)]">
                                Política de reembolsos
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
                                <li>• SaaS mensual: reembolso completo 7 días.</li>
                                <li>• SaaS anual: reembolso proporcional si se cancela en 30 días.</li>
                                <li>• Licencia perpetua y alquiler de código: sin reembolso después de entrega.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}

