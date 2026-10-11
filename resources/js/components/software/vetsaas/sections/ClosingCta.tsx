import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

import CountUp from '../CountUp';

type Props = {
    clinics: number;
    whatsappHref?: string;
};

export default function ClosingCta({ clinics, whatsappHref }: Props) {
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const scale = useTransform(scrollYProgress, [0, 0.4], [0.92, 1]);
    const petY = useTransform(scrollYProgress, [0, 1], [80, -80]);
    const glowX = useTransform(scrollYProgress, [0, 1], ['-20%', '40%']);

    return (
        <section ref={ref} className="overflow-hidden bg-[#F3FBF7] px-5 py-20 sm:px-8 sm:py-24">
            <motion.div
                style={reduce ? undefined : { scale }}
                className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] border border-[#015743] bg-[#006D55] px-7 py-14 text-white shadow-[0_40px_90px_-40px_rgba(0,109,85,0.9)] sm:px-14 sm:py-16"
            >
                <motion.div
                    style={reduce ? undefined : { x: glowX }}
                    className="pointer-events-none absolute -top-32 left-0 h-80 w-[36rem] rounded-full bg-[#3CB88A]/40 blur-[90px]"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)',
                        backgroundSize: '22px 22px',
                    }}
                    aria-hidden
                />

                <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
                    <div>
                        <p className="font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl">
                            <CountUp to={clinics} />+
                        </p>
                        <p className="mt-2 text-base text-[#CDEDE0]">veterinarias ya operan con nosotros</p>
                        <h2 className="font-display mt-8 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                            Tu clínica, tu subdominio. Empieza hoy.
                        </h2>
                        <p className="mt-4 max-w-lg text-base text-[#E3F3EC]">
                            Activa Free o un plan de pago. Al confirmar entras a crear tu contraseña y la IA empieza a responder.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href="#planes"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white bg-white px-6 py-3.5 text-sm font-semibold text-[#006D55] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5 hover:bg-[#E7F6EF] active:translate-y-px"
                            >
                                Empieza gratis <span aria-hidden>→</span>
                            </a>
                            {whatsappHref ? (
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex cursor-pointer items-center rounded-xl border border-white/50 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                                >
                                    Hablar con ventas
                                </a>
                            ) : null}
                        </div>
                    </div>

                    <motion.img
                        src="/images/vetsaas-robot-pet.webp"
                        alt=""
                        style={reduce ? undefined : { y: petY }}
                        className="mx-auto hidden w-full max-w-xs drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)] lg:block"
                    />
                </div>
            </motion.div>
        </section>
    );
}
