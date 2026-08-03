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
 * Mascota robot caminando sobre su base (4 frames + desplazamiento).
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
        const id = window.setInterval(() => {
            setFrame((f) => (f + 1) % FRAMES.length);
        }, 130);
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
                    0% { transform: translateX(-14%); }
                    50% { transform: translateX(14%); }
                    100% { transform: translateX(-14%); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .vs-walk-pace { animation: none !important; transform: none !important; }
                }
            `}</style>

            <div className="relative mx-auto w-full max-w-[16rem] overflow-hidden px-1 pt-1">
                {/* Sombra de piso bajo la base del sprite */}
                <div className="pointer-events-none absolute inset-x-6 bottom-1 z-0 h-3 rounded-[100%] bg-black/40 blur-md" />

                <div
                    className="vs-walk-pace relative z-10"
                    style={
                        reduce
                            ? undefined
                            : { animation: 'vs-walk-pace 5s ease-in-out infinite' }
                    }
                >
                    <div className="relative mx-auto h-32 w-[11.5rem] sm:h-36 sm:w-52">
                        {FRAMES.map((src, i) => (
                            <img
                                key={src}
                                src={src}
                                alt=""
                                draggable={false}
                                className="absolute inset-0 mx-auto h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
                                style={{ opacity: frame === i ? 1 : 0 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
