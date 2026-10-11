import type { ReactNode } from 'react';

import VetSaaSReveal from '@/components/software/VetSaaSReveal';

import CountUp from '../CountUp';

type Props = {
    clinics: number;
};

export default function StatsBand({ clinics }: Props) {
    const items: Array<{ value: ReactNode; label: string }> = [
        {
            value: (
                <>
                    <CountUp to={clinics} />+
                </>
            ),
            label: 'veterinarias operan con nosotros',
        },
        { value: '48 h · 2 h', label: 'antes de cada cita sale el recordatorio' },
        { value: '8', label: 'módulos en un solo panel' },
        { value: '24/7', label: 'asistente de IA en el WhatsApp' },
    ];

    return (
        <section className="relative overflow-hidden border-y border-[#015743] bg-[#006D55] text-white">
            <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
                    backgroundSize: '22px 22px',
                }}
                aria-hidden
            />
            <div className="relative mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
                {items.map((item, index) => (
                    <VetSaaSReveal key={item.label} delay={index * 0.08}>
                        <div
                            className={[
                                'h-full px-5 py-9 sm:px-8 lg:py-12',
                                index % 2 === 1 ? 'border-l border-white/15' : '',
                                index >= 2 ? 'border-t border-white/15 lg:border-t-0' : '',
                                index === 2 ? 'lg:border-l' : '',
                            ].join(' ')}
                        >
                            <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl xl:text-6xl">
                                {item.value}
                            </p>
                            <p className="font-body mt-2 max-w-[14rem] text-sm leading-snug text-[#CDEDE0] sm:text-base">
                                {item.label}
                            </p>
                        </div>
                    </VetSaaSReveal>
                ))}
            </div>
        </section>
    );
}
