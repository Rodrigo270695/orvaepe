import { useGSAP } from '@gsap/react';
import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, PawPrint, Wrench } from 'lucide-react';
import { useRef } from 'react';

import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

gsap.registerPlugin(ScrollTrigger);

const products = [
    {
        slug: 'VETSAAS',
        href: '/software/VETSAAS',
        name: 'VetSaaS',
        kicker: 'Clínicas veterinarias',
        title: 'Historia clínica, agenda y SUNAT en el subdominio de tu clínica.',
        points: ['WhatsApp e IA', 'PWA multi-tenant', 'AlmaPet ID'],
        image: '/images/vetsaas-hero-pets.webp',
        imageAlt: 'Mascotas en una clínica que usa VetSaaS',
        cta: 'Ver VetSaaS',
        tone: 'vet' as const,
        icon: PawPrint,
    },
    {
        slug: 'TALLERSAAS',
        href: '/software/TALLERSAAS',
        name: 'TallerSaaS',
        kicker: 'Talleres y car wash',
        title: 'Órdenes, lavado, repuestos y boleta en el mismo piso del taller.',
        points: ['Orden por placa', 'WhatsApp de citas', 'SUNAT en caja'],
        image: '/images/tallersaas/hero.jpg',
        imageAlt: 'Auto en elevador de un taller que usa TallerSaaS',
        cta: 'Ver TallerSaaS',
        tone: 'taller' as const,
        icon: Wrench,
    },
];

export default function HomeSaasShowcase() {
    const root = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
                const section = root.current;
                if (!section) return;

                const cards = section.querySelectorAll<HTMLElement>('[data-saas-card]');
                gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 72px',
                        end: '+=80%',
                        scrub: 0.85,
                        pin: true,
                        anticipatePin: 1,
                    },
                }).fromTo(
                    cards,
                    { y: 36, scale: 0.97 },
                    { y: 0, scale: 1, stagger: 0.1, ease: 'none' },
                );
            });

            return () => mm.revert();
        },
        { scope: root },
    );

    return (
        <section
            ref={root}
            id="saas"
            aria-label="SaaS desarrollados por ORVAE: VetSaaS y TallerSaaS"
            className="relative scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20"
        >
            <div className="mx-auto max-w-6xl">
                <LandingSectionHeader
                    className="mb-10 md:mb-14"
                    eyebrow="SaaS propios"
                    title="Dos verticales. La misma casa."
                    description="ORVAE no solo vende licencias de terceros. Desarrollamos e operamos VetSaaS y TallerSaaS: cada cliente entra por su subdominio."
                    layout="wide"
                    titleSize="hero"
                />

                <div className="grid gap-5 lg:grid-cols-2">
                    {products.map((product) => {
                        const Icon = product.icon;
                        const isVet = product.tone === 'vet';

                        return (
                            <article
                                key={product.slug}
                                data-saas-card
                                className={
                                    isVet
                                        ? 'overflow-hidden rounded-[1.6rem] border border-[#99D2BC]/40 bg-[linear-gradient(145deg,#021E18_0%,#015743_50%,#006D55_100%)] shadow-[0_24px_70px_-28px_rgba(0,109,85,0.5)]'
                                        : 'overflow-hidden rounded-[1.6rem] border border-orange-300/25 bg-[linear-gradient(145deg,#0b1220_0%,#1e3a5f_48%,#ea580c_140%)] shadow-[0_24px_70px_-28px_rgba(234,88,12,0.38)]'
                                }
                            >
                                <Link
                                    href={product.href}
                                    className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                                >
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.imageAlt}
                                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                            width={800}
                                            height={450}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                                    </div>
                                    <div className="p-6 sm:p-8">
                                        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                                            <Icon className="size-3.5" aria-hidden />
                                            {product.kicker}
                                        </p>
                                        <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                                            {product.name}
                                        </h3>
                                        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
                                            {product.title}
                                        </p>
                                        <ul className="mt-4 flex flex-wrap gap-2">
                                            {product.points.map((point) => (
                                                <li
                                                    key={point}
                                                    className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white"
                                                >
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                        <span
                                            className={
                                                isVet
                                                    ? 'mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#006D55] transition-transform duration-200 group-hover:translate-x-0.5'
                                                    : 'mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#ea580c] transition-transform duration-200 group-hover:translate-x-0.5'
                                            }
                                        >
                                            {product.cta}
                                            <ArrowRight className="size-4" aria-hidden />
                                        </span>
                                    </div>
                                </Link>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
