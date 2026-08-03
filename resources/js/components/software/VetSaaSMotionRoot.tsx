'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect, useRef, type ReactNode } from 'react';

import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

type Props = {
    children: ReactNode;
};

/**
 * Smooth scroll (Lenis) sincronizado con GSAP — stack tendencia 2026.
 */
export default function VetSaaSMotionRoot({ children }: Props) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return;

        const lenis = new Lenis({
            duration: 1.2,
            smoothWheel: true,
            touchMultiplier: 1.15,
            wheelMultiplier: 0.95,
        });

        lenis.on('scroll', ScrollTrigger.update);

        const ticker = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(ticker);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(ticker);
            lenis.destroy();
        };
    }, []);

    useGSAP(
        () => {
            const root = rootRef.current;
            if (!root) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            const cards = gsap.utils.toArray<HTMLElement>('[data-vs-stagger] > *', root);
            if (cards.length) {
                gsap.from(cards, {
                    autoAlpha: 0,
                    y: 36,
                    scale: 0.96,
                    duration: 0.75,
                    stagger: 0.09,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: cards[0].parentElement,
                        start: 'top 86%',
                        toggleActions: 'play none none none',
                    },
                });
            }
        },
        { scope: rootRef },
    );

    return <div ref={rootRef}>{children}</div>;
}
