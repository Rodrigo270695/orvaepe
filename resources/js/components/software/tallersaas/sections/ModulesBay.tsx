import { BAYS } from '../data';
import TallerSaaSReveal from '../TallerSaaSReveal';

export default function ModulesBay() {
    return (
        <section className="py-20 sm:py-28" style={{ background: 'var(--ts-bg-alt)', color: 'var(--ts-ink)' }}>
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <TallerSaaSReveal>
                    <p className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--ts-ember)' }}>
                        Piso del taller
                    </p>
                    <h2 className="font-display mt-4 max-w-3xl text-4xl font-extrabold leading-[0.95] sm:text-6xl">
                        Ocho bahías. El mismo panel.
                    </h2>
                    <p className="mt-4 max-w-xl" style={{ color: 'var(--ts-muted)' }}>
                        Los módulos van en todos los planes. Lo que cambia es la cantidad de sedes, usuarios y comprobantes.
                    </p>
                </TallerSaaSReveal>

                <div className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: 'var(--ts-line)' }}>
                    {BAYS.map((bay, i) => (
                        <TallerSaaSReveal key={bay.code} delay={i * 0.04} className="h-full">
                            <article
                                className="flex h-full flex-col border-l-2 p-5"
                                style={{ borderColor: 'var(--ts-ember)', background: 'var(--ts-bg-alt)' }}
                            >
                                <p className="font-display text-sm font-bold tracking-[0.16em]" style={{ color: 'var(--ts-ember)' }}>
                                    {bay.code}
                                </p>
                                <h3 className="font-display mt-3 text-2xl font-extrabold leading-none">{bay.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ts-muted)' }}>
                                    {bay.body}
                                </p>
                            </article>
                        </TallerSaaSReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
