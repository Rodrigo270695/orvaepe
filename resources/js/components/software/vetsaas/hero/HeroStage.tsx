import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import { HERO_FRAMES } from '../data';
import HeroFloatingCards from './HeroFloatingCards';

const FRAME_INTERVAL_MS = 4600;

export default function HeroStage() {
    const [frame, setFrame] = useState(0);
    const reduce = useReducedMotion();

    useEffect(() => {
        if (reduce) return;
        const id = window.setInterval(() => {
            setFrame((current) => (current + 1) % HERO_FRAMES.length);
        }, FRAME_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [reduce]);

    return (
        <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[#99D2BC] bg-[#CFEBDF] shadow-[0_40px_80px_-40px_rgba(0,109,85,0.7)] sm:aspect-square lg:aspect-[4/5]">
                {HERO_FRAMES.map((item, index) => (
                    <img
                        key={item.src}
                        src={item.src}
                        alt={index === frame ? item.alt : ''}
                        aria-hidden={index !== frame}
                        width={1000}
                        height={1250}
                        fetchPriority={index === 0 ? 'high' : 'low'}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding={index === 0 ? 'sync' : 'async'}
                        className={[
                            'absolute inset-0 size-full object-cover transition-[opacity,transform,filter] duration-[1400ms] ease-out',
                            index === frame ? 'vs-hero-drift opacity-100 blur-0' : 'scale-110 opacity-0 blur-sm',
                        ].join(' ')}
                    />
                ))}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#06241C]/55 to-transparent" />
                <div className="absolute right-5 top-5 flex gap-2 rounded-full border border-white/40 bg-[#06241C]/30 px-2.5 py-2 backdrop-blur">
                    {HERO_FRAMES.map((item, index) => (
                        <button
                            key={item.src}
                            type="button"
                            aria-label={`Ver imagen ${index + 1}`}
                            aria-pressed={index === frame}
                            onClick={() => setFrame(index)}
                            className={[
                                'h-2 cursor-pointer rounded-full border border-white/70 transition-all duration-500',
                                index === frame ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60',
                            ].join(' ')}
                        />
                    ))}
                </div>
            </div>

            <HeroFloatingCards />
        </div>
    );
}
