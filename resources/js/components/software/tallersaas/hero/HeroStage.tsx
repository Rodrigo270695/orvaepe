const TICKETS = [
    { kicker: 'OT-0142', title: 'En proceso · Toyota Yaris', delay: '0.35s' },
    { kicker: 'WhatsApp', title: 'Tu auto ya está listo', delay: '0.55s' },
    { kicker: 'B001-00088', title: 'Boleta SUNAT · S/ 185.00', delay: '0.75s' },
];

export default function HeroStage() {
    return (
        <div className="relative">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/10 shadow-[0_40px_80px_-32px_rgba(0,0,0,0.8)]">
                <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]">
                    <img
                        src="/images/tallersaas/hero.jpg"
                        alt="Taller mecánico con el auto en el elevador"
                        className="absolute inset-0 size-full object-cover"
                        fetchPriority="high"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/25 to-transparent" />
                    <span
                        className="ts-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-[#ea580c]/25 to-transparent"
                        aria-hidden
                    />
                    <p className="absolute left-4 top-4 rounded-sm bg-[#f5c518] px-2.5 py-1 font-display text-xs font-extrabold tracking-[0.18em] text-[#0b1220]">
                        ABC-124
                    </p>
                </div>
            </div>

            <ul className="absolute inset-x-4 bottom-4 space-y-2 sm:inset-x-auto sm:bottom-8 sm:-left-8 sm:w-64">
                {TICKETS.map((ticket) => (
                    <li
                        key={ticket.kicker}
                        className="ts-rise rounded-xl border border-white/10 bg-[#0b1220]/88 px-3.5 py-2.5 backdrop-blur-md"
                        style={{ animationDelay: ticket.delay }}
                    >
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f97316]">{ticket.kicker}</p>
                        <p className="mt-0.5 text-sm font-medium text-white">{ticket.title}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
