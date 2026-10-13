import { useGSAP } from '@gsap/react';
import { Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ArrowDown, MessageCircle, PackageSearch, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import '@/components/checkout/checkout-orvae.css';
import '@/components/portfolio/portfolio-orvae.css';
import '@/components/welcome/home-orvae.css';

import CheckoutTrustRow from '@/components/checkout/CheckoutTrustRow';
import LicenseOemSkuCard, { formatPen } from '@/components/marketing/LicenseOemSkuCard';
import type { LicenseSkuItem } from '@/components/marketing/LicenseOemSkuCard';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import HomeMotion from '@/components/welcome/HomeMotion';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import type { MarketingCartCategoryLabel } from '@/lib/oemCart';
import { buildWhatsAppHref, WHATSAPP_E164 } from '@/lib/whatsapp';

export type CatalogSection = {
    slug: string;
    title: string;
    tagline: string | null;
    description: string | null;
    items: LicenseSkuItem[];
};

type Step = { title: string; text: string };

type Props = {
    sections: CatalogSection[];
    canRegister: boolean;
    eyebrow: string;
    title: ReactNode;
    description: string;
    itemNoun: { singular: string; plural: string };
    steps: readonly Step[];
    searchPlaceholder: string;
    whatsappMessage: string;
    cartCategoryLabel: MarketingCartCategoryLabel;
    showImage?: boolean;
    detailHref?: (section: CatalogSection, item: LicenseSkuItem) => string;
    closingTitle: string;
    closingText: string;
};

const ACCENTS = ['#2563eb', '#0d9488', '#c2410c', '#7c3aed'] as const;

function normalize(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function itemHaystack(item: LicenseSkuItem): string {
    return normalize([item.name, item.detail ?? '', ...(item.details ?? [])].join(' '));
}

export default function MarketingCatalogPage({
    sections: rawSections,
    canRegister,
    eyebrow,
    title,
    description,
    itemNoun,
    steps,
    searchPlaceholder,
    whatsappMessage,
    cartCategoryLabel,
    showImage = false,
    detailHref,
    closingTitle,
    closingText,
}: Props) {
    const { contact } = usePage().props as { contact?: { whatsapp_e164?: string } };
    const whatsappE164 = contact?.whatsapp_e164?.replace(/\D/g, '') || WHATSAPP_E164;
    const whatsappHref = buildWhatsAppHref(whatsappE164, whatsappMessage);

    const sections = useMemo(() => {
        const withItems = rawSections.filter((s) => s.items.length > 0);
        const featured = withItems.filter((s) => s.slug.includes('mas-vendidos'));

        return [...featured, ...withItems.filter((s) => !s.slug.includes('mas-vendidos'))];
    }, [rawSections]);

    const accentBySlug = useMemo(
        () => Object.fromEntries(sections.map((s, i) => [s.slug, ACCENTS[i % ACCENTS.length]])),
        [sections],
    );

    const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
    const prices = sections.flatMap((s) => s.items.map((i) => i.list_price)).filter((p) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

    const [query, setQuery] = useState('');
    const needle = normalize(query.trim());

    const visibleSections = useMemo(() => {
        if (needle === '') {
            return sections;
        }

        return sections
            .map((s) =>
                normalize(s.title).includes(needle)
                    ? s
                    : { ...s, items: s.items.filter((item) => itemHaystack(item).includes(needle)) },
            )
            .filter((s) => s.items.length > 0);
    }, [sections, needle]);

    const visibleCount = visibleSections.reduce((sum, s) => sum + s.items.length, 0);

    const [activeSlug, setActiveSlug] = useState<string | null>(null);
    const catalogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = catalogRef.current;

        if (!root) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const hit = entries.find((e) => e.isIntersecting);

                if (hit) {
                    setActiveSlug(hit.target.id);
                }
            },
            { rootMargin: '-35% 0px -60% 0px' },
        );

        root.querySelectorAll('[data-catalog-section]').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [visibleSections]);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.from('[data-catalog-hero] > *', {
                    opacity: 0,
                    y: 18,
                    duration: 0.55,
                    stagger: 0.08,
                    ease: 'power2.out',
                    clearProps: 'transform,opacity',
                });
            });

            return () => mm.revert();
        },
        { scope: catalogRef },
    );

    const pillsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!activeSlug) {
            return;
        }

        const pill = pillsRef.current?.querySelector<HTMLElement>(`[data-pill="${activeSlug}"]`);
        const strip = pillsRef.current;

        if (pill && strip) {
            const offset = pill.getBoundingClientRect().left - strip.getBoundingClientRect().left;
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            strip.scrollTo({
                left: strip.scrollLeft + offset - (strip.clientWidth - pill.clientWidth) / 2,
                behavior: reduce ? 'auto' : 'smooth',
            });
        }
    }, [activeSlug]);

    return (
        <div className="landing-page relative min-h-screen text-foreground">
            <a
                href="#catalogo"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:shadow-lg"
            >
                Ir al catálogo
            </a>
            <div className="landing-grain absolute inset-0 z-0" aria-hidden />
            <div className="relative z-[1]">
                <MarketingUnifiedNavbar canRegister={canRegister} />
                <div className="h-[5.5rem] shrink-0" aria-hidden />
                <AppearanceFloatingRailToggle />

                <HomeMotion>
                    <main ref={catalogRef}>
                        <section className="co-hero relative overflow-hidden" aria-labelledby="catalog-title">
                            <div
                                className="home-blob home-blob--pulse absolute -right-24 top-0 size-[26rem] opacity-60"
                                data-parallax="10"
                                style={{ background: 'radial-gradient(circle, color-mix(in oklab, #ea580c 45%, transparent) 0%, transparent 70%)' }}
                                aria-hidden
                            />
                            <div
                                className="home-blob home-blob--pulse absolute -left-24 bottom-0 size-[22rem] opacity-50"
                                data-parallax="-8"
                                style={{
                                    background: 'radial-gradient(circle, color-mix(in oklab, #2563eb 40%, transparent) 0%, transparent 70%)',
                                    animationDelay: '1.6s',
                                }}
                                aria-hidden
                            />

                            <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-14 pt-8 sm:px-6 md:pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pb-20">
                                <div data-catalog-hero>
                                    <p className="inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--o-amber)_35%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c2410c] shadow-sm backdrop-blur-md dark:text-[#fb923c]">
                                        {eyebrow}
                                    </p>
                                    <h1
                                        id="catalog-title"
                                        className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground [text-wrap:balance] sm:text-5xl"
                                    >
                                        {title}
                                    </h1>
                                    <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
                                        {description}
                                    </p>

                                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                        <a href="#catalogo" className="co-cta" data-magnetic>
                                            Ver catálogo
                                            <ArrowDown className="size-4" aria-hidden />
                                        </a>
                                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="co-ghost">
                                            <MessageCircle className="size-4 text-[#0e7266] dark:text-[#2dd4bf]" aria-hidden />
                                            Consultar por WhatsApp
                                            <span className="sr-only">(abre en una pestaña nueva)</span>
                                        </a>
                                    </div>

                                    {totalItems > 0 ? (
                                        <dl className="mt-8 grid max-w-lg grid-cols-3 gap-2.5">
                                            {[
                                                { label: 'Categorías', value: String(sections.length) },
                                                { label: itemNoun.plural, value: String(totalItems) },
                                                { label: 'Desde', value: minPrice !== null ? formatPen(minPrice) : '—' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="home-glass rounded-2xl px-3.5 py-3">
                                                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                        {stat.label}
                                                    </dt>
                                                    <dd className="mt-0.5 font-display text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                                                        {stat.value}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    ) : null}
                                </div>

                                <aside className="co-glass relative overflow-hidden rounded-3xl p-6 sm:p-7" aria-labelledby="catalog-how">
                                    <div className="co-line absolute inset-x-0 top-0" aria-hidden />
                                    <h2 id="catalog-how" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                        Cómo comprar
                                    </h2>
                                    <ol className="mt-5 space-y-4">
                                        {steps.map((step, i) => (
                                            <li key={step.title} className="flex gap-3.5">
                                                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklab,#ea580c_40%,var(--border))] bg-background text-sm font-bold text-[#c2410c] dark:text-[#fb923c]">
                                                    {i + 1}
                                                </span>
                                                <span>
                                                    <span className="block text-sm font-bold text-foreground">{step.title}</span>
                                                    <span className="block text-sm leading-relaxed text-muted-foreground">{step.text}</span>
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                    <CheckoutTrustRow compact className="mt-6" />
                                </aside>
                            </div>
                        </section>

                        <section id="catalogo" className="home-section home-section--alt relative scroll-mt-24 pb-20 md:pb-28" aria-label="Catálogo">
                            {sections.length > 0 ? (
                                <div className="sticky top-[4.75rem] z-30 border-y border-[color-mix(in_oklab,var(--foreground)_7%,var(--border))] bg-[color-mix(in_oklab,var(--background)_86%,transparent)] backdrop-blur-xl">
                                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2.5 px-4 py-3 sm:px-6 md:flex-row md:items-center md:gap-4">
                                        <div className="relative md:w-80 md:shrink-0">
                                            <label htmlFor="catalog-search" className="sr-only">
                                                Buscar en el catálogo
                                            </label>
                                            <Search
                                                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                                aria-hidden
                                            />
                                            <input
                                                id="catalog-search"
                                                type="search"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder={searchPlaceholder}
                                                autoComplete="off"
                                                className="co-field !min-h-11 !py-2.5 !pl-10 !pr-11 [&::-webkit-search-cancel-button]:hidden"
                                            />
                                            {query !== '' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setQuery('')}
                                                    className="absolute right-0.5 top-1/2 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                                                    aria-label="Limpiar búsqueda"
                                                >
                                                    <X className="size-4" aria-hidden />
                                                </button>
                                            ) : null}
                                        </div>

                                        <nav aria-label="Categorías del catálogo" className="min-w-0 flex-1">
                                            <div
                                                ref={pillsRef}
                                                className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
                                            >
                                                {visibleSections.map((s) => (
                                                    <a
                                                        key={s.slug}
                                                        href={`#${s.slug}`}
                                                        data-pill={s.slug}
                                                        className={`pf-filter inline-flex shrink-0 items-center gap-2 whitespace-nowrap ${activeSlug === s.slug ? 'is-on' : ''}`}
                                                        aria-current={activeSlug === s.slug ? 'true' : undefined}
                                                    >
                                                        <span className="size-2 rounded-full" style={{ background: accentBySlug[s.slug] }} aria-hidden />
                                                        {s.title}
                                                        <span className="tabular-nums text-muted-foreground">{s.items.length}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </nav>
                                    </div>
                                </div>
                            ) : null}

                            <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 md:pt-14">
                                <p className="sr-only" aria-live="polite">
                                    {needle !== '' ? `${visibleCount} resultados para ${query}` : ''}
                                </p>

                                {sections.length === 0 ? (
                                    <EmptyState
                                        title="Estamos actualizando el catálogo"
                                        text="Escríbenos y te cotizamos al momento lo que necesitas."
                                        whatsappHref={whatsappHref}
                                    />
                                ) : visibleSections.length === 0 ? (
                                    <EmptyState
                                        title={`No encontramos “${query.trim()}”`}
                                        text="Prueba con otra marca o nombre, o pregúntanos: si no está en la lista, lo conseguimos."
                                        whatsappHref={whatsappHref}
                                        onClear={() => setQuery('')}
                                    />
                                ) : (
                                    <div className="space-y-16 md:space-y-20">
                                        {visibleSections.map((section) => {
                                            const accent = accentBySlug[section.slug];

                                            return (
                                                <div
                                                    key={section.slug}
                                                    id={section.slug}
                                                    data-catalog-section
                                                    className="scroll-mt-60 md:scroll-mt-44"
                                                    aria-labelledby={`${section.slug}-title`}
                                                    role="region"
                                                >
                                                    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                                                        <div className="min-w-0">
                                                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                <span className="h-0.5 w-6 rounded-full" style={{ background: accent }} aria-hidden />
                                                                {section.items.length}{' '}
                                                                {section.items.length === 1 ? itemNoun.singular : itemNoun.plural}
                                                            </p>
                                                            <h2
                                                                id={`${section.slug}-title`}
                                                                className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                                                            >
                                                                {section.title}
                                                            </h2>
                                                        </div>
                                                        {section.tagline || section.description ? (
                                                            <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-right">
                                                                {section.tagline ?? section.description}
                                                            </p>
                                                        ) : null}
                                                    </header>

                                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                        {section.items.map((item) => (
                                                            <LicenseOemSkuCard
                                                                key={item.id}
                                                                item={item}
                                                                productSlug={section.slug}
                                                                sectionTitle={section.title}
                                                                cartCategoryLabel={cartCategoryLabel}
                                                                detailHref={detailHref?.(section, item)}
                                                                accent={accent}
                                                                showImage={showImage}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="co-glass relative mt-20 overflow-hidden rounded-3xl px-6 py-10 text-center sm:px-10 md:mt-24">
                                    <div className="co-line absolute inset-x-0 top-0" aria-hidden />
                                    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                        {closingTitle}
                                    </h2>
                                    <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                                        {closingText}
                                    </p>
                                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                                        <a
                                            href={whatsappHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[0.875rem] bg-[#0e7266] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#0b5d53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7266] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                        >
                                            <MessageCircle className="size-4" aria-hidden />
                                            Escríbenos por WhatsApp
                                            <span className="sr-only">(abre en una pestaña nueva)</span>
                                        </a>
                                        <Link href="/contacto" className="co-ghost">
                                            Ir a contacto
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </HomeMotion>

                <WelcomeFooter />
                <ScrollToTopButton />
            </div>
        </div>
    );
}

function EmptyState({
    title,
    text,
    whatsappHref,
    onClear,
}: {
    title: string;
    text: string;
    whatsappHref: string;
    onClear?: () => void;
}) {
    return (
        <div className="co-glass mx-auto max-w-xl rounded-3xl px-6 py-12 text-center">
            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,#2563eb_10%,transparent)] text-[#2563eb] dark:text-[#93c5fd]">
                <PackageSearch className="size-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-xl font-bold text-foreground">{title}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                {onClear ? (
                    <button type="button" onClick={onClear} className="co-ghost">
                        Limpiar búsqueda
                    </button>
                ) : null}
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="co-cta">
                    <MessageCircle className="size-4" aria-hidden />
                    Preguntar por WhatsApp
                    <span className="sr-only">(abre en una pestaña nueva)</span>
                </a>
            </div>
        </div>
    );
}
