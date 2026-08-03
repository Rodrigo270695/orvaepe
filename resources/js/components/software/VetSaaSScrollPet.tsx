'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Mascota robot: flota, brilla y baja con el scroll (GSAP ScrollTrigger).
 */
export default function VetSaaSScrollPet() {
    const rootRef = useRef<HTMLDivElement>(null);
    const petRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const root = rootRef.current;
        const pet = petRef.current;
        const glow = glowRef.current;
        if (!root || !pet) return;

        if (reduce) {
            gsap.set(root, { autoAlpha: 1 });
            return;
        }

        gsap.set(root, { autoAlpha: 0 });

        gsap.to(pet, {
            y: -16,
            rotation: 4,
            duration: 2.6,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        });

        if (glow) {
            gsap.to(glow, {
                scale: 1.35,
                opacity: 0.85,
                duration: 2.1,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });
        }

        const travel = Math.min(window.innerHeight * 0.68, 560);

        ScrollTrigger.create({
            start: 0,
            end: 'max',
            scrub: 0.7,
            onUpdate: (self) => {
                const p = self.progress;
                gsap.set(root, {
                    autoAlpha: p > 0.015 ? 1 : 0,
                    y: p * travel,
                    x: Math.sin(p * Math.PI * 2.2) * 22,
                    rotation: Math.sin(p * Math.PI * 2.8) * 8,
                });
            },
        });
    }, []);

    return (
        <div
            ref={rootRef}
            aria-hidden
            className="pointer-events-none fixed right-2 top-[14vh] z-[45] hidden md:block lg:right-5"
        >
            <div ref={petRef} className="relative will-change-transform">
                <div
                    ref={glowRef}
                    className="absolute left-1/2 top-[55%] size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(51,160,123,0.55)_0%,transparent_68%)] blur-lg"
                />
                <img
                    src="/images/vetsaas-robot-pet.png"
                    alt=""
                    className="relative size-24 drop-shadow-[0_18px_36px_rgba(0,109,85,0.5)] lg:size-[7.25rem]"
                    draggable={false}
                />
                <span className="absolute left-0 top-4 size-2 animate-ping rounded-full bg-[#5BC49A]/80" />
                <span className="absolute bottom-6 right-0 size-1.5 rounded-full bg-[#99D2BC] shadow-[0_0_10px_#33A07B]" />
            </div>
        </div>
    );
}
