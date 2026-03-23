import MarketingLayout from '@/components/marketing/MarketingLayout';
import MarketingHero from '@/components/marketing/MarketingHero';
import Section from '@/components/welcome/Section';
import CTASection from '@/components/welcome/sections/CTASection';

export default function CustomSoftware() {
    return (
        <MarketingLayout title="Software a medida">
            <MarketingHero
                eyebrow="Software a medida"
                title={
                    <>
                        Construimos
                        <span className="text-[var(--o-amber)]"> sistemas </span>
                        para tu realidad
                    </>
                }
                description="Talleres, prototipos y entrega de integraciones. Orvae adapta el software para que encaje con tu operación: procesos, reportes y control."
                ctas={[
                    { href: '#contacto', label: 'Solicitar demo', variant: 'primary' },
                    { href: '/servicios', label: 'Ver servicios', variant: 'outline' },
                ]}
            />

            <Section
                id="medida"
                eyebrow="Cómo trabajamos"
                title="Un proceso claro, con entregables"
                description="De la idea a la implementación con documentación y trazabilidad."
            >
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    {[
                        {
                            title: '1) Diagnóstico',
                            desc: 'Levantamiento de procesos, requerimientos y objetivos medibles.',
                        },
                        {
                            title: '2) Prototipo',
                            desc: 'Diseño funcional + flujo de datos para validar rápido.',
                        },
                        {
                            title: '3) Implementación',
                            desc: 'Desarrollo con control de calidad y documentación.',
                        },
                        {
                            title: '4) Entrega',
                            desc: 'Onboarding, capacitación y soporte según modalidad acordada.',
                        },
                    ].map((x) => (
                        <div
                            key={x.title}
                            className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                        >
                            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                                {x.title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                                {x.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>

            <CTASection />
        </MarketingLayout>
    );
}

