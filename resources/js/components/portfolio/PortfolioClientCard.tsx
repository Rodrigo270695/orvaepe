import { ArrowUpRight, Building2 } from 'lucide-react';

import type { ShowcaseClientPublic } from '@/types/showcase-client';

function websiteHref(raw: string | null | undefined): string | null {
    const t = raw?.trim();
    if (!t) {
        return null;
    }
    if (t.startsWith('http://') || t.startsWith('https://')) {
        return t;
    }
    return `https://${t}`;
}

function hostLabel(href: string): string {
    try {
        return new URL(href).hostname.replace(/^www\./, '');
    } catch {
        return href.replace(/^https?:\/\//, '');
    }
}

type Props = {
    client: ShowcaseClientPublic;
    accent: string;
};

export default function PortfolioClientCard({ client, accent }: Props) {
    const href = websiteHref(client.website_url);
    const clickable = Boolean(href);

    const className = [
        'group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-card/90 text-left shadow-sm backdrop-blur-md transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        clickable
            ? 'hover:-translate-y-1 hover:shadow-[0_28px_56px_-28px_color-mix(in_oklab,var(--foreground)_24%,transparent)]'
            : 'cursor-default',
    ].join(' ');

    const style = {
        borderColor: `color-mix(in oklab, ${accent} 32%, var(--border))`,
        boxShadow:
            '0 0 0 1px var(--hero-card-inset) inset, 0 18px 44px -30px color-mix(in oklab, var(--foreground) 18%, transparent)',
    } as const;

    const body = (
        <>
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(ellipse at 50% 0%, color-mix(in oklab, ${accent} 16%, transparent) 0%, transparent 58%)`,
                }}
                aria-hidden
            />

            <div
                className="relative flex min-h-[11rem] items-center justify-center px-6 py-8 sm:min-h-[13rem] md:min-h-[14.5rem]"
                style={{
                    background: `linear-gradient(165deg, color-mix(in oklab, ${accent} 12%, var(--muted)) 0%, color-mix(in oklab, var(--card) 92%, transparent) 72%)`,
                }}
            >
                {client.logo ? (
                    <img
                        src={client.logo}
                        alt=""
                        className="max-h-24 w-auto max-w-[85%] object-contain sm:max-h-28 md:max-h-32"
                    />
                ) : (
                    <Building2
                        className="size-16 text-[color-mix(in_oklab,var(--foreground)_28%,transparent)] sm:size-20"
                        strokeWidth={1.15}
                        aria-hidden
                    />
                )}
                {client.sector ? (
                    <span
                        className="absolute left-3 top-3 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
                        style={{
                            borderColor: `color-mix(in oklab, ${accent} 40%, var(--border))`,
                            background: 'color-mix(in oklab, var(--background) 78%, transparent)',
                            color: `color-mix(in oklab, ${accent} 80%, var(--foreground))`,
                        }}
                    >
                        {client.sector}
                    </span>
                ) : null}
            </div>

            <div className="relative z-10 flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
                <h3 className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
                    {client.name}
                </h3>
                {href ? (
                    <p className="mt-1.5 truncate font-mono text-xs text-muted-foreground">
                        {hostLabel(href)}
                    </p>
                ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                        Plataforma en operación
                    </p>
                )}

                <div className="mt-auto pt-5">
                    <span
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-foreground transition-[background-color,transform] group-hover:-translate-y-px group-hover:bg-[color-mix(in_oklab,var(--primary)_8%,transparent)]"
                        style={{
                            borderColor: `color-mix(in oklab, ${accent} 38%, var(--border))`,
                        }}
                    >
                        {clickable ? 'Abrir plataforma' : 'Sin sitio público'}
                        {clickable ? (
                            <ArrowUpRight className="size-4 opacity-80" aria-hidden />
                        ) : null}
                    </span>
                </div>
            </div>
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${className} no-underline`}
                style={style}
                aria-label={`Abrir la plataforma de ${client.name}`}
            >
                {body}
            </a>
        );
    }

    return (
        <article className={className} style={style}>
            {body}
        </article>
    );
}
