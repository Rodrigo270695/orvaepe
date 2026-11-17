import { FAQ } from '../data';

export default function FaqSection() {
    return (
        <section className="px-5 py-20 sm:px-8" aria-labelledby="fs-faq-title">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
                <div>
                    <p className="fs-kicker">Antes de sentarte</p>
                    <h2 id="fs-faq-title" className="fs-display mt-4 text-4xl text-[var(--fs-wine-deep)] sm:text-5xl">
                        Preguntas de la casa.
                    </h2>
                </div>
                <div>
                    {FAQ.map((item) => (
                        <details key={item.q} className="group border-b border-[#c4a574]/70 py-4">
                            <summary className="cursor-pointer list-none font-sans text-base font-semibold text-[var(--fs-ink)] [&::-webkit-details-marker]:hidden">
                                <span className="flex items-start justify-between gap-4">
                                    {item.q}
                                    <span className="font-mono text-xs text-[var(--fs-wine)] group-open:hidden" aria-hidden>
                                        +
                                    </span>
                                    <span className="hidden font-mono text-xs text-[var(--fs-wine)] group-open:inline" aria-hidden>
                                        –
                                    </span>
                                </span>
                            </summary>
                            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-[var(--fs-muted)]">{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
