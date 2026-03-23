'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type Props = {
    children: ReactNode;
    /** Clases adicionales para el wrapper */
    className?: string;
    /** Margen para activar antes de entrar (ej. "-50px" para disparar 50px antes) */
    rootMargin?: string;
    /** Porcentaje visible para considerar "en vista" (0-1) */
    threshold?: number;
  /** Dirección del efecto: up (sube), down (baja), left, right, none (solo fade) */
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
};

const translateByDirection = {
    up: 'translateY(1.5rem)',
    down: 'translateY(-1.5rem)',
    left: 'translateX(1.5rem)',
    right: 'translateX(-1.5rem)',
    none: 'none',
};

export default function ScrollReveal({
    children,
    className = '',
    rootMargin = '-40px 0px -40px 0px',
    threshold = 0.05,
    direction = 'up',
}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(mq.matches);
        update();

        if ('addEventListener' in mq) {
            mq.addEventListener('change', update);
            return () => mq.removeEventListener('change', update);
        }

        mq.addListener(update);
        return () => mq.removeListener(update);
    }, []);

    useEffect(() => {
        if (prefersReducedMotion) setIsVisible(true);
    }, [prefersReducedMotion]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { rootMargin, threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [rootMargin, threshold]);

    const initialTransform =
        translateByDirection[direction] === 'none'
            ? 'scale(0.985)'
            : `${translateByDirection[direction]} scale(0.985)`;

    const transform = prefersReducedMotion ? 'none' : !isVisible ? initialTransform : 'none';
    const filter = prefersReducedMotion ? 'none' : !isVisible ? 'blur(10px)' : 'blur(0px)';

    return (
        <div
            ref={ref}
            className={`scroll-reveal ${className}`}
            data-visible={isVisible}
            style={{
                opacity: prefersReducedMotion ? 1 : isVisible ? 1 : 0,
                transform,
                filter,
                transition:
                    'opacity 0.6s ease-out, transform 0.6s ease-out, filter 0.6s ease-out',
            }}
        >
            {children}
        </div>
    );
}
