import Section from '@/components/welcome/Section';
import { Building2, Megaphone, Scale, Users } from 'lucide-react';

const markets = [
    {
        title: 'Telecomunicaciones',
        description:
            'Operación multi-zona, trazabilidad y reportería en tiempo real. Orvae Zones + Vault + Assets.',
        icon: Building2,
    },
    {
        title: 'Municipalidades y gobierno local',
        description:
            'Gestión documental y control de bienes del estado. Orvae Docs + Assets + People.',
        icon: Scale,
    },
    {
        title: 'Empresas de servicios',
        description:
            'Necesitan sistemas sin presupuesto SAP. Orvae ERP, Stock y People.',
        icon: Users,
    },
];

const channels = [
    { title: 'Fase 1: Ventas directas', desc: 'Contacto con red profesional, LinkedIn outreach y demos en video.' },
    { title: 'Fase 2: Contenido y comunidad', desc: 'Blog técnico, canal de YouTube, thought leadership y SEO.' },
    { title: 'Fase 3: Partners y resellers', desc: 'Consultoras regionales e integradores con comisión del 20% (primer año).' },
];

export default function MarketsAndChannelsSection() {
    return (
        <Section
            id="mercados"
            eyebrow="Mercados objetivo y canales de venta"
            title="Presencia en sectores con necesidad real"
            description="Orvae aterriza el ERP en industrias donde el contexto local importa y la confiabilidad es crítica."
        >
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {markets.map((m) => (
                    <div
                        key={m.title}
                        className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                    >
                        <m.icon className="size-6 text-[var(--o-amber)]" />
                        <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            {m.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                            {m.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-10 rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                <div className="flex items-center gap-3">
                    <Megaphone className="size-5 text-[var(--o-amber)]" />
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                        Canales de venta y marketing
                    </h3>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-3">
                    {channels.map((c) => (
                        <div
                            key={c.title}
                            className="rounded-2xl border border-[var(--border)] bg-card/60 p-5"
                        >
                            <p className="font-semibold text-[var(--foreground)]">
                                {c.title}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                                {c.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}

