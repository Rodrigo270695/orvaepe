import { Link } from '@inertiajs/react';
import { ArrowRight, Layers, PawPrint, Wrench } from 'lucide-react';

import type { SoftwareSystem } from '@/marketplace/softwareCatalog';

import { startingPrice, systemBrand, systemCover } from './catalogUtils';

type Props = {
    system: SoftwareSystem;
    categoryTitle: string;
    color: string;
};

const BRAND = {
    vet: {
        card: 'border-[#99D2BC]/40 bg-[linear-gradient(145deg,#021E18_0%,#015743_50%,#006D55_100%)] shadow-[0_24px_70px_-28px_rgba(0,109,85,0.5)]',
        cta: 'text-[#006D55]',
        icon: PawPrint,
    },
    taller: {
        card: 'border-orange-300/25 bg-[linear-gradient(145deg,#0b1220_0%,#1e3a5f_48%,#ea580c_140%)] shadow-[0_24px_70px_-28px_rgba(234,88,12,0.38)]',
        cta: 'text-[#ea580c]',
        icon: Wrench,
    },
} as const;

export default function SoftwareProductCard({ system, categoryTitle, color }: Props) {
    const brand = systemBrand(system);
    const cover = systemCover(system);
    const price = startingPrice(system);
    const badges = system.badges.slice(0, 3);
    const href = `/software/${system.slug}`;

    if (brand) {
        const tone = BRAND[brand];
        const Icon = tone.icon;

        return (
            <article className={`h-full overflow-hidden rounded-[1.6rem] border ${tone.card}`}>
                <Link
                    href={href}
                    className="group flex h-full cursor-pointer flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                    <div className="relative aspect-[16/9] overflow-hidden">
                        {cover ? (
                            <img
                                src={cover}
                                alt={system.name}
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                width={800}
                                height={450}
                                loading="lazy"
                                decoding="async"
                            />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                        <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                            SaaS propio
                        </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                            <Icon className="size-3.5" aria-hidden />
                            {categoryTitle}
                        </p>
                        <h3 className="font-display mt-3 text-2xl font-bold text-white sm:text-3xl">{system.name}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">{system.shortDescription}</p>
                        {badges.length > 0 ? (
                            <ul className="mt-4 flex flex-wrap gap-2">
                                {badges.map((badge) => (
                                    <li
                                        key={badge}
                                        className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white"
                                    >
                                        {badge}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                            {price ? (
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">
                                        {price.hasFree ? 'Plan gratis · desde' : 'Desde'}
                                    </p>
                                    <p className="font-display text-xl font-bold tabular-nums text-white">{price.text}</p>
                                </div>
                            ) : (
                                <span />
                            )}
                            <span
                                className={`inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold transition-transform duration-200 group-hover:translate-x-0.5 ${tone.cta}`}
                            >
                                Ver {system.name}
                                <ArrowRight className="size-4" aria-hidden />
                            </span>
                        </div>
                    </div>
                </Link>
            </article>
        );
    }

    return (
        <article
            className="home-glass h-full overflow-hidden rounded-3xl transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_color-mix(in_oklab,var(--foreground)_28%,transparent)]"
            style={{ borderTop: `3px solid ${color}` }}
        >
            <Link
                href={href}
                className="group flex h-full cursor-pointer flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <div className="relative aspect-[16/9] overflow-hidden border-b border-border/60">
                    {cover ? (
                        <img
                            src={cover}
                            alt={system.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            width={800}
                            height={450}
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div
                            className="flex size-full items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, color-mix(in oklab, ${color} 22%, var(--card)) 0%, var(--card) 100%)`,
                            }}
                            aria-hidden
                        >
                            <Layers className="size-14" style={{ color }} strokeWidth={1.25} />
                        </div>
                    )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color }}>
                        {categoryTitle}
                    </p>
                    <h3 className="font-display mt-2 text-xl font-bold text-foreground">{system.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{system.shortDescription}</p>
                    {badges.length > 0 ? (
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {badges.map((badge) => (
                                <li
                                    key={badge}
                                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium text-foreground"
                                    style={{
                                        borderColor: `color-mix(in oklab, ${color} 35%, var(--border))`,
                                        background: `color-mix(in oklab, ${color} 10%, var(--card))`,
                                    }}
                                >
                                    {badge}
                                </li>
                            ))}
                        </ul>
                    ) : null}
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                        {price ? (
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                    {price.hasFree ? 'Plan gratis · desde' : 'Desde'}
                                </p>
                                <p className="font-display text-xl font-bold tabular-nums text-foreground">{price.text}</p>
                            </div>
                        ) : (
                            <span />
                        )}
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
                            Ver detalles y planes
                            <ArrowRight className="size-4" style={{ color }} aria-hidden />
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
}
