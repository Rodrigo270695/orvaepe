import { useGSAP } from '@gsap/react';
import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, PawPrint, UtensilsCrossed, Wrench } from 'lucide-react';
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
                const images = section.querySelectorAll<HTMLElement>('[data-saas-img]');
                gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 72px',
                        end: '+=90%',
                        scrub: 0.85,
                        pin: true,
                        anticipatePin: 1,
                    },
                })
                    .fromTo(cards, { y: 40, rotate: -1.2, scale: 0.96 }, { y: 0, rotate: 0, scale: 1, stagger: 0.12, ease: 'none' })
                    .fromTo(images, { yPercent: 8, scale: 1.08 }, { yPercent: 0, scale: 1, ease: 'none' }, '<');
            });

            return () => mm.revert();
        },
        { scope: root },
    );

    return (
        <section
            ref={root}
            id="saas"
            aria-label="SaaS desarrollados por ORVAE: VetSaaS, TallerSaaS y FoodSaaS"
            className="home-section home-section--alt relative overflow-hidden scroll-mt-28 px-4 py-20 sm:px-6 md:py-28"
        >
            <div
                className="home-blob home-blob--pulse -left-24 top-10 size-[22rem] opacity-50"
                data-parallax="8"
                style={{ background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)' }}
                aria-hidden
            />
            <div
                className="home-blob home-blob--pulse -right-20 bottom-0 size-[24rem] opacity-45"
                data-parallax="-7"
                style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)', animationDelay: '1s' }}
                aria-hidden
            />
            <div className="relative mx-auto max-w-6xl">
                <LandingSectionHeader
                    className="mb-10 md:mb-14"
                    eyebrow="SaaS propios"
                    title="Tres verticales. La misma casa."
                    description="ORVAE no solo vende licencias de terceros. Desarrollamos e operamos VetSaaS, TallerSaaS y FoodSaaS: cada cliente entra por su subdominio."
                    layout="wide"
                    titleSize="hero"
                />

                <Link
                    href="/software/FOODSAAS"
                    data-saas-card
                    className="group mb-5 grid cursor-pointer overflow-hidden rounded-[1.6rem] border border-[#c4a574]/50 bg-[#f6efe6] shadow-[0_24px_70px_-32px_rgba(102,0,51,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#660033] lg:grid-cols-[1.1fr_0.9fr]"
                >
                    <span className="flex flex-col justify-between bg-[#3a001c] p-6 text-[#f6efe6] sm:p-8">
                        <span>
                            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c4a574]">
                                <UtensilsCrossed className="size-3.5" aria-hidden />
                                Restaurantes
                            </span>
                            <span className="mt-4 block font-display text-3xl font-bold sm:text-4xl">FoodSaaS</span>
                            <span className="mt-3 block max-w-md font-sans text-sm leading-relaxed text-[#f6efe6]/85 sm:text-base">
                                Salón, cocina, caja y SUNAT en el subdominio de tu local. La comanda no cambia de sistema.
                            </span>
                        </span>
                        <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#f6efe6] px-4 py-2.5 text-sm font-semibold text-[#660033]">
                            Ver FoodSaaS
                            <ArrowRight className="size-4" aria-hidden />
                        </span>
                    </span>
                    <span className="grid content-center gap-3 p-6 sm:p-8" aria-hidden>
                        {[
                            ['01', 'Salón', 'Mesas y cuentas'],
                            ['02', 'Cocina', 'Comanda en vivo'],
                            ['03', 'Caja', 'Turno y medios'],
                            ['04', 'SUNAT', 'Boleta al cobrar'],
                        ].map(([index, name, note]) => (
                            <span key={index} className="flex items-baseline justify-between gap-4 border-b border-[#c4a574]/60 pb-2 font-serif text-[#3a001c]">
                                <span>
                                    <span className="mr-3 font-mono text-[10px] tracking-widest text-[#c4a574]">{index}</span>
                                    {name}
                                </span>
                                <span className="font-sans text-xs text-[#6b4a3a]">{note}</span>
                            </span>
                        ))}
                    </span>
                </Link>

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
                                            data-saas-img
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
