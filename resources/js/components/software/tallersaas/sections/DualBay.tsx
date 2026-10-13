import TallerSaaSReveal from '../TallerSaaSReveal';

export default function DualBay() {
    return (
        <section className="py-20 sm:py-28" style={{ background: 'var(--ts-bg)', color: 'var(--ts-ink)' }}>
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <TallerSaaSReveal>
                    <p className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--ts-ember)' }}>
                        Dos bahías. Un sistema.
                    </p>
                    <h2 className="font-display mt-4 max-w-3xl text-4xl font-extrabold leading-[0.95] sm:text-6xl">
                        Reparas. Lavas. Cobras en el mismo mostrador.
                    </h2>
                </TallerSaaSReveal>

                <div className="mt-12 grid gap-4 md:grid-cols-2">
                    <TallerSaaSReveal>
                        <article className="overflow-hidden border" style={{ borderColor: 'var(--ts-line)', background: 'var(--ts-surface)' }}>
                            <img src="/images/tallersaas/hero.jpg" alt="Bahía de reparación" className="aspect-[16/10] w-full object-cover" />
                            <div className="p-6">
                                <p className="font-display text-sm" style={{ color: 'var(--ts-ember)' }}>
                                    Bahía A · Mecánica
                                </p>
                                <h3 className="font-display mt-2 text-3xl font-extrabold">Orden de trabajo</h3>
                                <p className="mt-3" style={{ color: 'var(--ts-muted)' }}>
                                    Placa, diagnóstico, presupuesto y repuestos. El historial queda amarrado al vehículo.
                                </p>
                            </div>
                        </article>
                    </TallerSaaSReveal>
                    <TallerSaaSReveal delay={0.1}>
                        <article className="overflow-hidden border" style={{ borderColor: 'var(--ts-line)', background: 'var(--ts-surface)' }}>
                            <img src="/images/tallersaas/lavado.jpg" alt="Bahía de car wash" className="aspect-[16/10] w-full object-cover" />
                            <div className="p-6">
                                <p className="font-display text-sm" style={{ color: 'var(--ts-plate)' }}>
                                    Bahía B · Car wash
                                </p>
                                <h3 className="font-display mt-2 text-3xl font-extrabold">Ticket de lavado</h3>
                                <p className="mt-3" style={{ color: 'var(--ts-muted)' }}>
                                    Servicios de lavado, precuenta y cobro. No es otro Excel. Es la misma caja.
                                </p>
                            </div>
                        </article>
                    </TallerSaaSReveal>
                </div>
            </div>
        </section>
    );
}
