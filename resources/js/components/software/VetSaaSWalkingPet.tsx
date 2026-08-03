'use client';

import { useEffect, useState } from 'react';

const FRAMES = [
    '/images/vetsaas-pet-walk/frame-01.png',
    '/images/vetsaas-pet-walk/frame-02.png',
    '/images/vetsaas-pet-walk/frame-03.png',
    '/images/vetsaas-pet-walk/frame-04.png',
] as const;

type Props = {
    className?: string;
};

/**
 * Mascota caminando sin pedestal; ciclo lento y natural.
 */
export default function VetSaaSWalkingPet({ className }: Props) {
    const [frame, setFrame] = useState(0);
    const [reduce, setReduce] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const sync = () => setReduce(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    useEffect(() => {
        if (reduce) return;
        // ~3.2 fps → caminata calmada
        const id = window.setInterval(() => {
            setFrame((f) => (f + 1) % FRAMES.length);
        }, 310);
        return () => window.clearInterval(id);
    }, [reduce]);

    useEffect(() => {
        for (const src of FRAMES) {
            const img = new Image();
            img.src = src;
        }
    }, []);

    return (
        <div
            className={['pointer-events-none select-none', className].filter(Boolean).join(' ')}
            aria-hidden
        >
            <style>{`
                @keyframes vs-walk-pace {
                    0% { transform: translateX(-10%); }
                    50% { transform: translateX(10%); }
                    100% { transform: translateX(-10%); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .vs-walk-pace { animation: none !important; transform: none !important; }
                }
            `}</style>

            <div className="relative mx-auto w-full max-w-[15rem] overflow-hidden px-1">
                <div
                    className="vs-walk-pace relative"
                    style={
                        reduce
                            ? undefined
                            : {
                                  animation: 'vs-walk-pace 9s ease-in-out infinite',
                              }
                    }
                >
                    <div className="relative mx-auto h-[7.5rem] w-44 sm:h-32 sm:w-48">
                        {FRAMES.map((src, i) => (
                            <img
                                key={src}
                                src={src}
                                alt=""
                                draggable={false}
                                className="absolute inset-0 mx-auto h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_12px_20px_rgba(0,0,0,0.4)] transition-opacity duration-200 ease-out"
                                style={{ opacity: frame === i ? 1 : 0 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
