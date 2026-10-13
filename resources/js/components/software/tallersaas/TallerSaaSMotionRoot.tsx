import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect, type ReactNode } from 'react';

import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

type Props = { children: ReactNode };

export default function TallerSaaSMotionRoot({ children }: Props) {
    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.05,
            smoothWheel: true,
            touchMultiplier: 1.1,
            wheelMultiplier: 0.9,
        });

        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(tick);
            lenis.destroy();
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    return <>{children}</>;
}
