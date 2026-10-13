import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import HomeSection from '@/components/welcome/HomeSection';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

export default function PortfolioHomeTeaser() {
    return (
        <HomeSection id="portafolio" aria-label="Portafolio de sistemas ORVAE">
            <LandingSectionHeader
                className="mb-12 md:mb-16"
                eyebrow="Portafolio"
                title="Sistemas que ya operan."
                description="VetSaaS, TallerSaaS y el resto del catálogo: capturas, módulos y empresas que ya trabajan con ORVAE."
                layout="wide"
                titleSize="hero"
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Link
                    href="/software/VETSAAS"
                    className="group relative overflow-hidden rounded-3xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:col-span-2"
                >
                    <img
                        src="/images/vetsaas-hero-pets.webp"
                        alt="VetSaaS en operación en una clínica veterinaria"
                        className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:aspect-[2/1]"
                        width={960}
                        height={480}
                        loading="lazy"
                    />
                    <span className="absolute bottom-4 left-4 rounded-md bg-[#015743] px-3 py-1.5 text-xs font-semibold text-white">
                        VetSaaS
                    </span>
                </Link>
                <Link
                    href="/software/TALLERSAAS"
                    className="group relative overflow-hidden rounded-3xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <img
                        src="/images/tallersaas/hero.jpg"
                        alt="TallerSaaS en operación en un taller mecánico"
                        className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:aspect-auto md:h-full"
                        width={480}
                        height={480}
                        loading="lazy"
                    />
                    <span className="absolute bottom-4 left-4 rounded-md bg-[#ea580c] px-3 py-1.5 text-xs font-semibold text-white">
                        TallerSaaS
                    </span>
                </Link>
            </div>

            <div className="home-glass mt-5 flex flex-col items-start justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8">
                <div>
                    <p className="font-display text-lg font-bold text-foreground">Mira el trabajo, no solo el catálogo</p>
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        Contabilidad, ventas, inventario y más, con contexto de cada sistema.
                    </p>
                </div>
                <Link
                    href="/portafolio"
                    className="inline-flex min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    Ver portafolio
                    <ArrowUpRight className="size-4" aria-hidden />
                </Link>
            </div>
        </HomeSection>
    );
}
