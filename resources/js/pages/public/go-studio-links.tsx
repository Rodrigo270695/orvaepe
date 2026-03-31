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

const PUBLIC_PATH = '/go-studio';

const socials: SocialItem[] = [
    {
        id: 'facebook',
        label: 'Facebook',
        subtitle: 'Go Studio - Agencia de Marketing y Publicidad',
        href: 'https://www.facebook.com/share/1GRvSkgNTu/',
        iconKey: 'facebook',
        iconColor: '1877F2',
    },
    {
        id: 'instagram',
        label: 'Instagram',
        subtitle: '@go.studiope',
        href: 'https://www.instagram.com/go.studiope?igsh=NjlnOThqYm1ybm5u',
        iconKey: 'instagram',
        iconColor: 'E4405F',
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        subtitle: '@go.studio0',
        href: 'https://www.tiktok.com/@go.studio0?_r=1&_t=ZS-959a35f8UPV',
        iconKey: 'tiktok',
        iconColor: '000000',
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        subtitle: '+51 902 177 882',
        href: 'https://wa.me/51902177882',
        iconKey: 'whatsapp',
        iconColor: '25D366',
    },
    {
        id: 'ubicacion',
        label: 'Ubicación',
        subtitle: 'Ver en Google Maps',
        href: 'https://maps.app.goo.gl/xiW8STNBkPvu5NVt7?g_st=aw',
        iconKey: 'googlemaps',
        iconColor: '34A853',
    },
];

function simpleIconUrl(iconKey: string, color: string): string {
    return `https://cdn.simpleicons.org/${iconKey}/${color}`;
}

function resolvePublicUrl(): string {
    if (typeof window === 'undefined') {
        return PUBLIC_PATH;
    }

    return `${window.location.origin}${PUBLIC_PATH}`;
}

export default function GoStudioLinks() {
    const publicUrl = resolvePublicUrl();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(publicUrl)}`;

    return (
        <>
            <SeoHead
                title="GO Studio | Encuéntrame"
                description="Conecta con GO Studio en Facebook, Instagram, TikTok y WhatsApp desde una sola página pública."
                canonicalPath={PUBLIC_PATH}
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'GO Studio', path: PUBLIC_PATH },
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
                            radial-gradient(1200px 520px at 50% -5%, rgba(0, 255, 214, 0.12), transparent 58%),
                            radial-gradient(900px 460px at 50% 100%, rgba(0, 255, 214, 0.08), transparent 62%),
                            linear-gradient(180deg, #090D16 0%, #05070D 100%)
                        `,
                    }}
                />

                <section className="relative w-full max-w-md rounded-[2rem] border border-[#1EF4D0]/35 bg-[#0A0F19]/92 p-4 text-white shadow-[0_30px_90px_-30px_rgba(0,255,214,0.45)] backdrop-blur-md sm:p-6">
                    <header className="relative pb-4 pt-9 text-center">
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#1EF4D0] bg-[#080D15] p-1.5 shadow-[0_0_28px_rgba(30,244,208,0.45)]">
                            <img
                                src="/logogostudio.jpeg"
                                alt="GO Studio"
                                className="size-16 rounded-full object-cover"
                            />
                        </div>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                            GO Studio
                        </h1>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
                            Somos una Agencia de Marketing y Publicidad especializada en el
                            desarrollo estrategico de marcas.
                        </p>
                    </header>

                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-[#1EF4D0]">Encuéntrame en</p>
                        {socials.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-[#1EF4D0]/50 hover:bg-[#1EF4D0]/10"
                            >
                                <img
                                    src={simpleIconUrl(item.iconKey, item.iconColor)}
                                    alt={item.label}
                                    className="size-7 rounded-full"
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
                                <ArrowRight className="size-4 text-[#1EF4D0]" aria-hidden />
                            </a>
                        ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#1EF4D0]/35 bg-[#0E1422] p-4 text-center">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#1EF4D0]">
                            Escanea el QR
                        </p>
                        <img
                            src={qrUrl}
                            alt="QR para acceder a GO Studio"
                            className="mx-auto mt-2 size-40 rounded-lg border border-[#1EF4D0]/35 bg-white p-2"
                        />
                        <p className="mt-2 truncate text-xs text-slate-300">{publicUrl}</p>
                    </div>
                </section>
            </main>
        </>
    );
}
