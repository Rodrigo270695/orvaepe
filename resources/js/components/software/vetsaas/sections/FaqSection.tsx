import { useState } from 'react';

import VetSaaSReveal from '@/components/software/VetSaaSReveal';

import { FAQS } from '../data';

type ItemProps = {
    index: number;
    question: string;
    answer: string;
    open: boolean;
    onToggle: () => void;
};

function FaqItem({ index, question, answer, open, onToggle }: ItemProps) {
    return (
        <div
            className={[
                'overflow-hidden rounded-2xl border transition-all duration-300',
                open
                    ? 'border-[#006D55] bg-white shadow-[0_20px_40px_-28px_rgba(0,109,85,0.7)]'
                    : 'border-[#99D2BC] bg-white/70 hover:border-[#33A07B] hover:bg-white',
            ].join(' ')}
        >
            <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#006D55]"
                aria-expanded={open}
                onClick={onToggle}
            >
                <span
                    className={[
                        'font-mono text-xs tabular-nums transition-colors',
                        open ? 'text-[#006D55]' : 'text-[#7DAF9B]',
                    ].join(' ')}
                >
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-display flex-1 text-base font-semibold text-[#06241C] sm:text-lg">{question}</span>
                <span
                    className={[
                        'grid size-8 shrink-0 place-items-center rounded-full border text-lg leading-none transition-all duration-300',
                        open ? 'rotate-45 border-[#006D55] bg-[#006D55] text-white' : 'border-[#99D2BC] text-[#006D55]',
                    ].join(' ')}
                    aria-hidden
                >
                    +
                </span>
            </button>
            <div
                className={[
                    'grid transition-[grid-template-rows,opacity] duration-400 ease-out',
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                ].join(' ')}
            >
                <div className="overflow-hidden">
                    <p className="px-5 pb-5 pl-[3.25rem] text-sm leading-relaxed text-[#1F6B52] sm:text-base">{answer}</p>
                </div>
            </div>
        </div>
    );
}

function HelpCard({ whatsappHref }: { whatsappHref?: string }) {
    return (
        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-[#99D2BC] bg-white p-4">
            <img src="/images/vetsaas-robot-pet.png" alt="" className="size-16 shrink-0 object-contain" />
            <div className="min-w-0">
                <p className="font-display text-base font-semibold text-[#06241C]">¿Otra pregunta?</p>
                <p className="text-sm text-[#1F6B52]">Te respondemos por WhatsApp.</p>
                {whatsappHref ? (
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#006D55] hover:underline"
                    >
                        Escríbenos <span aria-hidden>→</span>
                    </a>
                ) : null}
            </div>
        </div>
    );
}

export default function FaqSection({ whatsappHref }: { whatsappHref?: string }) {
    const [open, setOpen] = useState(0);

    return (
        <section id="faq-software-veterinario" className="scroll-mt-24 bg-[#F3FBF7] py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
                <VetSaaSReveal>
                    <div className="lg:sticky lg:top-28">
                        <h2 className="font-display text-3xl font-semibold tracking-tight text-[#06241C] sm:text-5xl">
                            Preguntas de la clínica
                        </h2>
                        <p className="mt-3 max-w-sm text-base text-[#1F6B52]">
                            Lo que nos preguntan antes de activar VetSaaS.
                        </p>
                        <HelpCard whatsappHref={whatsappHref} />
                    </div>
                </VetSaaSReveal>

                <div className="space-y-3">
                    {FAQS.map((item, index) => (
                        <VetSaaSReveal key={item.q} delay={index * 0.06}>
                            <FaqItem
                                index={index}
                                question={item.q}
                                answer={item.a}
                                open={open === index}
                                onToggle={() => setOpen(open === index ? -1 : index)}
                            />
                        </VetSaaSReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
