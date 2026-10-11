import { useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { CHAT, type ChatMessage } from '../data';

const OWNER_DELAY_MS = 900;
const AI_DELAY_MS = 1500;
const RESTART_DELAY_MS = 5000;

function ChatHeader() {
    return (
        <div className="flex items-center gap-3 border-b border-[#3CB88A]/25 bg-[#06241C] px-5 py-4">
            <span className="grid size-10 place-items-center overflow-hidden rounded-full border border-[#3CB88A]/60 bg-[#0F3B2E]">
                <img src="/images/vetsaas-robot-pet.png" alt="" className="size-9 object-contain" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Asistente IA · Tu veterinaria</p>
                <p className="flex items-center gap-1.5 text-xs text-[#7DCAA8]">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3CB88A] opacity-70 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2 rounded-full bg-[#3CB88A]" />
                    </span>
                    en línea
                </p>
            </div>
            <span className="rounded-full border border-[#3CB88A]/40 px-2.5 py-1 font-mono text-[10px] text-[#7DCAA8]">
                IA
            </span>
        </div>
    );
}

function ChatBubble({ message }: { message: ChatMessage }) {
    if (message.from === 'system') {
        return (
            <p className="vs-bubble mx-auto rounded-full border border-[#3CB88A]/40 bg-[#3CB88A]/10 px-3 py-1.5 text-center text-[11px] font-medium text-[#99D2BC]">
                {message.text}
            </p>
        );
    }

    return (
        <div
            className={[
                'vs-bubble max-w-[82%] rounded-2xl border px-3.5 py-2.5 text-sm leading-snug',
                message.from === 'ai'
                    ? 'ml-auto rounded-br-md border-[#3CB88A]/50 bg-[#006D55] text-white'
                    : 'rounded-bl-md border-white/10 bg-white/[0.07] text-[#E3F3EC]',
            ].join(' ')}
        >
            {message.text}
            <span className="mt-1 block text-right text-[10px] opacity-60">{message.time}</span>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="vs-bubble ml-auto flex gap-1 rounded-2xl rounded-br-md border border-[#3CB88A]/50 bg-[#006D55] px-4 py-3">
            {[0, 1, 2].map((dot) => (
                <span
                    key={dot}
                    className="size-1.5 animate-bounce rounded-full bg-white/80"
                    style={{ animationDelay: `${dot * 0.15}s` }}
                />
            ))}
        </div>
    );
}

export default function AiChatDemo() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.4 });
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduce) {
            setShown(CHAT.length);
            return;
        }

        const finished = shown >= CHAT.length;
        const delay = finished ? RESTART_DELAY_MS : CHAT[shown].from === 'ai' ? AI_DELAY_MS : OWNER_DELAY_MS;
        const id = window.setTimeout(() => setShown(finished ? 0 : shown + 1), delay);
        return () => window.clearTimeout(id);
    }, [inView, reduce, shown]);

    const typing = !reduce && shown < CHAT.length && CHAT[shown].from === 'ai';

    return (
        <div
            ref={ref}
            className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-[#3CB88A]/45 bg-[#0A2E23] shadow-[0_0_60px_-10px_rgba(60,184,138,0.35)]"
        >
            <ChatHeader />
            <div
                className="flex min-h-[23rem] flex-col justify-end gap-2.5 px-4 py-5"
                aria-live="polite"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(125,202,168,0.12) 1px, transparent 0)',
                    backgroundSize: '18px 18px',
                }}
            >
                {CHAT.slice(0, shown).map((message) => (
                    <ChatBubble key={message.text} message={message} />
                ))}
                {typing ? <TypingIndicator /> : null}
            </div>
        </div>
    );
}
