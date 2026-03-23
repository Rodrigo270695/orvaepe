import MarketingLayout from '@/components/marketing/MarketingLayout';
import MarketingHero from '@/components/marketing/MarketingHero';
import Section from '@/components/welcome/Section';
import CTASection from '@/components/welcome/sections/CTASection';

export default function MoreServices() {
    return (
        <MarketingLayout title="Más servicios">
            <MarketingHero
                eyebrow="Más servicios"
                title={
                    <>
                        Construimos <span className="text-[var(--o-amber)]"> tu operación</span> end-to-end
                    </>
                }
                description="Complementos para adoptar Orvae rápido: gestión documental, automatización de flujos, plantillas contractuales y soporte operativo."
                ctas={[
                    { href: '/servicios', label: 'Ver servicios', variant: 'outline' },
                    { href: '#contacto', label: 'Solicitar demo', variant: 'primary' },
                ]}
            />

            <Section
                id="adicionales"
                eyebrow="Complementos"
                title="Servicios adicionales que suman valor"
                description="No es solo software: es acompañamiento para que la operación funcione."
            >
                <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        { title: 'Gestión documental', desc: 'Flujos de aprobación, trazabilidad y orden operativo.' },
                        { title: 'Plantillas y contratos', desc: 'Entregables claros, contratos simples y documentación lista.' },
                        { title: 'Automatización de flujos', desc: 'Conexión entre categorías para reducir tareas manuales.' },
                        { title: 'Monitoreo y control', desc: 'Recomendaciones y prácticas para mantener calidad.' },
                        { title: 'Capacitación de equipos', desc: 'Roles, guías y entrenamiento para adopción.' },
                        { title: 'Soporte con SLA documentado', desc: 'Tiempo de respuesta comprometido por escrito.' },
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

