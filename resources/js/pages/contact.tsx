import { Form, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Boxes,
    CheckCircle2,
    Code2,
    FileSpreadsheet,
    HelpCircle,
    KeyRound,
    Layers,
    Mail,
    MapPin,
    MessageCircle,
    Package,
    Phone,
    Send,
} from 'lucide-react';
import { useState } from 'react';
import type { ComponentType } from 'react';

import '@/components/checkout/checkout-orvae.css';
import '@/components/welcome/home-orvae.css';

import InputError from '@/components/input-error';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import SeoHead from '@/components/seo/SeoHead';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import HomeMotion from '@/components/welcome/HomeMotion';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import { inertiaFormProps } from '@/lib/inertia-form-props';
import { cn } from '@/lib/utils';
import { buildWhatsAppHref, WHATSAPP_E164 } from '@/lib/whatsapp';
import {
    ORVAE_CONTACT_EMAIL,
    ORVAE_FISCAL_ADDRESS,
    ORVAE_LEGAL_NAME,
    ORVAE_PUBLIC_PHONE_DISPLAY,
    ORVAE_RUC,
} from '@/marketing/orvaeContact';
import { marketingSeo } from '@/marketing/seoCopy';

type ProductOption = { value: string; label: string };

type PageProps = {
    canRegister?: boolean;
    productOptions?: ProductOption[];
    flash?: { status?: string | null; toast?: unknown };
    contact?: { whatsapp_e164?: string; fiscal_address?: string; public_phone_display?: string };
};

const FIELD_LABELS: Record<string, string> = {
    name: 'Nombre y apellido',
    email: 'Correo electrónico',
    phone: 'Teléfono / WhatsApp',
    company: 'Empresa o RUC',
    product_interest: 'Producto o servicio',
    message: 'Mensaje',
};

const PRODUCT_INTEREST_ICONS: Record<string, ComponentType<{ className?: string }>> = {
    software: Layers,
    licencias: KeyRound,
    servicios: Boxes,
    sunat: FileSpreadsheet,
    custom: Code2,
    other: HelpCircle,
};

const labelClass = 'mb-2 block text-sm font-semibold text-foreground';

const selectTriggerClassName = cn(
    'co-field h-auto min-h-12 w-full max-w-none text-left font-normal shadow-none',
    'data-[placeholder]:text-[var(--muted-foreground)]',
    '[&_svg:not([class*="text-"])]:text-[var(--muted-foreground)]',
);

const selectContentClassName = cn(
    'z-[100] overflow-hidden rounded-xl border',
    'border-[color-mix(in_oklab,var(--border)_65%,transparent)]',
    'bg-[color-mix(in_oklab,var(--card)_96%,var(--background))] p-1.5 shadow-[0_16px_48px_-12px_color-mix(in_oklab,var(--foreground)_35%,transparent)] backdrop-blur-md',
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
);

const selectItemClassName = cn(
    'relative min-h-11 cursor-pointer rounded-lg py-2.5 pr-9 pl-3 text-sm outline-none transition-colors',
    'text-[var(--foreground)]',
    'focus:bg-[color-mix(in_oklab,#ea580c_12%,transparent)] focus:text-[var(--foreground)]',
    'data-[highlighted]:bg-[color-mix(in_oklab,#ea580c_12%,transparent)] data-[highlighted]:text-[var(--foreground)]',
    'data-[state=checked]:bg-[color-mix(in_oklab,#ea580c_8%,transparent)]',
);

const NEXT_STEPS = [
    { title: 'Leemos tu mensaje', text: 'Revisamos tu caso y vemos qué solución encaja.' },
    { title: 'Afinamos el alcance', text: 'Te escribimos por correo o WhatsApp con preguntas puntuales.' },
    { title: 'Demo o propuesta', text: 'Te mostramos el sistema funcionando o te enviamos la cotización.' },
] as const;

function Optional() {
    return <span className="ml-1 text-xs font-normal text-muted-foreground">(opcional)</span>;
}

