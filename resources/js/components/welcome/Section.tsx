import type { ReactNode } from 'react';

type Props = {
    id?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    accent?: string;
    children?: ReactNode;
};

export default function Section({
    id,
    eyebrow,
    title,
    description,
    accent = 'var(--o-amber)',
    children,
}: Props) {
    return (
        <section id={id} className="w-full py-16">
            <div className="mx-auto w-full max-w-6xl px-4">
                <div className="max-w-3xl">
                    {eyebrow && (
                        <div className="mb-4 flex max-w-xl items-center gap-3">
                            <span
                                className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent"
                                style={{
                                    backgroundImage: `linear-gradient(90deg, transparent, color-mix(in oklab, ${accent} 52%, transparent))`,
                                }}
                            />
                            <p
                                className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.35em] opacity-90"
                                style={{ color: accent }}
                            >
                                {eyebrow}
                            </p>
                            <span
                                className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent"
                                style={{
                                    backgroundImage: `linear-gradient(270deg, transparent, color-mix(in oklab, ${accent} 52%, transparent))`,
                                }}
                            />
                        </div>
                    )}
                    <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[var(--foreground)]">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-3 font-[family-name:var(--font-body)] text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                            {description}
                        </p>
                    )}
                </div>
                {children}
            </div>
        </section>
    );
}

