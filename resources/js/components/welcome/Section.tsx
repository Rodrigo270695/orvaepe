import type { ReactNode } from 'react';

type Props = {
    id?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    children?: ReactNode;
};

export default function Section({
    id,
    eyebrow,
    title,
    description,
    children,
}: Props) {
    return (
        <section id={id} className="w-full py-16">
            <div className="mx-auto w-full max-w-6xl px-4">
                <div className="max-w-3xl">
                    {eyebrow && (
                        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.35em] text-[var(--o-amber)] opacity-90">
                            {eyebrow}
                        </p>
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

