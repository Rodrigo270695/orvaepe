import Section from '@/components/welcome/Section';
import { Compass, Gauge, ShieldAlert, Timer } from 'lucide-react';

const revenueMetrics = [
    { title: 'MRR', desc: 'Ingresos recurrentes mensuales. Meta año 1: $2,000.' },
    { title: 'ARR', desc: 'MRR × 12. Referencia clave para valoración del negocio.' },
    { title: 'ARPU', desc: 'MRR ÷ clientes. Objetivo: ARPU > $80/mes.' },
];

const customerMetrics = [
    { title: 'Churn rate', desc: 'Objetivo < 3% mensual.' },
    { title: 'LTV', desc: 'Valor de vida del cliente en base a ARPU y churn.' },
    { title: 'CAC', desc: 'Objetivo CAC < LTV × 0.3.' },
    { title: 'NPS', desc: 'Objetivo NPS > 50 (encuesta trimestral).' },
];

const operationalMetrics = [
    { title: 'Tickets', desc: 'Tiempo de respuesta < 4 horas hábiles.' },
    { title: 'Uptime', desc: 'Objetivo 99.9% mensual.' },
    { title: 'Licencias', desc: 'Activación < 5 min automático, < 24h transferencias.' },
];

const roadmapYear1 = [
    { title: 'Q1 (Validación)', desc: 'Storefront + motor de licencias + Culqi/PayPal. 3-5 clientes beta.' },
    { title: 'Q2 (Lanzamiento público)', desc: 'Primeras 10 ventas de pago y primer caso de éxito documentado.' },
    { title: 'Q3 (Crecimiento)', desc: 'Alcanzar $1,000 MRR y lanzar Orvae Assets independiente.' },
    { title: 'Q4 (Consolidación)', desc: 'Alcanzar $2,000 MRR y evaluar soporte junior.' },
];

const risks = [
    {
        title: 'Competencia de soluciones gratuitas',
        desc: 'Orvae compite en soporte local, facilidad y adaptación al contexto peruano.',
    },
    {
        title: 'Cliente no paga o chargeback',
        desc: 'Motor de licencias revoca acceso ante pago fallido y transferencias solo con confirmación.',
    },
    {
        title: 'Copia del código o piratería',
        desc: 'Licencias atadas a dominio + fingerprint del servidor + suspensión automática.',
    },
    {
        title: 'Fundador único punto de falla',
        desc: 'Documentación exhaustiva y automatización máxima. Contratación cuando el MRR lo permita.',
    },
    {
        title: 'Cambios regulatorios SUNAT/MEF',
        desc: 'Arquitectura modular y suscripción a boletines; contador externo que alerta cambios relevantes.',
    },
];

export default function MetricsRoadmapRisksSection() {
    return (
        <>
            <Section
                id="metricas"
                eyebrow="Métricas clave de negocio"
                title="Seguimos números para sostener la confiabilidad"
                description="MRR, churn y NPS — más métricas operativas: tiempo de respuesta, uptime y activación de licencias."
            >
                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                    <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                        <Gauge className="size-5 text-[var(--o-amber)]" />
                        <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            Métricas de ingresos
                        </h3>
                        <ul className="mt-4 space-y-3">
                            {revenueMetrics.map((m) => (
                                <li key={m.title}>
                                    <p className="text-sm font-semibold text-[var(--foreground)]">
                                        {m.title}
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                        {m.desc}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                        <Gauge className="size-5 text-[var(--o-amber)]" />
                        <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            Métricas de clientes
                        </h3>
                        <ul className="mt-4 space-y-3">
                            {customerMetrics.map((m) => (
                                <li key={m.title}>
                                    <p className="text-sm font-semibold text-[var(--foreground)]">
                                        {m.title}
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                        {m.desc}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                        <Timer className="size-5 text-[var(--o-amber)]" />
                        <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            Métricas operativas
                        </h3>
                        <ul className="mt-4 space-y-3">
                            {operationalMetrics.map((m) => (
                                <li key={m.title}>
                                    <p className="text-sm font-semibold text-[var(--foreground)]">
                                        {m.title}
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                        {m.desc}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            <Section
                id="hoja-ruta"
                eyebrow="Hoja de ruta de crecimiento"
                title="Plan de ejecución real, por trimestres"
                description="Validamos mercado, lanzamos público y después escalamos con casos de éxito documentados."
            >
                <div className="mt-8 grid gap-5 lg:grid-cols-4">
                    {roadmapYear1.map((r) => (
                        <div
                            key={r.title}
                            className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                        >
                            <Compass className="size-5 text-[var(--o-amber)]" />
                            <p className="mt-3 font-semibold text-[var(--foreground)]">
                                {r.title}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                                {r.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section
                id="riesgos"
                eyebrow="Riesgos y mitigaciones"
                title="Confiabilidad sostenida con controles"
                description="Orvae no depende de suerte: define mitigación y automatiza la respuesta."
            >
                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {risks.map((r) => (
                        <div
                            key={r.title}
                            className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                        >
                            <ShieldAlert className="size-5 text-[var(--o-amber)]" />
                            <p className="mt-3 font-semibold text-[var(--foreground)]">
                                {r.title}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                                {r.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>
        </>
    );
}

