import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type ReactNode, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function HomeMotion({ children }: { children: ReactNode }) {
    const root = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const scope = root.current;
                if (!scope) return;

                scope.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
                    const speed = Number(el.dataset.parallax ?? 8);
                    const parent = el.parentElement;
                    if (!parent) return;
                    gsap.to(el, {
                        yPercent: speed,
                        ease: 'none',
                        scrollTrigger: { trigger: parent, scrub: 0.65, start: 'top bottom', end: 'bottom top' },
                    });
                });

                const mag = scope.querySelector<HTMLElement>('[data-magnetic]');
                if (mag) {
                    const xTo = gsap.quickTo(mag, 'x', { duration: 0.32, ease: 'power3.out' });
                    const yTo = gsap.quickTo(mag, 'y', { duration: 0.32, ease: 'power3.out' });
                    const onMove = (e: PointerEvent) => {
                        const r = mag.getBoundingClientRect();
                        xTo((e.clientX - r.left - r.width / 2) * 0.22);
                        yTo((e.clientY - r.top - r.height / 2) * 0.22);
                    };
                    const reset = () => {
                        xTo(0);
                        yTo(0);
                    };
                    mag.addEventListener('pointermove', onMove);
                    mag.addEventListener('pointerleave', reset);
                    mag.style.willChange = 'transform';

                    return () => {
                        mag.removeEventListener('pointermove', onMove);
                        mag.removeEventListener('pointerleave', reset);
                        mag.style.willChange = '';
                    };
                }
            });

            return () => mm.revert();
        },
        { scope: root },
    );

    return <div ref={root}>{children}</div>;
}
