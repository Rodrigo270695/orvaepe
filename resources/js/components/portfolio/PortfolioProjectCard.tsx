'use client';

import { ArrowUpRight, Layers } from 'lucide-react';

import type { SoftwareSystem } from '@/marketplace/softwareCatalog';

type Props = {
    system: SoftwareSystem;
    categoryTitle: string;
    accent: string;
    featured?: boolean;
};

export default function PortfolioProjectCard({
    system,
    categoryTitle,
    accent,
    featured = false,
}: Props) {
    const coverUrl =
        system.images?.find((u) => typeof u === 'string' && u.trim() !== '')?.trim() ??
        null;
    const modules = (system.modules ?? []).slice(0, featured ? 6 : 4);

    return (
        <article
            className={[
                'group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border bg-card/80 shadow-sm backdrop-blur-md transition-all duration-300',
                'hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-24px_color-mix(in_oklab,var(--foreground)_22%,transparent)]',
                featured ? 'lg:flex-row' : '',
            ].join(' ')}
            style={{
                borderColor: `color-mix(in oklab, ${accent} 28%, var(--border))`,
                boxShadow:
                    '0 0 0 1px var(--hero-card-inset) inset, 0 14px 40px -28px color-mix(in oklab, var(--foreground) 18%, transparent)',
            }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(ellipse at 12% 0%, color-mix(in oklab, ${accent} 14%, transparent) 0%, transparent 55%)`,
                }}
                aria-hidden
            />

            <div
                className={[
                    'relative overflow-hidden bg-[color-mix(in_oklab,var(--muted)_35%,transparent)]',
                    featured ? 'lg:w-[58%] lg:min-h-[22rem]' : '',
                ].join(' ')}
            >
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={`Captura de ${system.name}`}
                        className={[
                            'w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]',
                            featured ? 'aspect-[16/10] h-full lg:aspect-auto' : 'aspect-[16/10]',
                        ].join(' ')}
                        loading="lazy"
                    />
                ) : (
                    <div
                        className={[
                            'flex w-full items-center justify-center',
                            featured ? 'aspect-[16/10] min-h-[16rem] lg:aspect-auto lg:h-full' : 'aspect-[16/10]',
                        ].join(' ')}
                        style={{
                            background: `linear-gradient(135deg, color-mix(in oklab, ${accent} 24%, var(--muted)) 0%, color-mix(in oklab, var(--card) 88%, transparent) 100%)`,
                        }}
                        aria-hidden
                    >
                        <Layers
                            className="size-16 text-[color-mix(in_oklab,var(--foreground)_32%,transparent)]"
                            strokeWidth={1.15}
                        />
                    </div>
                )}
                <span
                    className="absolute left-3 top-3 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
                    style={{
                        borderColor: `color-mix(in oklab, ${accent} 40%, var(--border))`,
                        background: 'color-mix(in oklab, var(--background) 78%, transparent)',
                        color: `color-mix(in oklab, ${accent} 80%, var(--foreground))`,
                    }}
                >
                    {categoryTitle}
                </span>
            </div>

            <div
                className={[
                    'relative z-10 flex flex-1 flex-col p-5 sm:p-6',
                    featured ? 'lg:justify-center lg:p-8' : '',
                ].join(' ')}
            >
                <h3
                    className={[
                        'font-display font-bold tracking-tight text-foreground',
                        featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl',
                    ].join(' ')}
                >
                    {system.name}
                </h3>
                <p
                    className={[
                        'mt-2 text-muted-foreground',
                        featured ? 'max-w-lg text-base leading-relaxed' : 'text-sm leading-relaxed',
                    ].join(' ')}
                >
                    {system.shortDescription}
                </p>

                {system.badges.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {system.badges.slice(0, featured ? 4 : 3).map((badge) => (
                            <span
                                key={badge}
                                className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                                style={{
                                    borderColor: `color-mix(in oklab, ${accent} 32%, var(--border))`,
                                    background: `color-mix(in oklab, ${accent} 9%, transparent)`,
                                    color: `color-mix(in oklab, ${accent} 88%, var(--foreground))`,
                                }}
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                ) : null}

                {modules.length > 0 ? (
                    <ul
                        className={[
                            'mt-4 flex flex-wrap gap-1.5',
                            featured ? '' : 'hidden sm:flex',
                        ].join(' ')}
                    >
                        {modules.map((mod) => (
                            <li
                                key={mod.name}
                                className="rounded-md bg-[color-mix(in_oklab,var(--muted)_55%,transparent)] px-2 py-1 text-[11px] font-medium text-muted-foreground"
                            >
                                {mod.name}
                            </li>
                        ))}
                    </ul>
                ) : null}

                <div className="mt-auto pt-5">
                    <a
                        href={`/software/${system.slug}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-foreground transition-[transform,background-color,border-color] hover:-translate-y-px hover:bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        style={{
                            borderColor: `color-mix(in oklab, ${accent} 38%, var(--border))`,
                        }}
                    >
                        Ver sistema
                        <ArrowUpRight className="size-4 opacity-80" aria-hidden />
                    </a>
                </div>
            </div>
        </article>
    );
}
