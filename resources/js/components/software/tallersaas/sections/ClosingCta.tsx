import { DEMO } from '../data';
import TallerSaaSReveal from '../TallerSaaSReveal';

export default function ClosingCta({
    whatsappHref,
    demoUrl = DEMO.url,
    demoUser = DEMO.user,
    demoPassword = DEMO.password,
}: {
    whatsappHref?: string;
    demoUrl?: string;
    demoUser?: string;
    demoPassword?: string;
}) {
    return (
        <section className="relative overflow-hidden py-24" style={{ background: 'var(--ts-inverse)', color: 'var(--ts-inverse-ink)' }}>
            <img src="/images/tallersaas/hero.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/80 to-[#0b1220]/55" />
            <TallerSaaSReveal className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#f97316]">Tu subdominio. Tu taller.</p>
                <h2 className="font-display mt-4 text-4xl font-extrabold leading-[0.95] text-white sm:text-6xl">
                    Baja el cuaderno. Sube el auto.
                </h2>
                <p className="mx-auto mt-5 max-w-lg text-[#cfc6b8]">
                    Activa Gratis o un plan de pago. Al confirmar entras a crear tu contraseña.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <a href="#planes" className="ts-btn">
                        Ver planes
                    </a>
                    <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="ts-btn-ghost !text-white !border-white/25">
                        Probar la demo
                    </a>
                    {whatsappHref ? (
                        <a href={whatsappHref} className="ts-btn-ghost !text-white !border-white/25">
                            Hablar con ventas
                        </a>
                    ) : null}
                </div>
                <p className="mx-auto mt-5 max-w-lg font-mono text-xs text-[#cfc6b8]">
                    Demo: {demoUser} · {demoPassword}
                </p>
            </TallerSaaSReveal>
        </section>
    );
}
