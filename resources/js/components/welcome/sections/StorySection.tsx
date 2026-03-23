import Section from '@/components/welcome/Section';

const values = [
    { title: 'Confiabilidad', desc: 'El software funciona. El soporte responde. La palabra se cumple.' },
    { title: 'Claridad', desc: 'Sin letra pequeña. El cliente sabe exactamente qué compra y qué recibe.' },
    { title: 'Progresividad', desc: 'Empezamos pequeño con cada cliente y crecemos juntos.' },
    { title: 'Proximidad', desc: 'Soporte en español, conocimiento peruano y respuesta local.' },
];

const problems = [
    {
        title: 'El software extranjero no entiende el contexto local',
        desc: 'No integra SUNAT nativa y no maneja sedes regionales ni soporte en español.',
    },
    {
        title: 'El software local carece de calidad enterprise',
        desc: 'Frecuentemente con arquitectura no escalable, actualizaciones inconsistentes y soporte deficiente.',
    },
    {
        title: 'El precio de los buenos sistemas es inaccesible',
        desc: 'Los grandes ERPs quedan fuera de presupuesto para medianas y MYPEs.',
    },
];

const proposal = [
    {
        title: 'Implementación en días o semanas',
        desc: 'Diseño para acelerar el valor desde el primer mes.',
    },
    {
        title: 'Soporte en español y zona horaria Perú',
        desc: 'Tiempo de respuesta comprometido por escrito.',
    },
    {
        title: 'Documentación clara y panel de administración',
        desc: 'Configuración sin dependencia de consultores externos.',
    },
];

export default function StorySection() {
    return (
        <>
            <Section
                id="vision"
                eyebrow="Visión y misión"
                title="Software empresarial que entiende tu realidad"
                description="Ser la empresa peruana de software empresarial de mayor confianza en LATAM, con calidad enterprise y soporte local."
            >
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            Valores Orvae
                        </h3>
                        <ul className="mt-4 space-y-4">
                            {values.map((v) => (
                                <li key={v.title} className="flex items-start gap-3">
                                    <span className="mt-2 size-2.5 rounded-full bg-[var(--o-amber)]" />
                                    <div>
                                        <p className="font-semibold text-[var(--foreground)]">
                                            {v.title}
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                            {v.desc}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            Diferenciador
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                            Calidad enterprise, precio LATAM y soporte peruano. Orvae se ubica
                            entre el software extranjero caro y el software local de baja calidad.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {['SLA documentado', 'Uptime público', 'Changelog visible', 'Soporte comprometido'].map(
                                (t) => (
                                    <div
                                        key={t}
                                        className="rounded-xl border border-[var(--border)] bg-card/60 p-4"
                                    >
                                        <p className="text-sm font-semibold text-[var(--foreground)]">
                                            {t}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </Section>

            <Section
                id="problema"
                eyebrow="El problema que resolvemos"
                title="Tu operación merece un ERP que sepa lo que haces"
                description="El mercado peruano tiene tres problemas centrales que Orvae resuelve desde la arquitectura y la operación."
            >
                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    {problems.map((p) => (
                        <div
                            key={p.title}
                            className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                        >
                            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                                {p.title}
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                                {p.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section
                id="propuesta"
                eyebrow="Propuesta de valor"
                title="Menos incertidumbre. Más valor temprano."
                description="No prometemos confiabilidad — la demostramos: SLA, uptime, changelog y contratos simples en español."
            >
                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    {proposal.map((p) => (
                        <div
                            key={p.title}
                            className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                        >
                            <p className="font-semibold text-[var(--foreground)]">
                                {p.title}
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                                {p.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>
        </>
    );
}

