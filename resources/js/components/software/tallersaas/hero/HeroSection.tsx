import DemoCredentials from './DemoCredentials';
import HeroStage from './HeroStage';

type Props = {
    demoUrl: string;
    demoUser: string;
    demoPassword: string;
};

export default function HeroSection({ demoUrl, demoUser, demoPassword }: Props) {
    return (
        <section className="relative overflow-hidden" style={{ color: 'var(--ts-ink)', background: 'var(--ts-bg)' }}>
            <div className="ts-bay-lines pointer-events-none absolute inset-0 opacity-70" aria-hidden />
            <div
                className="ts-ember-pulse pointer-events-none absolute -left-24 top-10 size-[28rem] rounded-full blur-[110px]"
                style={{ background: 'var(--ts-bay-a)' }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute right-0 top-1/3 size-[22rem] rounded-full blur-[90px]"
                style={{ background: 'var(--ts-bay-b)' }}
                aria-hidden
            />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-[8.5rem] sm:px-8 lg:min-h-dvh lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-16 lg:pt-[9.5rem]">
                <div>
                    <p
                        className="ts-plate inline-flex items-center gap-2 rounded-sm border px-3 py-1 font-display text-xs font-extrabold tracking-[0.22em]"
                        style={{
                            borderColor: 'color-mix(in srgb, var(--ts-plate) 70%, transparent)',
                            background: 'var(--ts-plate)',
                            color: 'var(--ts-on-plate)',
                        }}
                    >
                        TallerSaaS · Perú
                    </p>

                    <h1 className="font-display ts-rise mt-6 max-w-xl text-[3.15rem] font-extrabold leading-[0.92] tracking-tight sm:text-7xl">
                        El auto entra.
                        <span className="mt-1 block" style={{ color: 'var(--ts-ember)' }}>
                            El taller ya sabe.
                        </span>
                    </h1>

                    <p
                        className="font-body ts-rise mt-6 max-w-lg text-lg leading-relaxed"
                        style={{ animationDelay: '0.15s', color: 'var(--ts-muted)' }}
                    >
                        Órdenes, car wash, WhatsApp, repuestos y SUNAT. Un solo piso para el taller que repara y también lava.
                    </p>

                    <div className="ts-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.28s' }}>
                        <a href="#planes" className="ts-btn font-body">
                            Ver planes
                        </a>
                        <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="ts-btn-ghost font-body">
                            Probar la demo
                        </a>
                    </div>

                    <DemoCredentials url={demoUrl} user={demoUser} password={demoPassword} />

                    <dl
                        className="ts-rise mt-12 grid max-w-lg grid-cols-3 gap-4 border-t pt-6"
                        style={{ animationDelay: '0.4s', borderColor: 'var(--ts-line)' }}
                    >
                        {[
                            ['48 h · 2 h', 'aviso de cita'],
                            ['OT + lavado', 'misma caja'],
                            ['SUNAT', 'boleta y factura'],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <dt className="font-display text-lg font-bold" style={{ color: 'var(--ts-ink-strong)' }}>
                                    {k}
                                </dt>
                                <dd className="mt-1 text-xs" style={{ color: 'var(--ts-muted)' }}>
                                    {v}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <HeroStage />
            </div>
        </section>
    );
}
