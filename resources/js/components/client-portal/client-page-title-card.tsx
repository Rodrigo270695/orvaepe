import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: ReactNode;
    className?: string;
};

export function ClientPageTitleCard({ title, description, className }: Props) {
    return (
        <div
            className={`rounded-xl border border-[color-mix(in_oklab,var(--state-info)_24%,var(--border))] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_90%,var(--background)),color-mix(in_oklab,var(--state-info)_10%,transparent))] px-5 py-4 shadow-[0_14px_32px_-24px_color-mix(in_oklab,var(--state-info)_60%,transparent)] sm:px-6 sm:py-5 ${className ?? ''}`}
        >
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {title}
            </h1>
            {description ? (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

