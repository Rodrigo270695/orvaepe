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

export default function TermsAndConditionsPage() {
    const { canRegister = true } = usePage<PageProps>().props;
    const updatedAt = new Date().toLocaleDateString('es-PE');

    return (
        <>
            <SeoHead
                title="Términos y condiciones | ORVAE"
                description="Condiciones generales de uso del sitio web, contratación de software, licencias y servicios ORVAE en Perú."
                canonicalPath="/terminos-y-condiciones"
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Términos y condiciones', path: '/terminos-y-condiciones' },
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
                        <section className="rounded-2xl border border-[color-mix(in_oklab,var(--state-info)_28%,var(--border))] bg-[color-mix(in_oklab,var(--card)_90%,transparent)] p-6 shadow-[0_24px_70px_-40px_color-mix(in_oklab,var(--foreground)_35%,transparent)] backdrop-blur-md sm:p-9">
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color-mix(in_oklab,var(--state-info)_74%,var(--muted-foreground))]">
                                Legal ORVAE
                            </p>
                            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Términos y condiciones
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Condiciones aplicables al uso de este sitio y a la contratación de productos y servicios
                                ofrecidos bajo la marca ORVAE por {ORVAE_LEGAL_NAME}, con RUC {ORVAE_RUC}.
                            </p>
                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[color-mix(in_oklab,var(--state-info)_78%,var(--muted-foreground))]">
                                Ultima actualización: {updatedAt}
                            </p>

                            <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
                                <section>
                                    <h2 className="text-base font-semibold text-foreground">1. Identificación</h2>
                                    <p>
                                        El titular del sitio y responsable contractual es {ORVAE_LEGAL_NAME}, con RUC{' '}
                                        {ORVAE_RUC} y domicilio fiscal en {ORVAE_FISCAL_ADDRESS}. La marca comercial
                                        «ORVAE» identifica los productos y servicios ofrecidos por dicha sociedad.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">2. Objeto</h2>
                                    <p>
                                        Estos términos regulan el acceso al sitio web, la información publicada, los
                                        formularios de contacto, el libro de reclamaciones virtual y las operaciones de
                                        compra o contratación que se formalicen a través de la plataforma o canales
                                        asociados (incluido el cobro con pasarelas de pago cuando esté habilitado).
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">3. Uso del sitio</h2>
                                    <p>
                                        Te comprometes a usar el sitio de forma lícita, sin vulnerar sistemas de
                                        seguridad ni introducir contenido malicioso. La información del catálogo tiene
                                        carácter orientativo; ofertas, precios y disponibilidad pueden actualizarse
                                        previa comunicación razonable cuando corresponda.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">
                                        4. Contratación y medios de pago
                                    </h2>
                                    <p>
                                        La celebración del contrato puede requerir registro, verificación de correo y
                                        aceptación expresa del alcance del producto o servicio. Los pagos con tarjeta u
                                        otros medios se procesan mediante proveedores certificados; al utilizarlos
                                        aceptas también sus condiciones de uso y políticas de seguridad.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">
                                        5. Propiedad intelectual y licencias de software
                                    </h2>
                                    <p>
                                        Los sistemas, documentación, marcas y contenidos del sitio están protegidos por
                                        la normativa aplicable. Las licencias de software (propias o de terceros) se
                                        rigen por el contrato o términos del fabricante correspondiente, además de lo
                                        acordado en tu orden de compra o suscripción.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">6. Limitación de responsabilidad</h2>
                                    <p>
                                        Salvo disposición legal imperativa en contrario, la responsabilidad se limitará
                                        al alcance del servicio contratado y a daños directos previsibles. No nos
                                        responsabilizamos por interrupciones ajenas a nuestro control razonable (por
                                        ejemplo, caídas de terceros proveedores de internet o pasarelas de pago).
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">7. Ley aplicable y jurisdicción</h2>
                                    <p>
                                        Para conflictos derivados de estos términos se aplicará la legislación de la
                                        República del Perú. Las partes someten sus controversias a los tribunales
                                        competentes del domicilio de {ORVAE_LEGAL_NAME}, salvo normas de consumo que
                                        dispongan otro fuero.
                                    </p>
                                </section>
                            </div>

                            <section className="mt-8 rounded-xl border border-[color-mix(in_oklab,var(--state-info)_28%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_8%,transparent)] p-4 sm:p-5">
                                <h3 className="text-sm font-semibold text-foreground">Consultas</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Para aclaraciones sobre estos términos:{' '}
                                    <a
                                        href={`mailto:${ORVAE_CONTACT_EMAIL}`}
                                        className="font-medium text-[color-mix(in_oklab,var(--state-info)_86%,var(--foreground))] underline underline-offset-4"
                                    >
                                        {ORVAE_CONTACT_EMAIL}
                                    </a>
                                    .
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
