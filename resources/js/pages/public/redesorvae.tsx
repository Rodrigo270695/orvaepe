import { ArrowRight } from 'lucide-react';

import SeoHead from '@/components/seo/SeoHead';

type SocialItem = {
    id: string;
    label: string;
    subtitle: string;
    href: string;
    iconKey: string;
    iconColor: string;
};

const PUBLIC_PATH = '/redesorvae';

const socials: SocialItem[] = [
    {
        id: 'facebook',
        label: 'Facebook',
        subtitle: 'Síguenos en Facebook',
        href: 'https://www.facebook.com/share/1B9ZMXbTRh/',
        iconKey: 'facebook',
        iconColor: '1877F2',
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        subtitle: 'Videos y novedades',
        href: 'https://www.tiktok.com/@orvae.pe?_r=1&_t=ZS-95CCe7LjUdW',
        iconKey: 'tiktok',
        iconColor: '000000',
    },
    {
        id: 'instagram',
        label: 'Instagram',
        subtitle: 'Fotos, reels y marca',
        href: 'https://www.instagram.com/orvaepe?igsh=MTN0MDg5bTEyemJiYQ==',
        iconKey: 'instagram',
        iconColor: 'E4405F',
    },
];

function simpleIconUrl(iconKey: string, color: string): string {
    return `https://cdn.simpleicons.org/${iconKey}/${color}`;
}

export default function RedesORVAE() {
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
                            radial-gradient(1px 1px at 6% 18%, rgba(255,255,255,0.95), transparent 60%),
                            radial-gradient(1px 1px at 14% 72%, rgba(255,255,255,0.8), transparent 60%),
                            radial-gradient(1.5px 1.5px at 22% 35%, rgba(255,255,255,0.8), transparent 60%),
                            radial-gradient(1px 1px at 31% 83%, rgba(255,255,255,0.75), transparent 60%),
                            radial-gradient(1.5px 1.5px at 39% 18%, rgba(255,255,255,0.85), transparent 60%),
                            radial-gradient(1px 1px at 47% 60%, rgba(255,255,255,0.85), transparent 60%),
                            radial-gradient(1.5px 1.5px at 55% 26%, rgba(255,255,255,0.78), transparent 60%),
                            radial-gradient(1px 1px at 63% 78%, rgba(255,255,255,0.75), transparent 60%),
                            radial-gradient(1.5px 1.5px at 71% 40%, rgba(255,255,255,0.85), transparent 60%),
                            radial-gradient(1px 1px at 79% 15%, rgba(255,255,255,0.72), transparent 60%),
                            radial-gradient(1.5px 1.5px at 86% 65%, rgba(255,255,255,0.8), transparent 60%),
                            radial-gradient(1px 1px at 94% 30%, rgba(255,255,255,0.75), transparent 60%),
                            radial-gradient(900px 520px at 50% -10%, rgba(74, 158, 184, 0.22), transparent 60%),
                            radial-gradient(720px 480px at 50% 112%, rgba(74, 158, 184, 0.14), transparent 62%),
                            radial-gradient(800px 600px at 50% 40%, rgba(0, 0, 0, 0.2), rgba(0,0,0,0.85) 70%),
                            radial-gradient(1000px 520px at 50% 0%, rgba(74, 158, 184, 0.09), transparent 55%),
                            linear-gradient(180deg, #090D16 0%, #05070D 100%)
                        `,
                    }}
                />

                <section className="relative w-full max-w-md rounded-[2rem] border border-[#4A9EB8]/35 bg-[#0A0F19]/92 p-4 text-white shadow-[0_30px_90px_-30px_rgba(74,158,184,0.35)] backdrop-blur-md sm:p-6">
                    <header className="relative pb-4 pt-9 text-center">
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white p-1.5 shadow-[0_0_28px_rgba(74,158,184,0.45)]">
                            <img
                                src="/logo/orvae-icon-negative-512.png"
                                alt="ORVAE"
                                className="size-16 rounded-full object-contain"
                            />
                        </div>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">ORVAE</h1>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
                            Software a medida, licencias OEM y servicios para que tu operación funcione desde el
                            primer día.
                        </p>
                    </header>

                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-[#4A9EB8]">Nuestras redes</p>
                        {socials.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-[#4A9EB8]/55 hover:bg-[#4A9EB8]/12"
                            >
                                <img
                                    src={simpleIconUrl(item.iconKey, item.iconColor)}
                                    alt={item.label}
                                    className="size-7 rounded-full bg-white p-1"
                                    loading="lazy"
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
                            </a>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}

