'use client';

import Lenis from 'lenis';
import { useEffect, type ReactNode } from 'react';

import 'lenis/dist/lenis.css';

type Props = {
    children: ReactNode;
};

/**
 * Smooth scroll (Lenis) solo en la landing VetSaaS.
 * Sin GSAP stagger: evitaba que las cards quedaran invisibles (hueco vacío).
 */
export default function VetSaaSMotionRoot({ children }: Props) {
    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return;

        const lenis = new Lenis({
            duration: 1.15,
            smoothWheel: true,
            touchMultiplier: 1.1,
            wheelMultiplier: 0.95,
        });

        let frame = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            frame = requestAnimationFrame(raf);
        };
        frame = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(frame);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
