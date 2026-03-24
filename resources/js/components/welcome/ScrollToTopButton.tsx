'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 400;

export default function ScrollToTopButton({ className = '' }: { className?: string }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setVisible(typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!visible) return null;

    return (
        <button
            type="button"
            onClick={scrollToTop}
            className={[
                'fixed bottom-6 right-6 z-50 flex size-12 cursor-pointer items-center justify-center rounded-full',
                'border border-border/60 bg-[color-mix(in_oklab,var(--primary)_92%,transparent)] text-primary-foreground shadow-[0_4px_24px_var(--o-glow),0_0_0_1px_color-mix(in_oklab,var(--foreground)_12%,transparent)_inset]',
                'backdrop-blur-md transition-all duration-200 hover:scale-110 hover:shadow-[0_12px_40px_var(--hero-glow-mid)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95',
                'dark:border-border/50 dark:bg-primary/95 dark:shadow-[0_8px_32px_var(--hero-glow-soft)]',
                'md:size-14 md:bottom-8 md:right-8',
                className,
            ].join(' ')}
            aria-label="Volver arriba"
        >
            <ChevronUp className="size-6 md:size-7" strokeWidth={2.5} />
        </button>
    );
}
