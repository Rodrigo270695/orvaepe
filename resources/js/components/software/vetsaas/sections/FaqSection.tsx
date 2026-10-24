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
        <div className={['vs-faq-item', open ? 'vs-faq-item-open' : ''].join(' ')}>
            <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#006D55] dark:focus-visible:ring-[#3CB88A]"
                aria-expanded={open}
                onClick={onToggle}
            >
                <span
                    className={[
                        'font-mono text-xs tabular-nums transition-colors',
                        open ? 'vs-text-accent-strong' : 'vs-text-muted-soft',
                    ].join(' ')}
                >
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-display flex-1 text-base font-semibold vs-text-ink sm:text-lg">{question}</span>
                <span
                    className={[
                        'grid size-8 shrink-0 place-items-center rounded-full border text-lg leading-none transition-all duration-300',
                        open
                            ? 'rotate-45 border-[var(--vs-accent-strong)] bg-[var(--vs-accent-strong)] text-white'
                            : 'vs-border text-[var(--vs-accent-strong)]',
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
                    <p className="px-5 pb-5 pl-[3.25rem] text-sm leading-relaxed vs-text-muted sm:text-base">{answer}</p>
                </div>
            </div>
        </div>
    );
}

function HelpCard({ whatsappHref }: { whatsappHref?: string }) {
    return (
        <div className="vs-card mt-8 flex items-center gap-4 p-4">
            <img src="/images/vetsaas-robot-pet.webp" alt="" loading="lazy" decoding="async" className="size-16 shrink-0 object-contain" />
            <div className="min-w-0">
                <p className="font-display text-base font-semibold vs-text-ink">¿Otra pregunta?</p>
                <p className="text-sm vs-text-muted">Te respondemos por WhatsApp.</p>
                {whatsappHref ? (
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold vs-text-accent-strong hover:underline"
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
        <section id="faq-software-veterinario" className="vs-bg-soft scroll-mt-24 py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
                <VetSaaSReveal>
                    <div className="lg:sticky lg:top-28">
                        <h2 className="font-display text-3xl font-semibold tracking-tight vs-text-ink sm:text-5xl">
                            Preguntas de la clínica
                        </h2>
                        <p className="mt-3 max-w-sm text-base vs-text-muted">
                            Lo que nos preguntan antes de activar VetSaaS.
                        </p>
                        <HelpCard whatsappHref={whatsappHref} />
                    </div>
                </VetSaaSReveal>
                <div className="space-y-3">
                    {FAQS.map((item, index) => (
                        <FaqItem
                            key={item.q}
                            index={index}
                            question={item.q}
                            answer={item.a}
                            open={open === index}
                            onToggle={() => setOpen(open === index ? -1 : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
