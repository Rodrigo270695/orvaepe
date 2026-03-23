import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: ReactNode;
    className?: string;
};

export function ClientPageTitleCard({ title, description, className }: Props) {
    return (
        <div
            className={`rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5 ${className ?? ''}`}
        >
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
                {title}
            </h1>
            {description ? (
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

