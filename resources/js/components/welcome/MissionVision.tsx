import { Eye, Target } from 'lucide-react';

import HomeSection from '@/components/welcome/HomeSection';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

const items = [
    {
        icon: Target,
        label: 'Misión',
        title: 'Software que se entrega',
        text: 'Desarrollar y entregar sistemas listos para operar, con documentación clara, trazabilidad y soporte real. Cada cliente escala por módulos, sin ataduras.',
        step: '01',
        color: '#0D9488',
    },
    {
        icon: Eye,
        label: 'Visión',
        title: 'Referencia en software empresarial',
        text: 'Ser la casa confiable para quien busca desarrollo, licencias y SaaS en Perú: VetSaaS, TallerSaaS y el resto del catálogo.',
        step: '02',
        color: '#EA580C',
    },
] as const;

export default function MissionVision() {
    return (
        <HomeSection id="mision-vision" alt aria-label="Misión y visión de ORVAE">
            <LandingSectionHeader
                className="mb-12 md:mb-16"
                eyebrow="Nos define"
                title="Misión y visión"
                description="Lo que nos mueve y hacia dónde vamos."
            />

            <div className="grid gap-5 md:grid-cols-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <article
                            key={item.label}
                            className="home-glass relative overflow-hidden rounded-3xl p-7 md:p-9"
                            style={{
                                borderTop: `3px solid ${item.color}`,
                                background: `linear-gradient(180deg, color-mix(in oklab, ${item.color} 14%, var(--card)) 0%, var(--card) 40%)`,
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div
                                    className="flex size-12 items-center justify-center rounded-2xl border bg-background"
                                    style={{ color: item.color, borderColor: `color-mix(in oklab, ${item.color} 40%, var(--border))` }}
                                >
                                    <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                                </div>
                                <span className="font-mono text-2xl font-bold tabular-nums" style={{ color: item.color }}>
                                    {item.step}
                                </span>
                            </div>
                            <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: item.color }}>
                                {item.label}
                            </p>
                            <h3 className="font-display mt-2 text-xl font-bold text-foreground md:text-2xl">
                                {item.title}
                            </h3>
                            <p className="mt-3 leading-relaxed text-muted-foreground">{item.text}</p>
                        </article>
                    );
                })}
            </div>
        </HomeSection>
    );
}
