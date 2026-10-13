import TallerSaaSReveal from '../TallerSaaSReveal';

const LINES = [
    { from: 'Taller', text: 'Hola Carlos, tu Yaris está listo. Puedes pasar a caja.' },
    { from: 'Cliente', text: 'Gracias. ¿A qué hora cierran?' },
    { from: 'Taller', text: 'Hasta las 7. Te dejamos la boleta lista.' },
];

export default function RadioSection() {
    return (
        <section className="relative overflow-hidden py-20 sm:py-28" style={{ background: 'var(--ts-navy)', color: 'var(--ts-navy-ink)' }}>
            <div className="ts-bay-lines pointer-events-none absolute inset-0 opacity-30" aria-hidden />
            <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
                <TallerSaaSReveal>
                    <p className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--ts-ember)' }}>
                        Canal del cliente
                    </p>
                    <h2 className="font-display mt-4 text-4xl font-extrabold leading-[0.95] sm:text-6xl">
                        El cliente pregunta. Tú ya le avisaste.
                    </h2>
                    <ul className="mt-8 space-y-4" style={{ color: 'var(--ts-navy-muted)' }}>
                        <li>Cita: 48 horas antes y otra vez 2 horas antes.</li>
                        <li>Orden lista: el mensaje sale cuando cierras el trabajo.</li>
                        <li>Mantenimiento: aceite, revisión y plumillas, una vez al mes.</li>
                    </ul>
                </TallerSaaSReveal>

                <TallerSaaSReveal delay={0.1}>
                    <div className="relative overflow-hidden rounded-sm border" style={{ borderColor: 'var(--ts-inverse-line)', background: '#0b1220' }}>
                        <img src="/images/tallersaas/whatsapp.jpg" alt="" className="aspect-[5/4] w-full object-cover opacity-55" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/70 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
                            {LINES.map((line) => (
                                <p
                                    key={line.text}
                                    className="max-w-[85%] rounded-md px-3 py-2 text-sm"
                                    style={
                                        line.from === 'Taller'
                                            ? { marginLeft: 'auto', background: 'var(--ts-ember)', color: '#fff' }
                                            : { background: 'rgba(255,255,255,0.1)', color: '#f4efe6' }
                                    }
                                >
                                    {line.text}
                                </p>
                            ))}
                        </div>
                    </div>
                </TallerSaaSReveal>
            </div>
        </section>
    );
}
