import MarketingLayout from '@/components/marketing/MarketingLayout';
import MarketingHero from '@/components/marketing/MarketingHero';
import Section from '@/components/welcome/Section';
import CTASection from '@/components/welcome/sections/CTASection';

export default function CorporateEmail() {
    return (
        <MarketingLayout title="Correos corporativos">
            <MarketingHero
                eyebrow="Correos corporativos"
                title={
                    <>
                        Correos con <span className="text-[var(--o-amber)]">identidad</span> y seguridad
                    </>
                }
                description="Configura buzones con tu dominio, adopta prácticas seguras y entrega trazabilidad de configuración. Orvae lo implementa contigo."
                ctas={[
                    { href: '#contacto', label: 'Solicitar demo', variant: 'primary' },
                    { href: '/servicios', label: 'Ver servicios', variant: 'outline' },
                ]}
            />

            <Section
                id="incluye"
                eyebrow="Incluye"
                title="Listo para operar desde el día 1"
                description="Sin complicaciones y con documentación."
            >
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    {[
                        { title: 'Dominio + buzones', desc: 'Estructura de cuentas según tu equipo y necesidades.' },
                        { title: 'Configuración segura', desc: 'Ajustes recomendados para reducir riesgos y mejorar entregabilidad.' },
                        { title: 'Migración y pruebas', desc: 'Transición controlada con verificación de flujo y acceso.' },
                        { title: 'Guía operativa', desc: 'Documentación para adopción y uso.' },
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

