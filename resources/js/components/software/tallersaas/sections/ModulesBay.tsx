import { BAYS } from '../data';
import TallerSaaSReveal from '../TallerSaaSReveal';

export default function ModulesBay() {
    return (
        <section className="bg-[#fff7ed] py-20 text-[#0b1220] sm:py-28">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <TallerSaaSReveal>
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#ea580c]">Piso del taller</p>
                    <h2 className="font-display mt-4 max-w-3xl text-4xl font-extrabold leading-[0.95] sm:text-6xl">
                        Ocho bahías. El mismo panel.
                    </h2>
                    <p className="mt-4 max-w-xl text-[#4b5563]">
                        Los módulos van en todos los planes. Lo que cambia es la cantidad de sedes, usuarios y comprobantes.
                    </p>
                </TallerSaaSReveal>

                <div className="mt-12 grid gap-px bg-[#1e3a5f]/20 sm:grid-cols-2 lg:grid-cols-4">
                    {BAYS.map((bay, i) => (
                        <TallerSaaSReveal key={bay.code} delay={i * 0.04} className="bg-[#fff7ed]">
                            <article className="flex h-full flex-col border-l-2 border-[#ea580c] bg-[#fff7ed] p-5">
                                <p className="font-display text-sm font-bold tracking-[0.16em] text-[#ea580c]">{bay.code}</p>
                                <h3 className="font-display mt-3 text-2xl font-extrabold leading-none">{bay.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">{bay.body}</p>
                            </article>
                        </TallerSaaSReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
