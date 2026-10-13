import { DEMO_URL } from '../data';
import HeroStage from './HeroStage';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden text-[#f4efe6]">
            <div className="ts-bay-lines pointer-events-none absolute inset-0 opacity-70" aria-hidden />
            <div
                className="ts-ember-pulse pointer-events-none absolute -left-24 top-10 size-[28rem] rounded-full bg-[#ea580c]/25 blur-[110px]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute right-0 top-1/3 size-[22rem] rounded-full bg-[#1e3a5f]/50 blur-[90px]"
                aria-hidden
            />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
                <div>
                    <p className="ts-plate inline-flex items-center gap-2 rounded-sm border border-[#f5c518]/70 bg-[#f5c518] px-3 py-1 font-display text-xs font-extrabold tracking-[0.22em] text-[#0b1220]">
                        TallerSaaS · Perú
                    </p>

                    <h1 className="font-display ts-rise mt-6 max-w-xl text-[3.15rem] font-extrabold leading-[0.92] tracking-tight sm:text-7xl">
                        El auto entra.
                        <span className="mt-1 block text-[#ea580c]">El taller ya sabe.</span>
                    </h1>

                    <p
                        className="font-body ts-rise mt-6 max-w-lg text-lg leading-relaxed text-[#cfc6b8]"
                        style={{ animationDelay: '0.15s' }}
                    >
                        Órdenes, car wash, WhatsApp, repuestos y SUNAT. Un solo piso para el taller que repara y también lava.
                    </p>

                    <div className="ts-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.28s' }}>
                        <a
                            href="#planes"
                            className="font-body inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#ea580c] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_-16px_rgba(234,88,12,0.95)] transition hover:bg-[#c2410c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
                        >
                            Ver planes
                        </a>
                        <a
                            href={DEMO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body inline-flex cursor-pointer rounded-md border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#ea580c] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                        >
                            Probar la demo
                        </a>
                    </div>

                    <dl className="ts-rise mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6" style={{ animationDelay: '0.4s' }}>
                        {[
                            ['48 h · 2 h', 'aviso de cita'],
                            ['OT + lavado', 'misma caja'],
                            ['SUNAT', 'boleta y factura'],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <dt className="font-display text-lg font-bold text-white">{k}</dt>
                                <dd className="mt-1 text-xs text-[#b7b0a4]">{v}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <HeroStage />
            </div>
        </section>
    );
}
