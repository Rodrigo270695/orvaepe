import CheckIcon from '../CheckIcon';

const CARD = 'vs-float-in absolute rounded-2xl border p-3.5 shadow-[0_20px_40px_-20px_rgba(6,36,28,0.45)] backdrop-blur';

function ReminderCard() {
    return (
        <div className={`${CARD} -left-4 top-8 w-[15.5rem] border-[#99D2BC] bg-white/95 sm:-left-10 [animation-delay:0.5s]`}>
            <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full border border-[#99D2BC] bg-[#E7F6EF] text-[#006D55]">
                    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Z" />
                    </svg>
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#06241C]">Recordatorio enviado</p>
                    <p className="text-[11px] text-[#3E5C52]">WhatsApp · 2 h antes</p>
                </div>
            </div>
            <p className="mt-2.5 rounded-xl border border-[#CDEBDD] bg-[#F3FBF7] px-3 py-2 text-xs leading-snug text-[#1F6B52]">
                Hola Ana, Rocky tiene control hoy a las 4:00 pm.
            </p>
        </div>
    );
}

function WaitingRoomCard() {
    return (
        <div className={`${CARD} vs-float-slow -right-3 top-[46%] w-[12.5rem] border-[#99D2BC] bg-white/95 sm:-right-8 [animation-delay:0.8s]`}>
            <p className="text-[11px] font-medium text-[#3E5C52]">Sala de espera</p>
            <p className="font-display mt-1 text-2xl font-semibold text-[#06241C]">3 pacientes</p>
            <div className="mt-2 flex gap-1">
                <span className="h-1.5 flex-1 rounded-full bg-[#006D55]" />
                <span className="h-1.5 flex-1 rounded-full bg-[#33A07B]" />
                <span className="h-1.5 flex-1 rounded-full bg-[#99D2BC]" />
            </div>
        </div>
    );
}

function InvoiceCard() {
    return (
        <div className={`${CARD} -bottom-5 left-6 flex items-center gap-3 border-[#015743] bg-[#006D55] px-4 py-3 text-white sm:left-10 [animation-delay:1.1s]`}>
            <span className="grid size-8 place-items-center rounded-full border border-white/30 bg-white/10">
                <CheckIcon />
            </span>
            <div>
                <p className="text-xs font-semibold">Boleta SUNAT emitida</p>
                <p className="text-[11px] text-[#CDEDE0]">B001-00245 · S/ 85.00</p>
            </div>
        </div>
    );
}

export default function HeroFloatingCards() {
    return (
        <>
            <ReminderCard />
            <WaitingRoomCard />
            <InvoiceCard />
        </>
    );
}
