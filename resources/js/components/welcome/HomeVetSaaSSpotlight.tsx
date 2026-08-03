import { Link } from '@inertiajs/react';
import { ArrowRight, PawPrint } from 'lucide-react';

/**
 * Bloque en la home de Orvae que lleva directo a la landing VetSaaS.
 */
export default function HomeVetSaaSSpotlight() {
    return (
        <section
            aria-labelledby="home-vetsaas-title"
            className="relative mx-auto max-w-6xl overflow-hidden px-4 py-10 sm:px-6"
        >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#99D2BC]/40 bg-[linear-gradient(135deg,#021E18_0%,#015743_45%,#006D55_100%)] shadow-[0_24px_80px_-28px_rgba(0,109,85,0.55)] dark:border-[#33A07B]/25">
                <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 15% 20%, #E6F4EF 0.7px, transparent 0.8px)',
                        backgroundSize: '22px 22px',
                    }}
                />
                <div className="relative grid gap-6 p-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-center sm:p-8 lg:p-10">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5E5D9]">
                            <PawPrint className="size-3.5" />
                            Destacado · VetSaaS
                        </p>
                        <h2
                            id="home-vetsaas-title"
                            className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl"
                        >
                            Software para clínicas veterinarias
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#E6F4EF]/90 sm:text-base">
                            Historia clínica, agenda, caja, SUNAT y WhatsApp en tu propio
                            subdominio. Multi-tenant, PWA e integración con AlmaPet ID.
                        </p>
                        <Link
                            href="/software/VETSAAS"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#006D55] transition hover:bg-[#E6F4EF]"
                        >
                            Ver VetSaaS
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
                        <img
                            src="/images/vetsaas-hero-pets.png"
                            alt="Mascotas en clínica veterinaria"
                            className="size-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#021E18]/50 to-transparent" />
                    </div>
                </div>
            </div>
        </section>
    );
}
