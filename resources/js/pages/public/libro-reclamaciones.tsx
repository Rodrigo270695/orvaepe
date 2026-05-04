import { Form, usePage } from '@inertiajs/react';
import { FileWarning, User } from 'lucide-react';
import { useState } from 'react';

import SeoHead from '@/components/seo/SeoHead';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import InputError from '@/components/input-error';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import { inertiaFormProps } from '@/lib/inertia-form-props';
import { cn } from '@/lib/utils';
import { ORVAE_CONTACT_EMAIL, ORVAE_LEGAL_NAME, ORVAE_RUC } from '@/marketing/orvaeContact';

type PageProps = {
    canRegister?: boolean;
    flash?: { status?: string | null; toast?: unknown };
};

const inputClassName = cn(
    'w-full rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)]',
    'bg-[color-mix(in_oklab,var(--background)_88%,transparent)] px-4 py-3 text-sm text-[var(--foreground)]',
    'placeholder:text-[var(--muted-foreground)]',
    'focus-visible:border-[color-mix(in_oklab,var(--primary)_45%,var(--border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--primary)_35%,transparent)]',
);

export default function LibroReclamacionesPage() {
    const { canRegister = true, flash } = usePage<PageProps>().props;
    const status = flash?.status;
    const [isMinor, setIsMinor] = useState(false);

    return (
        <>
            <SeoHead
                title="Libro de reclamaciones | ORVAE"
                description={`Registro de reclamos y quejas — ${ORVAE_LEGAL_NAME}, RUC ${ORVAE_RUC}. Canal integrado en el sitio ORVAE.`}
                canonicalPath="/libro-de-reclamaciones"
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Libro de reclamaciones', path: '/libro-de-reclamaciones' },
                ]}
            />

            <div className="landing-page relative min-h-screen text-foreground">
                <GeometricBackground />
                <div className="landing-grain absolute inset-0 z-0" aria-hidden />
                <div className="relative z-[1]">
                    <MarketingUnifiedNavbar canRegister={canRegister} />
                    <div className="h-20 shrink-0" aria-hidden />
                    <AppearanceFloatingRailToggle />

                    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
                        <header className="mb-8">
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color-mix(in_oklab,var(--state-alert)_74%,var(--muted-foreground))]">
                                Atención al consumidor
                            </p>
                            <h1 className="mt-3 flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                <FileWarning
                                    className="size-9 shrink-0 text-[color-mix(in_oklab,var(--state-alert)_85%,var(--foreground))]"
                                    aria-hidden
                                />
                                Libro de reclamaciones virtual
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {ORVAE_LEGAL_NAME}, RUC {ORVAE_RUC}. Este formulario forma parte de nuestro sitio web y
                                registra tu reclamo o queja para su atención interna. Para orientación sobre el
                                procedimiento ante el Estado puedes consultar los canales del{' '}
                                <a
                                    href="https://www.indecopi.gob.pe/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))] underline underline-offset-4"
                                >
                                    INDECOPI
                                </a>
                                .
                            </p>
                        </header>

                        <section
                            className="rounded-2xl border border-[color-mix(in_oklab,var(--state-alert)_30%,var(--border))] bg-[color-mix(in_oklab,var(--card)_92%,transparent)] p-5 shadow-[0_24px_70px_-40px_color-mix(in_oklab,var(--foreground)_30%,transparent)] backdrop-blur-md sm:p-8"
                            aria-labelledby="form-reclamo"
                        >
                            {status ? (
                                <div
                                    role="status"
                                    className="mb-6 rounded-xl border px-4 py-3 text-sm text-[var(--foreground)]"
                                    style={{
                                        borderColor:
                                            'color-mix(in oklab, var(--state-success) 38%, var(--border))',
                                        background:
                                            'color-mix(in oklab, var(--state-success) 12%, transparent)',
                                    }}
                                >
                                    {status}
                                </div>
                            ) : null}

                            <h2 id="form-reclamo" className="sr-only">
                                Formulario de reclamo
                            </h2>

                            <Form
                                {...inertiaFormProps({
                                    url: '/libro-de-reclamaciones',
                                    method: 'post',
                                })}
                                className="space-y-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="hidden" aria-hidden>
                                            <label htmlFor="website">No completar</label>
                                            <input
                                                id="website"
                                                type="text"
                                                name="website"
                                                tabIndex={-1}
                                                autoComplete="off"
                                                defaultValue=""
                                            />
                                        </div>

                                        <input type="hidden" name="is_minor" value={isMinor ? '1' : '0'} />

                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="full_name"
                                                    className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    <User className="size-3.5" aria-hidden />
                                                    Nombre completo
                                                </label>
                                                <input
                                                    id="full_name"
                                                    name="full_name"
                                                    type="text"
                                                    required
                                                    autoComplete="name"
                                                    className={inputClassName}
                                                />
                                                <InputError message={errors.full_name} />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="document_type"
                                                    className="mb-2 block text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    Tipo de documento
                                                </label>
                                                <select
                                                    id="document_type"
                                                    name="document_type"
                                                    required
                                                    className={inputClassName}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>
                                                        Selecciona…
                                                    </option>
                                                    <option value="dni">DNI</option>
                                                    <option value="ce">Carné de extranjería</option>
                                                    <option value="pasaporte">Pasaporte</option>
                                                    <option value="ruc">RUC</option>
                                                    <option value="otro">Otro</option>
                                                </select>
                                                <InputError message={errors.document_type} />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="document_number"
                                                    className="mb-2 block text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    Número de documento
                                                </label>
                                                <input
                                                    id="document_number"
                                                    name="document_number"
                                                    type="text"
                                                    required
                                                    autoComplete="off"
                                                    className={inputClassName}
                                                />
                                                <InputError message={errors.document_number} />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="mb-2 block text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    Correo electrónico
                                                </label>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    autoComplete="email"
                                                    className={inputClassName}
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="phone"
                                                    className="mb-2 block text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    Teléfono (opcional)
                                                </label>
                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    autoComplete="tel"
                                                    className={inputClassName}
                                                />
                                                <InputError message={errors.phone} />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="address"
                                                    className="mb-2 block text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    Domicilio
                                                </label>
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    required
                                                    rows={3}
                                                    className={inputClassName}
                                                    placeholder="Distrito, ciudad y referencia"
                                                />
                                                <InputError message={errors.address} />
                                            </div>

                                            <div className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-[color-mix(in_oklab,var(--border)_65%,transparent)] bg-background/50 p-4">
                                                <input
                                                    id="is_minor_toggle"
                                                    type="checkbox"
                                                    checked={isMinor}
                                                    onChange={(e) => setIsMinor(e.target.checked)}
                                                    className="mt-1 size-4 rounded border-border"
                                                />
                                                <label
                                                    htmlFor="is_minor_toggle"
                                                    className="text-sm leading-relaxed text-muted-foreground"
                                                >
                                                    Declaro ser menor de edad (se solicitará datos del padre, madre o
                                                    tutor a cargo).
                                                </label>
                                            </div>

                                            {isMinor ? (
                                                <div className="sm:col-span-2">
                                                    <label
                                                        htmlFor="representative_full_name"
                                                        className="mb-2 block text-xs font-semibold text-[var(--foreground)]"
                                                    >
                                                        Nombre del padre, madre o tutor
                                                    </label>
                                                    <input
                                                        id="representative_full_name"
                                                        name="representative_full_name"
                                                        type="text"
                                                        required={isMinor}
                                                        className={inputClassName}
                                                    />
                                                    <InputError message={errors.representative_full_name} />
                                                </div>
                                            ) : null}

                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="product_service_description"
                                                    className="mb-2 block text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    Producto o servicio contratado / materia del reclamo
                                                </label>
                                                <input
                                                    id="product_service_description"
                                                    name="product_service_description"
                                                    type="text"
                                                    required
                                                    maxLength={512}
                                                    className={inputClassName}
                                                    placeholder="Ej. Licencia Windows 11, suscripción SaaS, servicio de correo…"
                                                />
                                                <InputError message={errors.product_service_description} />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="claim_detail"
                                                    className="mb-2 block text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    Detalle del reclamo (hechos)
                                                </label>
                                                <textarea
                                                    id="claim_detail"
                                                    name="claim_detail"
                                                    required
                                                    rows={6}
                                                    className={inputClassName}
                                                />
                                                <InputError message={errors.claim_detail} />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="request_detail"
                                                    className="mb-2 block text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    Pedido concreto
                                                </label>
                                                <textarea
                                                    id="request_detail"
                                                    name="request_detail"
                                                    required
                                                    rows={4}
                                                    className={inputClassName}
                                                />
                                                <InputError message={errors.request_detail} />
                                            </div>

                                            <div className="sm:col-span-2 flex items-start gap-3">
                                                <input
                                                    id="declares_truthful"
                                                    name="declares_truthful"
                                                    type="checkbox"
                                                    value="1"
                                                    required
                                                    className="mt-1 size-4 rounded border-border"
                                                />
                                                <label
                                                    htmlFor="declares_truthful"
                                                    className="text-sm leading-relaxed text-muted-foreground"
                                                >
                                                    Declaro que los datos consignados son veraces y que la descripción del
                                                    reclamo refleja mi conocimiento de los hechos.
                                                </label>
                                            </div>
                                            <InputError message={errors.declares_truthful} />

                                            <div className="sm:col-span-2">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="inline-flex w-full items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--state-alert)_88%,#713f12)] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
                                                >
                                                    {processing ? 'Enviando…' : 'Registrar reclamo'}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </section>

                        <p className="mt-8 text-center text-xs text-muted-foreground">
                            También puedes escribirnos a{' '}
                            <a
                                href={`mailto:${ORVAE_CONTACT_EMAIL}`}
                                className="font-medium text-[color-mix(in_oklab,var(--state-info)_86%,var(--foreground))] underline underline-offset-4"
                            >
                                {ORVAE_CONTACT_EMAIL}
                            </a>
                            .
                        </p>
                    </main>

                    <WelcomeFooter />
                    <ScrollToTopButton />
                </div>
            </div>
        </>
    );
}
