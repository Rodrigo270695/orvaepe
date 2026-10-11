import VetSaaSReveal from '@/components/software/VetSaaSReveal';

import { NOVELTIES } from '../data';

export default function NoveltiesSection() {
    return (
        <VetSaaSReveal>
            <section className="bg-[var(--vs-card)] py-16">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <h2 className="font-display text-3xl font-semibold tracking-tight">Lo que está llegando</h2>
                    <div className="mt-8 divide-y divide-[#06241C]/10 border-y border-[#06241C]/10">
                        {NOVELTIES.map((item) => (
                            <article key={item.title} className="grid gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-8">
                                <p className="font-body text-sm font-medium text-[#006D55]">{item.tag}</p>
                                <div>
                                    <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                                    <p className="font-body vs-muted mt-1 text-sm">{item.body}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-14 flex flex-col gap-6 border-t border-[#06241C]/10 pt-10 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-xl">
                            <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                                Identidad digital para mascotas
                            </h3>
                            <p className="font-body vs-muted mt-3 text-sm leading-relaxed">
                                AlmaPet ID complementa VetSaaS: perfil público, búsqueda y certificados para la clínica.
                            </p>
                        </div>
                        <a
                            href="https://almapetid.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body inline-flex shrink-0 cursor-pointer rounded-xl border border-[#06241C] bg-[#06241C] px-5 py-3 text-sm font-semibold text-white transition-transform hover:bg-[#015743] active:translate-y-px"
                        >
                            Conocer AlmaPet ID
                        </a>
                    </div>
                </div>
            </section>
        </VetSaaSReveal>
    );
}
