import { useEffect, useState } from 'react';

/**
 * Mascota robot que acompaña el scroll (parallax suave).
 */
export default function VetSaaSScrollPet() {
    const [y, setY] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
            return;
        }

        let frame = 0;
        const onScroll = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
                const progress = Math.min(1, scrollY / max);
                setY(progress * Math.min(window.innerHeight * 0.55, 420));
                setVisible(scrollY > 120);
            });
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed right-3 z-[45] hidden transition-opacity duration-500 md:block"
            style={{
                top: `calc(18vh + ${y}px)`,
                opacity: visible ? 1 : 0,
            }}
        >
            <div className="vs-pet-bob relative">
                <div className="absolute -inset-3 rounded-full bg-[#33A07B]/25 blur-xl" />
                <img
                    src="/images/vetsaas-robot-pet.png"
                    alt=""
                    className="relative size-20 drop-shadow-[0_12px_28px_rgba(0,109,85,0.45)] lg:size-24"
                    draggable={false}
                />
            </div>
        </div>
    );
}
