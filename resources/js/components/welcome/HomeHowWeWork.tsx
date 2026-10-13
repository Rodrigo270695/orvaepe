import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { KeyRound, Layers3, Rocket } from 'lucide-react';
import { useRef } from 'react';

import HomeSection from '@/components/welcome/HomeSection';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        n: '01',
        icon: Layers3,
        title: 'Desarrollamos',
        text: 'Sistemas propios y a medida. VetSaaS, TallerSaaS o el panel que tu operación necesita.',
    },
    {
        n: '02',
        icon: KeyRound,
        title: 'Licenciamos',
        text: 'SaaS, licencia perpetua o módulos. Eliges cómo pagas; nosotros entregamos la clave o el subdominio.',
    },
    {
        n: '03',
        icon: Rocket,
        title: 'Operas',
        text: 'Entras, facturas, avisas por WhatsApp. Soporte real cuando el piso ya está en marcha.',
    },
] as const;

export default function HomeHowWeWork() {
    const root = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const items = root.current?.querySelectorAll('[data-how-step]');
                if (!items?.length) return;
                gsap.from(items, {
                    y: 22,
                    duration: 0.45,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: root.current, start: 'top 82%' },
                });
            });
            return () => mm.revert();
        },
        { scope: root },
    );

    return (
        <HomeSection id="como-trabajamos" aria-label="Cómo trabaja ORVAE">
            <div ref={root}>
                <LandingSectionHeader
                    className="mb-12 md:mb-16"
                    eyebrow="Método"
                    title="Tres formas de entrar. Un mismo partner."
                    description="Desarrollo, licencias y SaaS no son líneas sueltas. Son el mismo equipo en Perú."
                    layout="wide"
                    titleSize="hero"
                />

                <ol className="grid gap-5 md:grid-cols-3">
                    {steps.map(({ n, icon: Icon, title, text }) => (
                        <li
                            key={n}
                            data-how-step
                            className="home-glass relative overflow-hidden rounded-3xl p-6 md:p-8"
                        >
                            <span className="font-mono text-3xl font-bold tabular-nums text-[color-mix(in_oklab,var(--o-amber)_55%,var(--border))]">
                                {n}
                            </span>
                            <div className="mt-5 flex size-12 items-center justify-center rounded-2xl border border-border bg-background text-[var(--o-amber)]">
                                <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                            </div>
                            <h3 className="font-display mt-5 text-xl font-bold text-foreground">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </HomeSection>
    );
}
