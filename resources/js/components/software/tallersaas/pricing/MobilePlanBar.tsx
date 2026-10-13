import { useEffect, useState } from 'react';

type Props = {
    title: string;
    priceLine?: string;
};

const HIDE_WHEN_VISIBLE = ['#planes', '#ts-checkout', 'footer'];

export default function MobilePlanBar({ title, priceLine }: Props) {
    const [pastHero, setPastHero] = useState(false);
    const [blocked, setBlocked] = useState(false);

    useEffect(() => {
        const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.9);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        const visible = new Set<Element>();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
            setBlocked(visible.size > 0);
        });
        HIDE_WHEN_VISIBLE.forEach((selector) => {
            const el = document.querySelector(selector);
            if (el) observer.observe(el);
        });

        return () => {
            window.removeEventListener('scroll', onScroll);
            observer.disconnect();
        };
    }, []);

    const show = pastHero && !blocked;

    return (
        <div
            aria-hidden={!show}
            className={[
                'fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition md:hidden',
                show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
            ].join(' ')}
        >
            <div className="mr-[4.5rem] flex items-center gap-3 border border-[#ea580c] bg-[#0b1220]/95 py-2.5 pl-4 pr-2.5 backdrop-blur">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-[#b7b0a4]">{title}</p>
                    <p className="font-display truncate text-base font-extrabold text-white">{priceLine || 'Prueba gratis'}</p>
                </div>
                <button
                    type="button"
                    tabIndex={show ? 0 : -1}
                    onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
                    className="shrink-0 cursor-pointer rounded-md bg-[#ea580c] px-4 py-2.5 text-sm font-semibold text-white"
                >
                    Ver planes
                </button>
            </div>
        </div>
    );
}
