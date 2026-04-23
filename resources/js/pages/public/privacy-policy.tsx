import { usePage } from '@inertiajs/react';

import SeoHead from '@/components/seo/SeoHead';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';

type PageProps = {
    canRegister?: boolean;
};

export default function PrivacyPolicyPage() {
    const { canRegister = true } = usePage<PageProps>().props;

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

                    <main className="mx-auto w-full max-w-4xl px-4 pb-14 sm:px-6">
                        <section className="rounded-2xl border border-[color-mix(in_oklab,var(--state-info)_28%,var(--border))] bg-[color-mix(in_oklab,var(--card)_90%,transparent)] p-6 shadow-[0_24px_70px_-40px_color-mix(in_oklab,var(--foreground)_35%,transparent)] backdrop-blur-md sm:p-8">
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color-mix(in_oklab,var(--state-info)_74%,var(--muted-foreground))]">
                                Legal ORVAE
                            </p>
                            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Política de privacidad
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Ultima actualización: {new Date().toLocaleDateString('es-PE')}
                            </p>

                            <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground">
                                <section>
                                    <h2 className="text-base font-semibold text-foreground">1. Información que recopilamos</h2>
                                    <p>
                                        Podemos recopilar datos de identificación y contacto como nombre, correo, documento,
                                        teléfono, datos de facturación y registros técnicos necesarios para la prestación del
                                        servicio.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">2. Finalidad del tratamiento</h2>
                                    <p>
                                        Usamos la información para crear y administrar cuentas, brindar soporte, gestionar
                                        pagos, emitir comprobantes, prevenir fraudes y mejorar la seguridad y la calidad del
                                        sistema.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">3. Conservación y seguridad</h2>
                                    <p>
                                        Conservamos los datos durante el tiempo necesario para cumplir con obligaciones
                                        contractuales y legales. Aplicamos medidas de seguridad técnicas y organizativas para
                                        proteger la información frente a accesos no autorizados.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">4. Derechos del titular</h2>
                                    <p>
                                        Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus
                                        datos, según la normativa aplicable, escribiendo a nuestro canal oficial de contacto.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-base font-semibold text-foreground">5. Cambios a esta política</h2>
                                    <p>
                                        Esta política puede actualizarse. Publicaremos cualquier cambio en esta misma página
                                        con su fecha de actualización.
                                    </p>
                                </section>
                            </div>
                        </section>
                    </main>

                    <WelcomeFooter />
                    <ScrollToTopButton />
                </div>
            </div>
        </>
    );
}
