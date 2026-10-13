const items = [
    { label: 'VetSaaS', color: '#0D9488' },
    { label: 'TallerSaaS', color: '#EA580C' },
    { label: 'Licencias', color: '#2563EB' },
    { label: 'SUNAT', color: '#D97706' },
    { label: 'WhatsApp', color: '#16A34A' },
    { label: 'A medida', color: '#7C3AED' },
    { label: 'PWA', color: '#0284C7' },
    { label: 'Subdominio propio', color: '#EA580C' },
] as const;

function Row() {
    return (
        <ul className="flex items-center gap-8 px-4" aria-hidden>
            {items.map((item) => (
                <li key={item.label} className="flex shrink-0 items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                    <span className="size-2 rounded-full" style={{ background: item.color }} />
                    {item.label}
                </li>
            ))}
        </ul>
    );
}

export default function HomeColorStrip() {
    return (
        <div className="home-marquee relative overflow-hidden border-y border-border py-3">
            <div className="home-marquee-track">
                <Row />
                <Row />
            </div>
            <span className="sr-only">
                VetSaaS, TallerSaaS, licencias, SUNAT, WhatsApp y desarrollo a medida.
            </span>
        </div>
    );
}
