import { CLINIC_MODULES } from '../data';

export default function ModulesSection() {
    return (
        <section className="bg-[#F3FBF7] py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-[#006D55] sm:text-4xl">
                    Lo que ya opera en la clínica
                </h2>
                <p className="font-body mt-3 max-w-2xl text-sm leading-relaxed text-[#1F6B52] sm:text-base">
                    El mismo panel cubre la consulta, la peluquería, el hotel, el stock y la caja. Los módulos
                    van en todos los planes. Lo que cambia es la cantidad.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {CLINIC_MODULES.map((item, index) => (
                        <article
                            key={item.title}
                            className={[
                                'group relative overflow-hidden rounded-2xl border border-[#99D2BC] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(0,109,85,0.65)] transition-all duration-300 hover:-translate-y-1 hover:border-[#006D55] hover:shadow-[0_28px_50px_-28px_rgba(0,109,85,0.8)]',
                                index === 0 ? 'sm:col-span-2' : '',
                            ].join(' ')}
                        >
                            <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#006D55] transition-transform duration-500 group-hover:scale-x-100" />
                            <p className="font-mono text-xs tabular-nums text-[#33A07B]">
                                {String(index + 1).padStart(2, '0')}
                            </p>
                            <h3 className="font-display mt-3 text-lg font-semibold text-[#06241C]">{item.title}</h3>
                            <p className="font-body mt-2 text-sm leading-relaxed text-[#1F6B52]">{item.body}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
