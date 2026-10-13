import TallerSaaSReveal from '../TallerSaaSReveal';

const LINES = [
    { from: 'Taller', text: 'Hola Carlos, tu Yaris está listo. Puedes pasar a caja.' },
    { from: 'Cliente', text: 'Gracias. ¿A qué hora cierran?' },
    { from: 'Taller', text: 'Hasta las 7. Te dejamos la boleta lista.' },
];

export default function RadioSection() {
    return (
        <section className="relative overflow-hidden bg-[#1e3a5f] py-20 text-white sm:py-28">
            <div className="ts-bay-lines pointer-events-none absolute inset-0 opacity-30" aria-hidden />
            <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
                <TallerSaaSReveal>
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#f97316]">Canal del cliente</p>
                    <h2 className="font-display mt-4 text-4xl font-extrabold leading-[0.95] sm:text-6xl">
                        El cliente pregunta. Tú ya le avisaste.
                    </h2>
                    <ul className="mt-8 space-y-4 text-[#d6deea]">
                        <li>Cita: 48 horas antes y otra vez 2 horas antes.</li>
                        <li>Orden lista: el mensaje sale cuando cierras el trabajo.</li>
                        <li>Mantenimiento: aceite, revisión y plumillas, una vez al mes.</li>
                    </ul>
                </TallerSaaSReveal>

                <TallerSaaSReveal delay={0.1}>
                    <div className="relative overflow-hidden rounded-sm border border-white/15 bg-[#0b1220]">
                        <img src="/images/tallersaas/whatsapp.jpg" alt="" className="aspect-[5/4] w-full object-cover opacity-55" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/70 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
                            {LINES.map((line) => (
                                <p
                                    key={line.text}
                                    className={[
                                        'max-w-[85%] rounded-md px-3 py-2 text-sm',
                                        line.from === 'Taller'
                                            ? 'ml-auto bg-[#ea580c] text-white'
                                            : 'bg-white/10 text-[#f4efe6]',
                                    ].join(' ')}
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
