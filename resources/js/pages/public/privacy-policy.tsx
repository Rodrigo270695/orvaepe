import { usePage } from '@inertiajs/react';

import SeoHead from '@/components/seo/SeoHead';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import { ORVAE_CONTACT_EMAIL } from '@/marketing/orvaeContact';

type PageProps = {
    canRegister?: boolean;
};

export default function PrivacyPolicyPage() {
    const { canRegister = true } = usePage<PageProps>().props;
    const updatedAt = new Date().toLocaleDateString('es-PE');

    return (
        <>
            <SeoHead
                title="Política de privacidad | ORVAE"
                description="Conoce cómo ORVAE recopila, usa y protege tu información personal."
                canonicalPath="/privacidad"
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Política de privacidad', path: '/privacidad' },
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
                                Política de privacidad
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Esta política describe cómo ORVAE trata datos personales de usuarios, clientes y
                                visitantes de la plataforma.
                            </p>
                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[color-mix(in_oklab,var(--state-info)_78%,var(--muted-foreground))]">
                                Ultima actualización: {updatedAt}
                            </p>

                            <div className="mt-5 grid gap-2 sm:grid-cols-3">
                                <div className="rounded-lg border border-[color-mix(in_oklab,var(--state-info)_35%,transparent)] bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)] px-3 py-2 text-xs text-muted-foreground">
                                    Transparencia sobre uso de datos
                                </div>
                                <div className="rounded-lg border border-[color-mix(in_oklab,var(--state-success)_35%,transparent)] bg-[color-mix(in_oklab,var(--state-success)_10%,transparent)] px-3 py-2 text-xs text-muted-foreground">
                                    Seguridad y conservación
                                </div>
                                <div className="rounded-lg border border-[color-mix(in_oklab,var(--state-alert)_35%,transparent)] bg-[color-mix(in_oklab,var(--state-alert)_10%,transparent)] px-3 py-2 text-xs text-muted-foreground">
                                    Derechos del titular
                                </div>
                            </div>

                            <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
                                <section>
                                    <h2 className="text-base font-semibold text-foreground">
                                        1. Información que recopilamos
                                    </h2>
                                    <p>
                                        Podemos recopilar datos de identificación y contacto como nombre, correo, documento,
                                        teléfono, datos de facturación y registros técnicos necesarios para la prestación del
                                        servicio.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">
                                        2. Finalidad del tratamiento
                                    </h2>
                                    <p>
                                        Usamos la información para crear y administrar cuentas, brindar soporte, gestionar
                                        pagos, emitir comprobantes, prevenir fraudes y mejorar la seguridad y la calidad del
                                        sistema.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">
                                        3. Base legal y conservación
                                    </h2>
                                    <p>
                                        El tratamiento se sustenta en la ejecución de la relación contractual, el cumplimiento
                                        de obligaciones legales y, cuando corresponda, en el consentimiento del titular.
                                        Conservamos los datos durante el tiempo necesario para esas finalidades.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">
                                        4. Seguridad y confidencialidad
                                    </h2>
                                    <p>
                                        Aplicamos medidas técnicas y organizativas razonables para proteger la información
                                        frente a accesos no autorizados, pérdida, alteración o divulgación indebida.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">
                                        5. Derechos del titular
                                    </h2>
                                    <p>
                                        Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus
                                        datos, según la normativa aplicable, escribiendo a nuestro canal oficial de contacto.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">
                                        6. Encargados y terceros
                                    </h2>
                                    <p>
                                        En ciertos casos podemos apoyarnos en proveedores tecnológicos y de pago para operar el
                                        servicio. Estos terceros acceden únicamente a la información necesaria para prestar sus
                                        funciones bajo condiciones de seguridad y confidencialidad.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">
                                        7. Cambios a esta política
                                    </h2>
                                    <p>
                                        Esta política puede actualizarse. Publicaremos cualquier cambio en esta misma página
                                        con su fecha de actualización.
                                    </p>
                                </section>
                            </div>

                            <section className="mt-8 rounded-xl border border-[color-mix(in_oklab,var(--state-info)_28%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_8%,transparent)] p-4 sm:p-5">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Contacto para temas de privacidad
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Si deseas ejercer tus derechos o tienes dudas sobre esta política, escríbenos a{' '}
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
