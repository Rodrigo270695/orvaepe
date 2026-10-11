import { useState } from 'react';

import VetSaaSReveal from '@/components/software/VetSaaSReveal';

import { FAQS } from '../data';

type ItemProps = {
    question: string;
    answer: string;
    open: boolean;
    onToggle: () => void;
};

function FaqItem({ question, answer, open, onToggle }: ItemProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#99D2BC] bg-white">
            <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D55]"
                aria-expanded={open}
                onClick={onToggle}
            >
                <span className="font-display text-base font-semibold text-[#06241C]">{question}</span>
                <span
                    className={[
                        'grid size-7 shrink-0 place-items-center rounded-full border border-[#99D2BC] text-lg leading-none text-[#006D55] transition-transform duration-300',
                        open ? 'rotate-45 bg-[#E7F6EF]' : '',
                    ].join(' ')}
                    aria-hidden
                >
                    +
                </span>
            </button>
            <div
                className={[
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                ].join(' ')}
            >
                <div className="overflow-hidden">
                    <p className="font-body px-5 pb-5 text-sm leading-relaxed text-[#1F6B52]">{answer}</p>
                </div>
            </div>
        </div>
    );
}

export default function FaqSection() {
    const [open, setOpen] = useState(0);

    return (
        <VetSaaSReveal>
            <section
                id="faq-software-veterinario"
                className="scroll-mt-24 border-t border-[var(--vs-border)] bg-[var(--vs-bg)] py-16"
            >
                <div className="mx-auto max-w-3xl px-5 sm:px-8">
                    <h2 className="font-display text-3xl font-semibold tracking-tight text-[#006D55]">
                        Preguntas de la clínica
                    </h2>
                    <div className="mt-8 space-y-3">
                        {FAQS.map((item, index) => (
                            <FaqItem
                                key={item.q}
                                question={item.q}
                                answer={item.a}
                                open={open === index}
                                onToggle={() => setOpen(open === index ? -1 : index)}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </VetSaaSReveal>
    );
}
