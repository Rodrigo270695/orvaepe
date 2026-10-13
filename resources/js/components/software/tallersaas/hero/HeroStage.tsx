const TICKETS = [
    { kicker: 'OT-0142', title: 'En proceso · Toyota Yaris', delay: '0.35s' },
    { kicker: 'WhatsApp', title: 'Tu auto ya está listo', delay: '0.55s' },
    { kicker: 'B001-00088', title: 'Boleta SUNAT · S/ 185.00', delay: '0.75s' },
];

export default function HeroStage() {
    return (
        <div className="relative">
            <div
                className="overflow-hidden rounded-[1.6rem] border shadow-[0_40px_80px_-32px_rgba(0,0,0,0.45)]"
                style={{ borderColor: 'var(--ts-line)' }}
            >
                <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]">
                    <img
                        src="/images/tallersaas/hero.jpg"
                        alt="Taller mecánico con el auto en el elevador"
                        className="absolute inset-0 size-full object-cover"
                        fetchPriority="high"
                    />
                    <div className="absolute inset-0" style={{ backgroundImage: 'var(--ts-photo-veil)' }} />
                    <span
                        className="ts-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent to-transparent"
                        style={{ background: 'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--ts-ember) 28%, transparent), transparent)' }}
                        aria-hidden
                    />
                    <p
                        className="absolute left-4 top-4 rounded-sm px-2.5 py-1 font-display text-xs font-extrabold tracking-[0.18em]"
                        style={{ background: 'var(--ts-plate)', color: 'var(--ts-on-plate)' }}
                    >
                        ABC-124
                    </p>
                </div>
            </div>

            <ul className="absolute inset-x-4 bottom-4 space-y-2 sm:inset-x-auto sm:bottom-8 sm:-left-8 sm:w-64">
                {TICKETS.map((ticket) => (
                    <li
                        key={ticket.kicker}
                        className="ts-rise rounded-xl border px-3.5 py-2.5 backdrop-blur-md"
                        style={{
                            animationDelay: ticket.delay,
                            borderColor: 'var(--ts-ticket-line)',
                            background: 'var(--ts-ticket)',
                            color: 'var(--ts-ticket-ink)',
                        }}
                    >
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--ts-ember)' }}>
                            {ticket.kicker}
                        </p>
                        <p className="mt-0.5 text-sm font-medium">{ticket.title}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
