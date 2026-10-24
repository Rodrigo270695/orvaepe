import { CLINIC_MODULES } from '../data';

export default function ModulesSection() {
    return (
        <section className="vs-bg-soft py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <h2 className="font-display text-3xl font-semibold tracking-tight vs-text-accent-strong sm:text-4xl">
                    Lo que ya opera en la clínica
                </h2>
                <p className="font-body mt-3 max-w-2xl text-sm leading-relaxed vs-text-muted sm:text-base">
                    El mismo panel cubre la consulta, la peluquería, el hotel, el stock y la caja. Los módulos
                    van en todos los planes. Lo que cambia es la cantidad.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {CLINIC_MODULES.map((item, index) => (
                        <article
                            key={item.title}
                            className={[
                                'vs-module-card group',
                                index === 0 ? 'sm:col-span-2' : '',
                            ].join(' ')}
                        >
                            <p className="font-mono text-xs tabular-nums vs-text-accent-bright">
                                {String(index + 1).padStart(2, '0')}
                            </p>
                            <h3 className="font-display mt-3 text-lg font-semibold vs-text-ink">{item.title}</h3>
                            <p className="font-body mt-2 text-sm leading-relaxed vs-text-muted">{item.body}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
