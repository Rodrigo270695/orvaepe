import Section from '@/components/welcome/Section';
import { CheckCircle2, CreditCard, ShieldCheck, Wrench } from 'lucide-react';

const models = [
    {
        title: 'Modelo 1 — Suscripción SaaS',
        icon: ShieldCheck,
        points: [
            'Mensual o anual',
            'Orvae gestiona infraestructura, backups y seguridad',
            'Ideal para empresas sin área TI',
        ],
    },
    {
        title: 'Modelo 2 — Licencia perpetua',
        icon: CreditCard,
        points: [
            'Pago único por derecho de uso',
            'Incluye 12 meses de soporte y actualizaciones menores',
            'Ideal para TI propio y clientes sin suscripción',
        ],
    },
    {
        title: 'Modelo 3 — Alquiler de código fuente',
        icon: Wrench,
        points: [
            'Temporal (3, 6 o 12 meses)',
            'Puedes desplegarlo en tu servidor y modificarlo',
            'Al vencer, sigue funcionando sin actualizaciones ni soporte',
        ],
    },
    {
        title: 'Modelo 4 — Módulos sueltos',
        icon: CheckCircle2,
        points: [
            'Compra módulos individuales',
            'Combina SaaS y licencia perpetua',
            'Escala cuando tu operación lo requiera',
        ],
    },
];

const pricing = [
    {
        name: 'Starter',
        users: 'Hasta 10',
        modules: '2 módulos',
        monthly: '$49/mes',
        yearly: '$470/año',
        perpetual: '$588',
        highlight: false,
    },
    {
        name: 'Pro',
        users: 'Hasta 50',
        modules: '5 módulos',
        monthly: '$99/mes',
        yearly: '$950/año',
        perpetual: '$1,188',
        highlight: true,
    },
    {
        name: 'Business',
        users: 'Hasta 200',
        modules: 'Todos',
        monthly: '$199/mes',
        yearly: '$1,910/año',
        perpetual: '$2,388',
        highlight: false,
    },
    {
        name: 'Enterprise',
        users: 'Ilimitado',
        modules: 'Todos + source',
        monthly: '$299/mes',
        yearly: '$2,870/año',
        perpetual: 'Cotización',
        highlight: false,
    },
];

export default function SalesAndPricingSection() {
    return (
        <Section
            id="precios"
            eyebrow="Modelos de venta e información de precios"
            title="Precios públicos que puedes comparar"
            description="Cuatro modelos para adaptarte a tu realidad: SaaS, licencia perpetua, alquiler de código o módulos sueltos."
        >
            <div className="mt-8 grid gap-5 md:grid-cols-2">
                {models.map((m) => (
                    <div
                        key={m.title}
                        className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                    >
                        <m.icon className="size-6 text-[var(--o-amber)]" />
                        <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            {m.title}
                        </h3>
                        <ul className="mt-4 space-y-2">
                            {m.points.map((p) => (
                                <li key={p} className="flex items-start gap-3">
                                    <span className="mt-1 size-2 rounded-full bg-[var(--o-amber)]" />
                                    <span className="text-sm text-[var(--muted-foreground)]">
                                        {p}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-12 rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                        Estructura de precios base (USD)
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Incluye SLA documentado y soporte comprometido.
                    </p>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-4">
                    {pricing.map((p) => (
                        <div
                            key={p.name}
                            className={`rounded-2xl border p-6 ${
                                p.highlight
                                    ? 'border-[var(--o-amber)]/40 bg-[color-mix(in oklab,var(--primary)_18%,transparent)]'
                                    : 'border-[var(--border)] bg-background/40'
                            }`}
                        >
                            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.35em] text-[var(--o-amber)] opacity-90">
                                {p.name}
                            </p>
                            <h4 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--foreground)]">
                                {p.monthly}
                            </h4>
                            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                                {p.users} • {p.modules}
                            </p>

                            <div className="mt-5 space-y-2 text-sm text-[var(--muted-foreground)]">
                                <div className="flex items-center justify-between gap-3">
                                    <span>SaaS anual</span>
                                    <span className="text-[var(--foreground)]">{p.yearly}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Perpetua</span>
                                    <span className="text-[var(--foreground)]">{p.perpetual}</span>
                                </div>
                            </div>

                            <a
                                href="#contacto"
                                className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    p.highlight
                                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-95'
                                        : 'border border-[var(--border)] bg-background text-[var(--foreground)] hover:bg-[var(--accent)]/10'
                                }`}
                            >
                                Solicitar demo
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}

