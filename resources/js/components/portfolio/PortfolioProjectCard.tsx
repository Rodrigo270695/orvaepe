import { Link } from '@inertiajs/react';
import { ArrowUpRight, ExternalLink, Layers } from 'lucide-react';

import { isVideoMediaUrl } from '@/lib/seoVideoObject';
import type { SoftwareSystem } from '@/marketplace/softwareCatalog';

type Props = {
    system: SoftwareSystem;
    categoryTitle: string;
    accent: string;
};

function platformHref(system: SoftwareSystem): string | null {
    const url = system.demoUrl?.trim() ?? '';
    if (url === '' || isVideoMediaUrl(url)) {
        return null;
    }
    return url;
}

export default function PortfolioProjectCard({
    system,
    categoryTitle,
    accent,
}: Props) {
    const coverUrl =
        system.images?.find((u) => typeof u === 'string' && u.trim() !== '')?.trim() ??
        null;
    const liveUrl = platformHref(system);
    const href = liveUrl ?? `/software/${system.slug}`;
    const opensPlatform = Boolean(liveUrl);
    const modules = (system.modules ?? []).slice(0, 4);

    const className = [
        'group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-card/80 text-left no-underline shadow-sm backdrop-blur-md transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[0_28px_56px_-28px_color-mix(in_oklab,var(--foreground)_24%,transparent)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    ].join(' ');

    const style = {
        borderColor: `color-mix(in oklab, ${accent} 28%, var(--border))`,
        boxShadow:
            '0 0 0 1px var(--hero-card-inset) inset, 0 14px 40px -28px color-mix(in oklab, var(--foreground) 18%, transparent)',
    } as const;

    const body = (
        <>
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(ellipse at 12% 0%, color-mix(in oklab, ${accent} 14%, transparent) 0%, transparent 55%)`,
                }}
                aria-hidden
            />

            <div className="relative overflow-hidden bg-[color-mix(in_oklab,var(--muted)_35%,transparent)]">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt=""
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="flex aspect-[4/3] w-full items-center justify-center"
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

            <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
                    {system.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {system.shortDescription}
                </p>

                {system.badges.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {system.badges.slice(0, 3).map((badge) => (
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
                    <ul className="mt-4 hidden flex-wrap gap-1.5 sm:flex">
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
                    <span
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-foreground transition-[transform,background-color] group-hover:-translate-y-px group-hover:bg-[color-mix(in_oklab,var(--primary)_8%,transparent)]"
                        style={{
                            borderColor: `color-mix(in oklab, ${accent} 38%, var(--border))`,
                        }}
                    >
                        {opensPlatform ? 'Abrir plataforma' : 'Ver sistema'}
                        {opensPlatform ? (
                            <ExternalLink className="size-4 opacity-80" aria-hidden />
                        ) : (
                            <ArrowUpRight className="size-4 opacity-80" aria-hidden />
                        )}
                    </span>
                </div>
            </div>
        </>
    );

    if (opensPlatform && liveUrl) {
        return (
            <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                style={style}
                aria-label={`Abrir la plataforma ${system.name}`}
            >
                {body}
            </a>
        );
    }

    return (
        <Link
            href={href}
            className={className}
            style={style}
            aria-label={`Ver el sistema ${system.name}`}
        >
            {body}
        </Link>
    );
}
