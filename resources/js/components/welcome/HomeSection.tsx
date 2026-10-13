import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Props = {
    id?: string;
    alt?: boolean;
    className?: string;
    children: ReactNode;
    'aria-label'?: string;
    'aria-labelledby'?: string;
};

export default function HomeSection({
    id,
    alt = false,
    className,
    children,
    ...aria
}: Props) {
    return (
        <section
            id={id}
            className={cn(
                'home-section relative scroll-mt-28 py-20 md:py-28',
                alt && 'home-section--alt',
                className,
            )}
            {...aria}
        >
            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
        </section>
    );
}
