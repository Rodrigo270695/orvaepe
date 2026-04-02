import { Link } from '@inertiajs/react';
import { ArrowRight, Boxes, Code2, KeyRound, Wrench } from 'lucide-react';
import type { ComponentType } from 'react';

import SeoHead from '@/components/seo/SeoHead';

type ActionItem = {
    id: string;
    label: string;
    subtitle: string;
    href: string;
    Icon: ComponentType<{ className?: string }>;
};

const PUBLIC_PATH = '/redesorvae';

const actions: ActionItem[] = [
    {
        id: 'software',
        label: 'Software',
        subtitle: 'Desarrollado y listo para operar',
        href: '/software',
        Icon: Boxes,
    },
    {
        id: 'licencias',
        label: 'Licencias OEM',
        subtitle: 'Windows, Office, Antivirus y más',
        href: '/licencias',
        Icon: KeyRound,
    },
    {
        id: 'codigo-fuente',
        label: 'Código fuente',
        subtitle: 'Personalización y crecimiento',
        href: '/contacto',
        Icon: Code2,
    },
    {
        id: 'servicios',
        label: 'Servicios',
        subtitle: 'Implementación y soporte',
        href: '/servicios',
        Icon: Wrench,
    },
];

function resolvePublicUrl(): string {
    if (typeof window === 'undefined') {
        return PUBLIC_PATH;
    }

    return `${window.location.origin}${PUBLIC_PATH}`;
}

export default function RedesORVAE() {
    const publicUrl = resolvePublicUrl();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(publicUrl)}`;

    return (
        <>
            <SeoHead
                title="ORVAE | Redes"
                description="Software a medida, licencias OEM y servicios de implementación. Pide tu cotización desde una sola página."
                canonicalPath={PUBLIC_PATH}
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Redes ORVAE', path: PUBLIC_PATH },
                ]}
            />

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070D] px-4 py-8 sm:py-12">
                <div
                    className="pointer-events-none absolute inset-0 opacity-95"
                    aria-hidden
                    style={{
                        backgroundImage: `
                            radial-gradient(2px 2px at 18% 22%, rgba(255,255,255,0.9), transparent 55%),
                            radial-gradient(1.5px 1.5px at 72% 35%, rgba(255,255,255,0.8), transparent 55%),
                            radial-gradient(1.8px 1.8px at 54% 70%, rgba(255,255,255,0.85), transparent 55%),
                            radial-gradient(2px 2px at 84% 82%, rgba(255,255,255,0.75), transparent 55%),
                            radial-gradient(1200px 520px at 50% -5%, rgba(74, 158, 184, 0.14), transparent 58%),
                            radial-gradient(900px 460px at 50% 100%, rgba(74, 158, 184, 0.09), transparent 62%),
                            linear-gradient(180deg, #090D16 0%, #05070D 100%)
                        `,
                    }}
                />

                <section className="relative w-full max-w-md rounded-[2rem] border border-[#4A9EB8]/35 bg-[#0A0F19]/92 p-4 text-white shadow-[0_30px_90px_-30px_rgba(74,158,184,0.35)] backdrop-blur-md sm:p-6">
                    <header className="relative pb-4 pt-9 text-center">
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#4A9EB8] bg-[#080D15] p-1.5 shadow-[0_0_28px_rgba(74,158,184,0.45)]">
                            <img
                                src="/logo/orvae-logo-h-transparent-light.png"
                                alt="ORVAE"
                                className="size-16 rounded-full object-cover"
                            />
                        </div>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">ORVAE</h1>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
                            Software a medida, licencias OEM y servicios para que tu operación funcione desde el
                            primer día.
                        </p>
                    </header>

                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-[#4A9EB8]">Elige lo que necesitas</p>
                        {actions.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-[#4A9EB8]/55 hover:bg-[#4A9EB8]/12"
                            >
                                <item.Icon
                                    className="size-7 shrink-0 rounded-full p-1 text-[#4A9EB8]"
                                    aria-hidden
                                />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-base font-semibold text-white">
                                        {item.label}
                                    </span>
                                    <span className="block truncate text-xs text-slate-300/85">
                                        {item.subtitle}
                                    </span>
                                </span>
                                <ArrowRight className="size-4 text-[#4A9EB8]" aria-hidden />
                            </Link>
                        ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#4A9EB8]/35 bg-[#0E1422] p-4 text-center">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#4A9EB8]">
                            Escanea el QR
                        </p>
                        <img
                            src={qrUrl}
                            alt="QR para acceder a Redes ORVAE"
                            className="mx-auto mt-2 size-40 rounded-lg border border-[#4A9EB8]/35 bg-white p-2"
                        />
                        <p className="mt-2 truncate text-xs text-slate-300">{publicUrl}</p>
                    </div>
                </section>
            </main>
        </>
    );
}

