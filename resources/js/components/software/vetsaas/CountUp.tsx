import { useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type Props = {
    to: number;
    duration?: number;
};

export default function CountUp({ to, duration = 1600 }: Props) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const reduce = useReducedMotion();
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduce) {
            setValue(to);
            return;
        }

        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, reduce, to, duration]);

    return (
        <span ref={ref} className="tabular-nums">
            {value}
        </span>
    );
}
