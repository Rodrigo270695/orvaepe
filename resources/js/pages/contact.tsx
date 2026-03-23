import { Form, usePage } from '@inertiajs/react';
import {
    Boxes,
    Building2,
    Code2,
    FileSpreadsheet,
    HelpCircle,
    KeyRound,
    Layers,
    Mail,
    MessageSquare,
    Package,
    Phone,
    User,
} from 'lucide-react';
import { type ComponentType, useEffect, useState } from 'react';

import MarketingLayout from '@/components/marketing/MarketingLayout';
import { marketingSeo } from '@/marketing/seoCopy';
import InputError from '@/components/input-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import { inertiaFormProps } from '@/lib/inertia-form-props';
import { cn } from '@/lib/utils';

type ProductOption = { value: string; label: string };

type PageProps = {
    canRegister?: boolean;
    productOptions?: ProductOption[];
    flash?: { status?: string | null; toast?: unknown };
};

const inputClassName = cn(
    'w-full rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)]',
    'bg-[color-mix(in_oklab,var(--background)_88%,transparent)] px-4 py-3 text-sm text-[var(--foreground)]',
    'placeholder:text-[var(--muted-foreground)]',
    'focus-visible:border-[color-mix(in_oklab,var(--primary)_45%,var(--border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--primary)_35%,transparent)]',
);

const interestIconClass = 'size-4 shrink-0 text-[color-mix(in_oklab,var(--muted-foreground)_90%,var(--foreground))]';

const PRODUCT_INTEREST_ICONS: Record<string, ComponentType<{ className?: string }>> = {
    software: Layers,
    licencias: KeyRound,
    servicios: Boxes,
    sunat: FileSpreadsheet,
    custom: Code2,
    other: HelpCircle,
};

const selectTriggerClassName = cn(
    'h-auto min-h-[2.75rem] w-full max-w-none rounded-xl border',
    'border-[color-mix(in_oklab,var(--border)_70%,transparent)]',
    'bg-[color-mix(in_oklab,var(--background)_88%,transparent)]',
    'px-4 py-3 text-left text-sm font-normal text-[var(--foreground)] shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--foreground)_5%,transparent)]',
    'transition-[border-color,box-shadow,background-color] duration-200',
    'hover:border-[color-mix(in_oklab,var(--border)_88%,transparent)] hover:bg-[color-mix(in_oklab,var(--muted)_12%,transparent)]',
    'focus-visible:border-[color-mix(in_oklab,var(--primary)_50%,var(--border))] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklab,var(--primary)_28%,transparent)]',
    'data-[placeholder]:text-[var(--muted-foreground)]',
    '[&_svg:not([class*="text-"])]:text-[var(--muted-foreground)]',
);

const selectContentClassName = cn(
    'z-[100] overflow-hidden rounded-xl border',
    'border-[color-mix(in_oklab,var(--border)_65%,transparent)]',
    'bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] p-1.5 shadow-[0_16px_48px_-12px_color-mix(in_oklab,var(--foreground)_35%,transparent)] backdrop-blur-md',
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
);

const selectItemClassName = cn(
    'relative cursor-pointer rounded-lg py-2.5 pr-9 pl-3 text-sm outline-none transition-colors',
    'text-[var(--foreground)]',
    'focus:bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] focus:text-[var(--foreground)]',
    'data-[highlighted]:bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] data-[highlighted]:text-[var(--foreground)]',
    'data-[state=checked]:bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]',
);