export default function Contact() {
    const { productOptions = [], flash, canRegister = true, contact } = usePage<PageProps>().props;
    const fiscalAddress = contact?.fiscal_address?.trim() || ORVAE_FISCAL_ADDRESS;
    const phoneDisplay = contact?.public_phone_display?.trim() || ORVAE_PUBLIC_PHONE_DISPLAY;
    const whatsappE164 = contact?.whatsapp_e164?.replace(/\D/g, '') || WHATSAPP_E164;
    const whatsappHref = buildWhatsAppHref(
        whatsappE164,
        'Hola ORVAE, vengo de la página de contacto y quiero más información.',
    );
    const status = flash?.status;
    const [productInterest, setProductInterest] = useState('');

    const channels = [
        {
            icon: MessageCircle,
            title: 'WhatsApp',
            value: phoneDisplay,
            hint: 'La vía más rápida',
            href: whatsappHref,
            external: true,
            color: '#0e7266',
        },
        {
            icon: Mail,
            title: 'Correo de ventas',
            value: ORVAE_CONTACT_EMAIL,
            hint: 'Propuestas y cotizaciones',
            href: `mailto:${ORVAE_CONTACT_EMAIL}`,
            external: false,
            color: '#2563eb',
        },
        {
            icon: Phone,
            title: 'Llámanos',
            value: phoneDisplay,
            hint: 'Atención directa',
            href: `tel:+${whatsappE164}`,
            external: false,
            color: '#c2410c',
        },
    ] as const;

    return (
        <>
            <SeoHead
                title={marketingSeo.contacto.title}
                description={marketingSeo.contacto.description}
                canonicalPath="/contacto"
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Contacto', path: '/contacto' },
                ]}
            />

            <a
                href="#contacto-form"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:shadow-lg"
            >
                Ir al formulario de contacto
            </a>

            <div className="landing-page relative min-h-screen text-foreground">
                <div className="landing-grain absolute inset-0 z-0" aria-hidden />
                <div className="relative z-[1]">
                    <MarketingUnifiedNavbar canRegister={canRegister} />
                    <div className="h-[5.5rem] shrink-0" aria-hidden />
                    <AppearanceFloatingRailToggle />

                    <HomeMotion>
                        <main className="co-hero relative overflow-hidden">
                            <div
                                className="home-blob home-blob--pulse absolute -right-24 top-0 size-[26rem] opacity-60"
                                data-parallax="10"
                                style={{ background: 'radial-gradient(circle, color-mix(in oklab, #ea580c 45%, transparent) 0%, transparent 70%)' }}
                                aria-hidden
                            />
                            <div
                                className="home-blob home-blob--pulse absolute -left-24 bottom-10 size-[22rem] opacity-50"
                                data-parallax="-8"
                                style={{
                                    background: 'radial-gradient(circle, color-mix(in oklab, #2563eb 40%, transparent) 0%, transparent 70%)',
                                    animationDelay: '1.6s',
                                }}
                                aria-hidden
                            />

                            <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 pb-20 pt-10 sm:px-6 md:pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                                <div>
                                    <p className="inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--o-amber)_35%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c2410c] shadow-sm backdrop-blur-md dark:text-[#fb923c]">
                                        Contacto · Chiclayo, Perú
                                    </p>
                                    <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                                        Hablemos de
                                        <span className="mt-1 block bg-gradient-to-br from-foreground via-[var(--o-amber)] to-[var(--o-tech)] bg-clip-text text-transparent dark:from-[var(--o-cream2)]">
                                            tu proyecto.
                                        </span>
                                    </h1>
                                    <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted-foreground">
                                        Demos de <strong className="font-semibold text-foreground">VetSaaS</strong> y{' '}
                                        <strong className="font-semibold text-foreground">TallerSaaS</strong>, licencias,
                                        facturación SUNAT o software a medida. Elige el canal que prefieras.
                                    </p>

                                    <ul className="mt-8 space-y-3" aria-label="Canales de contacto">
                                        {channels.map(({ icon: Icon, title, value, hint, href, external, color }) => (
                                            <li key={title}>
                                                <a
                                                    href={href}
                                                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                                    className="home-glass group flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl px-4 py-3 transition-colors hover:border-[color-mix(in_oklab,#ea580c_35%,var(--border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                                                    data-magnetic
                                                >
                                                    <span
                                                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                                                        style={{ background: color }}
                                                        aria-hidden
                                                    >
                                                        <Icon className="size-5" />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            {title} · {hint}
                                                        </span>
                                                        <span className="block truncate text-base font-bold text-foreground">
                                                            {value}
                                                        </span>
                                                    </span>
                                                    <ArrowRight
                                                        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                                                        aria-hidden
                                                    />
                                                    {external ? <span className="sr-only">(abre en una pestaña nueva)</span> : null}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-8">
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                            Qué pasa después
                                        </h2>
                                        <ol className="mt-4 space-y-4">
                                            {NEXT_STEPS.map((step, i) => (
                                                <li key={step.title} className="flex gap-3.5">
                                                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklab,#ea580c_40%,var(--border))] bg-background text-sm font-bold text-[#c2410c] dark:text-[#fb923c]">
                                                        {i + 1}
                                                    </span>
                                                    <span>
                                                        <span className="block text-sm font-bold text-foreground">{step.title}</span>
                                                        <span className="block text-sm leading-relaxed text-muted-foreground">
                                                            {step.text}
                                                        </span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    <address className="mt-8 flex gap-3 rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--foreground)_14%,var(--border))] px-4 py-3.5 text-sm not-italic leading-relaxed text-muted-foreground">
                                        <MapPin className="mt-0.5 size-4 shrink-0 text-[#2563eb]" aria-hidden />
                                        <span>
                                            <span className="block font-semibold text-foreground">
                                                {ORVAE_LEGAL_NAME} · RUC {ORVAE_RUC}
                                            </span>
                                            {fiscalAddress}
                                        </span>
                                    </address>
                                </div>

                                <section
                                    id="contacto-form"
                                    aria-labelledby="contact-form-title"
                                    className="co-glass scroll-mt-28 self-start overflow-hidden rounded-3xl"
                                >
                                    <div className="co-line" aria-hidden />
                                    <div className="p-6 sm:p-8">
                                        <h2 id="contact-form-title" className="font-display text-2xl font-bold tracking-tight text-foreground">
                                            Escríbenos
                                        </h2>
                                        <p className="mt-1.5 text-sm text-muted-foreground">
                                            Los campos marcados con <span aria-hidden>*</span>
                                            <span className="sr-only">asterisco</span> son obligatorios.
                                        </p>

                                        {status ? (
                                            <div
                                                role="status"
                                                className="co-pop mt-6 flex items-start gap-3 rounded-2xl border border-[color-mix(in_oklab,#0d9488_38%,var(--border))] bg-[color-mix(in_oklab,#0d9488_9%,var(--background))] px-4 py-3.5 text-sm text-foreground"
                                            >
                                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#0f766e]" aria-hidden />
                                                <span>{status}</span>
                                            </div>
                                        ) : null}

                                        <Form
                                            {...inertiaFormProps({
                                                url: '/contacto',
                                                method: 'post',
                                            })}
                                            onSuccess={() => setProductInterest('')}
                                            className="mt-6 space-y-5"
                                        >
                                            {({ processing, errors }) => {
                                                const errorKeys = Object.keys(errors).filter((k) => errors[k as keyof typeof errors]);

                                                return (
                                                    <>
                                                        {errorKeys.length > 0 ? (
                                                            <div
                                                                role="alert"
                                                                className="rounded-2xl border border-[color-mix(in_oklab,var(--destructive)_40%,var(--border))] bg-[color-mix(in_oklab,var(--destructive)_7%,var(--background))] px-4 py-3.5 text-sm"
                                                            >
                                                                <p className="font-semibold text-foreground">Revisa estos campos:</p>
                                                                <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                                                                    {errorKeys.map((key) => (
                                                                        <li key={key}>
                                                                            <a
                                                                                href={`#${key}`}
                                                                                className="text-foreground underline underline-offset-4"
                                                                            >
                                                                                {FIELD_LABELS[key] ?? key}
                                                                            </a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ) : null}

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

                                                        <div className="grid gap-5 sm:grid-cols-2">
                                                            <div>
                                                                <label htmlFor="name" className={labelClass}>
                                                                    Nombre y apellido <span aria-hidden className="text-[#c2410c]">*</span>
                                                                </label>
                                                                <input
                                                                    id="name"
                                                                    name="name"
                                                                    type="text"
                                                                    required
                                                                    autoComplete="name"
                                                                    aria-invalid={errors.name ? 'true' : undefined}
                                                                    className="co-field"
                                                                    placeholder="Tu nombre"
                                                                />
                                                                <InputError message={errors.name} />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="email" className={labelClass}>
                                                                    Correo electrónico <span aria-hidden className="text-[#c2410c]">*</span>
                                                                </label>
                                                                <input
                                                                    id="email"
                                                                    name="email"
                                                                    type="email"
                                                                    required
                                                                    autoComplete="email"
                                                                    inputMode="email"
                                                                    aria-invalid={errors.email ? 'true' : undefined}
                                                                    className="co-field"
                                                                    placeholder="tu@empresa.com"
                                                                />
                                                                <InputError message={errors.email} />
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-5 sm:grid-cols-2">
                                                            <div>
                                                                <label htmlFor="phone" className={labelClass}>
                                                                    Teléfono / WhatsApp
                                                                    <Optional />
                                                                </label>
                                                                <input
                                                                    id="phone"
                                                                    name="phone"
                                                                    type="tel"
                                                                    autoComplete="tel"
                                                                    inputMode="tel"
                                                                    aria-invalid={errors.phone ? 'true' : undefined}
                                                                    className="co-field"
                                                                    placeholder="999 999 999"
                                                                />
                                                                <InputError message={errors.phone} />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="company" className={labelClass}>
                                                                    Empresa o RUC
                                                                    <Optional />
                                                                </label>
                                                                <input
                                                                    id="company"
                                                                    name="company"
                                                                    type="text"
                                                                    autoComplete="organization"
                                                                    aria-invalid={errors.company ? 'true' : undefined}
                                                                    className="co-field"
                                                                    placeholder="Nombre comercial o RUC"
                                                                />
                                                                <InputError message={errors.company} />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label htmlFor="product_interest" className={labelClass}>
                                                                ¿Qué te interesa? <span aria-hidden className="text-[#c2410c]">*</span>
                                                            </label>
                                                            <input type="hidden" name="product_interest" value={productInterest} />
                                                            <Select
                                                                value={productInterest === '' ? undefined : productInterest}
                                                                onValueChange={setProductInterest}
                                                            >
                                                                <SelectTrigger
                                                                    id="product_interest"
                                                                    className={selectTriggerClassName}
                                                                    aria-invalid={errors.product_interest ? 'true' : undefined}
                                                                    aria-required
                                                                    aria-describedby="product_interest_hint"
                                                                >
                                                                    <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                                                                        {(() => {
                                                                            const Icon = productInterest
                                                                                ? (PRODUCT_INTEREST_ICONS[productInterest] ?? Package)
                                                                                : Package;

                                                                            return (
                                                                                <Icon
                                                                                    className={cn(
                                                                                        'size-4 shrink-0',
                                                                                        productInterest ? 'text-[#c2410c] dark:text-[#fb923c]' : 'text-muted-foreground',
                                                                                    )}
                                                                                    aria-hidden
                                                                                />
                                                                            );
                                                                        })()}
                                                                        <SelectValue placeholder="Selecciona una opción" />
                                                                    </span>
                                                                </SelectTrigger>
                                                                <SelectContent
                                                                    className={selectContentClassName}
                                                                    position="popper"
                                                                    sideOffset={8}
                                                                    align="start"
                                                                >
                                                                    {productOptions.map((o) => {
                                                                        const Icon = PRODUCT_INTEREST_ICONS[o.value] ?? Package;

                                                                        return (
                                                                            <SelectItem
                                                                                key={o.value}
                                                                                value={o.value}
                                                                                textValue={o.label}
                                                                                className={selectItemClassName}
                                                                            >
                                                                                <span className="flex items-start gap-2.5">
                                                                                    <Icon className="mt-0.5 size-4 shrink-0 opacity-90" aria-hidden />
                                                                                    <span className="min-w-0 flex-1 leading-snug">{o.label}</span>
                                                                                </span>
                                                                            </SelectItem>
                                                                        );
                                                                    })}
                                                                </SelectContent>
                                                            </Select>
                                                            <p id="product_interest_hint" className="mt-1.5 text-xs text-muted-foreground">
                                                                Elige la opción más cercana; el detalle lo afinamos después.
                                                            </p>
                                                            <InputError message={errors.product_interest} />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="message" className={labelClass}>
                                                                Mensaje <span aria-hidden className="text-[#c2410c]">*</span>
                                                            </label>
                                                            <textarea
                                                                id="message"
                                                                name="message"
                                                                required
                                                                rows={5}
                                                                aria-invalid={errors.message ? 'true' : undefined}
                                                                className="co-field min-h-[9rem] resize-y"
                                                                placeholder="Cuéntanos tu rubro, cuántas personas usarán el sistema y para cuándo lo necesitas."
                                                            />
                                                            <InputError message={errors.message} />
                                                        </div>

                                                        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                                                            <button
                                                                type="submit"
                                                                disabled={processing || !productInterest}
                                                                className="co-cta w-full sm:w-auto"
                                                            >
                                                                <Send className="size-4" aria-hidden />
                                                                {processing ? 'Enviando…' : 'Enviar mensaje'}
                                                            </button>
                                                            {!productInterest ? (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Selecciona qué te interesa para enviar.
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    </>
                                                );
                                            }}
                                        </Form>
                                    </div>
                                </section>
                            </div>

                            <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Link
                                        href="/software/VETSAAS"
                                        className="home-glass group flex min-h-20 cursor-pointer items-center justify-between gap-4 rounded-2xl px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
                                    >
                                        <span>
                                            <span className="block text-xs font-semibold uppercase tracking-wider text-[#0f766e] dark:text-[#2dd4bf]">
                                                Clínicas veterinarias
                                            </span>
                                            <span className="mt-0.5 block text-lg font-bold text-foreground">Ver planes de VetSaaS</span>
                                        </span>
                                        <ArrowRight className="size-5 text-[#0f766e] transition-transform group-hover:translate-x-1 dark:text-[#2dd4bf]" aria-hidden />
                                    </Link>
                                    <Link
                                        href="/software/TALLERSAAS"
                                        className="home-glass group flex min-h-20 cursor-pointer items-center justify-between gap-4 rounded-2xl px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                                    >
                                        <span>
                                            <span className="block text-xs font-semibold uppercase tracking-wider text-[#c2410c] dark:text-[#fb923c]">
                                                Talleres mecánicos
                                            </span>
                                            <span className="mt-0.5 block text-lg font-bold text-foreground">Ver planes de TallerSaaS</span>
                                        </span>
                                        <ArrowRight className="size-5 text-[#c2410c] transition-transform group-hover:translate-x-1 dark:text-[#fb923c]" aria-hidden />
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </HomeMotion>

                    <ScrollReveal direction="up">
                        <WelcomeFooter />
                    </ScrollReveal>
                    <ScrollToTopButton />
                </div>
            </div>
        </>
    );
}
