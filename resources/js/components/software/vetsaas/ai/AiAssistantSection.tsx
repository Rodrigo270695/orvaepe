import VetSaaSReveal from '@/components/software/VetSaaSReveal';
import VetSaaSWalkingPet from '@/components/software/VetSaaSWalkingPet';

import CheckIcon from '../CheckIcon';
import { AI_FEATURES } from '../data';
import AiChatDemo from './AiChatDemo';

export default function AiAssistantSection() {
    return (
        <section className="relative overflow-hidden bg-[#041910] pb-44 pt-20 text-white sm:pb-48 sm:pt-24">
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(60,184,138,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(60,184,138,0.18) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
                aria-hidden
            />
            <div className="vs-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#3CB88A]/25 to-transparent" />

            <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
                <VetSaaSReveal>
                    <p className="inline-flex items-center gap-2 rounded-full border border-[#3CB88A]/40 bg-[#3CB88A]/10 px-3.5 py-1.5 font-mono text-xs text-[#99D2BC]">
                        <span className="size-1.5 rounded-full bg-[#3CB88A]" />
                        IA en el WhatsApp de la clínica
                    </p>
                    <h2 className="font-display mt-5 text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
                        El asistente responde.
                        <span className="block text-[#3CB88A]">Los recordatorios salen solos.</span>
                    </h2>
                    <ul className="font-body mt-8 space-y-4 text-base leading-relaxed text-[#D5EBE2]">
                        {AI_FEATURES.map((text) => (
                            <li key={text} className="flex gap-3">
                                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-[#3CB88A]/60 bg-[#3CB88A]/15 text-[#3CB88A]">
                                    <CheckIcon className="size-3.5" strokeWidth={3} />
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>
                </VetSaaSReveal>
                <AiChatDemo />
            </div>

            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 border-t border-[#3CB88A]/25 bg-gradient-to-b from-[#3CB88A]/[0.06] to-transparent"
                aria-hidden
            >
                <div className="vs-cross absolute bottom-3 left-0 w-56">
                    <VetSaaSWalkingPet />
                </div>
            </div>
        </section>
    );
}