export default function Contact() {
    const { productOptions = [], flash } = usePage<PageProps>().props;
    const status = flash?.status;
    const [productInterest, setProductInterest] = useState('');

    useEffect(() => {
        if (status) {
            setProductInterest('');
        }
    }, [status]);

    return (
        <MarketingLayout
            title={marketingSeo.contacto.title}
            description={marketingSeo.contacto.description}
            canonicalPath="/contacto"
            breadcrumbs={[
                { name: 'Inicio', path: '/' },
                { name: 'Contacto', path: '/contacto' },
            ]}
        >
            <div className="relative overflow-hidden border-b border-[color-mix(in_oklab,var(--border)_50%,transparent)]">
                <GeometricBackground variant="grid-dots" opacity={0.06} />
                <div className="relative z-10 mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
                    <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                        Contacto
                    </p>
                    <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                        Cuéntanos qué necesitas
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                        Deja tu mensaje, el producto o servicio que te interesa y datos de contacto. Te
                        responderemos por correo lo antes posible.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
                {status ? (
                    <div
                        role="status"
                        className="mb-8 rounded-xl border border-[color-mix(in_oklab,var(--primary)_35%,var(--border))] bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] px-4 py-3 text-sm text-[var(--foreground)]"
                    >
                        {status}
                    </div>
                ) : null}

                <Form
                    {...inertiaFormProps({
                        url: '/contacto',
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

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]"
                                    >
                                        <User className="size-3.5 text-[var(--muted-foreground)]" />
                                        Nombre y apellido
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        className={inputClassName}
                                        placeholder="Tu nombre"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]"
                                    >
                                        <Mail className="size-3.5 text-[var(--muted-foreground)]" />
                                        Correo electrónico
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className={inputClassName}
                                        placeholder="tu@empresa.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]"
                                    >
                                        <Phone className="size-3.5 text-[var(--muted-foreground)]" />
                                        Teléfono / WhatsApp
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        className={inputClassName}
                                        placeholder="Opcional"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div>
                                    <label
                                        htmlFor="company"
                                        className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]"
                                    >
                                        <Building2 className="size-3.5 text-[var(--muted-foreground)]" />
                                        Empresa o RUC
                                    </label>
                                    <input
                                        id="company"
                                        name="company"
                                        type="text"
                                        autoComplete="organization"
                                        className={inputClassName}
                                        placeholder="Opcional"
                                    />
                                    <InputError message={errors.company} />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="product_interest"
                                    className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]"
                                >
                                    <Package className="size-3.5 text-[var(--muted-foreground)]" />
                                    ¿Qué producto o servicio te interesa?
                                </label>
                                <input type="hidden" name="product_interest" value={productInterest} />
                                <Select
                                    value={productInterest === '' ? undefined : productInterest}
                                    onValueChange={setProductInterest}
                                >
                                    <SelectTrigger
                                        id="product_interest"
                                        className={cn(
                                            selectTriggerClassName,
                                            errors.product_interest &&
                                                'border-[color-mix(in_oklab,var(--destructive)_55%,var(--border))] ring-2 ring-[color-mix(in_oklab,var(--destructive)_25%,transparent)]',
                                        )}
                                        aria-invalid={errors.product_interest ? 'true' : undefined}
                                        aria-required
                                    >
                                        <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                                            {productInterest ? (
                                                (() => {
                                                    const Icon =
                                                        PRODUCT_INTEREST_ICONS[productInterest] ??
                                                        Package;
                                                    return (
                                                        <Icon
                                                            className={interestIconClass}
                                                            aria-hidden
                                                        />
                                                    );
                                                })()
                                            ) : (
                                                <Package
                                                    className="size-4 shrink-0 opacity-35"
                                                    aria-hidden
                                                />
                                            )}
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
                                            const Icon =
                                                PRODUCT_INTEREST_ICONS[o.value] ?? Package;
                                            return (
                                                <SelectItem
                                                    key={o.value}
                                                    value={o.value}
                                                    textValue={o.label}
                                                    className={selectItemClassName}
                                                >
                                                    <span className="flex items-start gap-2.5">
                                                        <Icon
                                                            className="mt-0.5 size-4 shrink-0 opacity-90"
                                                            aria-hidden
                                                        />
                                                        <span className="min-w-0 flex-1 leading-snug">
                                                            {o.label}
                                                        </span>
                                                    </span>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                                    Elige la opción que mejor describa tu consulta; podemos afinar el alcance por
                                    correo.
                                </p>
                                <InputError message={errors.product_interest} />
                            </div>

                            <div>
                                <label
                                    htmlFor="message"
                                    className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]"
                                >
                                    <MessageSquare className="size-3.5 text-[var(--muted-foreground)]" />
                                    Mensaje
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={6}
                                    className={cn(inputClassName, 'min-h-[10rem] resize-y')}
                                    placeholder="Describe tu necesidad, plazos, volumen de usuarios o cualquier detalle útil."
                                />
                                <InputError message={errors.message} />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing || !productInterest}
                                    className={cn(
                                        'inline-flex cursor-pointer items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold',
                                        'bg-[var(--primary)] text-[var(--primary-foreground)]',
                                        'shadow-[0_6px_24px_-8px_color-mix(in_oklab,var(--primary)_55%,transparent)]',
                                        'transition-[transform,filter] duration-200 hover:brightness-105 active:scale-[0.99]',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                        'disabled:pointer-events-none disabled:opacity-60',
                                    )}
                                >
                                    {processing ? 'Enviando…' : 'Enviar mensaje'}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </MarketingLayout>
    );
}
