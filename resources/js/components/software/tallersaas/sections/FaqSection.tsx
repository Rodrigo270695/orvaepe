import { useState } from 'react';

import { FAQ } from '../data';
import TallerSaaSReveal from '../TallerSaaSReveal';

export default function FaqSection({ whatsappHref }: { whatsappHref?: string }) {
    const [open, setOpen] = useState(0);

    return (
        <section
            id="faq"
            className="scroll-mt-24 py-20 sm:py-28"
            style={{ background: 'var(--ts-bg-alt)', color: 'var(--ts-ink)' }}
        >
            <div className="mx-auto max-w-4xl px-5 sm:px-8">
                <TallerSaaSReveal>
                    <p className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--ts-ember)' }}>
                        Preguntas del taller
                    </p>
                    <h2 className="font-display mt-4 text-4xl font-extrabold sm:text-5xl">
                        Antes de subir el auto al elevador.
                    </h2>
                </TallerSaaSReveal>

                <div className="mt-10 divide-y border-y" style={{ borderColor: 'var(--ts-line)' }}>
                    {FAQ.map((item, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={item.q} style={{ borderColor: 'var(--ts-line)' }}>
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() => setOpen(isOpen ? -1 : i)}
                                    className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
                                >
                                    <span className="font-display text-xl font-bold sm:text-2xl">
                                        {String(i + 1).padStart(2, '0')} {item.q}
                                    </span>
                                    <span aria-hidden style={{ color: 'var(--ts-ember)' }}>
                                        {isOpen ? '–' : '+'}
                                    </span>
                                </button>
                                {isOpen ? (
                                    <p className="pb-5" style={{ color: 'var(--ts-muted)' }}>
                                        {item.a}
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                {whatsappHref ? (
                    <p className="mt-8 text-sm" style={{ color: 'var(--ts-muted)' }}>
                        ¿Otra duda?{' '}
                        <a
                            href={whatsappHref}
                            className="font-semibold underline-offset-4 hover:underline"
                            style={{ color: 'var(--ts-ember)' }}
                        >
                            Escríbenos
                        </a>
                        .
                    </p>
                ) : null}
            </div>
        </section>
    );
}
