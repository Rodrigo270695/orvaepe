import { usePage } from '@inertiajs/react';

import SeoHead from '@/components/seo/SeoHead';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import { ORVAE_CONTACT_EMAIL, ORVAE_FISCAL_ADDRESS, ORVAE_LEGAL_NAME, ORVAE_RUC } from '@/marketing/orvaeContact';

type PageProps = {
    canRegister?: boolean;
};

export default function RefundPolicyPage() {
    const { canRegister = true } = usePage<PageProps>().props;
    const updatedAt = new Date().toLocaleDateString('es-PE');

    return (
        <>
            <SeoHead
                title="Política de cambios y devoluciones | ORVAE"
                description="Criterios de cambios, revocación y reembolsos para software, licencias y servicios contratados con ORVAE en Perú."
                canonicalPath="/politica-de-cambios-y-devoluciones"
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Cambios y devoluciones', path: '/politica-de-cambios-y-devoluciones' },
                ]}
            />

            <div className="landing-page relative min-h-screen text-foreground">
                <GeometricBackground />
                <div className="landing-grain absolute inset-0 z-0" aria-hidden />
                <div className="relative z-[1]">
                    <MarketingUnifiedNavbar canRegister={canRegister} />
                    <div className="h-20 shrink-0" aria-hidden />
                    <AppearanceFloatingRailToggle />

                    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
                        <section className="rounded-2xl border border-[color-mix(in_oklab,var(--state-success)_28%,var(--border))] bg-[color-mix(in_oklab,var(--card)_90%,transparent)] p-6 shadow-[0_24px_70px_-40px_color-mix(in_oklab,var(--foreground)_35%,transparent)] backdrop-blur-md sm:p-9">
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color-mix(in_oklab,var(--state-success)_74%,var(--muted-foreground))]">
                                Postventa ORVAE
                            </p>
                            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Política de cambios y devoluciones
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Criterios generales aplicables a compras realizadas con {ORVAE_LEGAL_NAME} (RUC{' '}
                                {ORVAE_RUC}), domicilio fiscal {ORVAE_FISCAL_ADDRESS}.
                            </p>
                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[color-mix(in_oklab,var(--state-success)_78%,var(--muted-foreground))]">
                                Ultima actualización: {updatedAt}
                            </p>

                            <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
                                <section>
                                    <h2 className="text-base font-semibold text-foreground">1. Software y entregas digitales</h2>
                                    <p>
                                        Una vez entregado el acceso, clave o descarga de software propio, la
                                        naturaleza digital del bien puede limitar la revocación conforme a la ley. En
                                        defectos comprobados de imposición de uso atribuibles a ORVAE, coordinaremos
                                        corrección, reemplazo o devolución según el caso y la normativa de consumo
                                        aplicable.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">2. Licencias OEM y de terceros</h2>
                                    <p>
                                        Las licencias de fabricantes o distribuidores se rigen por sus políticas de
                                        activación y uso. Los cambios o devoluciones dependen de la posibilidad técnica
                                        de revocación y de las condiciones del fabricante. Te informaremos el estado
                                        dentro de un plazo razonable desde la solicitud y la evidencia recibida.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">3. Servicios profesionales</h2>
                                    <p>
                                        Los servicios (implementación, integración, correo corporativo, etc.) se facturan
                                        según el alcance acordado. Si el servicio no ha comenzado, puede aplicarse
                                        anulación con reembolso proporcional a lo ya devengado. Si ya se inició, se
                                        facturará el trabajo ejecutado y se acordará la continuación o cierre del
                                        encargo.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">4. Plazos y canal</h2>
                                    <p>
                                        Las solicitudes de cambio o devolución deben enviarse por el correo oficial o
                                        los medios indicados en tu comprobante de pago, con datos del pedido y la
                                        descripción del motivo. Para reclamos también puedes usar el{' '}
                                        <a
                                            href="/libro-de-reclamaciones"
                                            className="font-medium text-[color-mix(in_oklab,var(--state-success)_88%,var(--foreground))] underline underline-offset-4"
                                        >
                                            libro de reclamaciones virtual
                                        </a>{' '}
                                        del sitio.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">5. Reembolsos con pasarela de pago</h2>
                                    <p>
                                        Cuando el cobro se hubiera procesado por tarjeta u otro medio electrónico, el
                                        reembolso, si procede, se gestionará por el mismo canal o alternativa legalmente
                                        equivalente, en los plazos que marque el proveedor de pagos y la entidad
                                        emisora.
                                    </p>
                                </section>
                            </div>

                            <section className="mt-8 rounded-xl border border-[color-mix(in_oklab,var(--state-success)_28%,var(--border))] bg-[color-mix(in_oklab,var(--state-success)_8%,transparent)] p-4 sm:p-5">
                                <h3 className="text-sm font-semibold text-foreground">Atención</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Escribe a{' '}
                                    <a
                                        href={`mailto:${ORVAE_CONTACT_EMAIL}`}
                                        className="font-medium text-[color-mix(in_oklab,var(--state-success)_86%,var(--foreground))] underline underline-offset-4"
                                    >
                                        {ORVAE_CONTACT_EMAIL}
                                    </a>{' '}
                                    indicando número de pedido o cotización.
                                </p>
                            </section>
                        </section>
                    </main>

                    <WelcomeFooter />
                    <ScrollToTopButton />
                </div>
            </div>
        </>
    );
}
