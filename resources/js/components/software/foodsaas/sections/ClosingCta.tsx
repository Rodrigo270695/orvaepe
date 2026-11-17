import { WHATSAPP_HREF } from '../data';

type Props = {
    whatsappHref?: string;
    demoUrl: string;
};

export default function ClosingCta({ whatsappHref, demoUrl }: Props) {
    return (
        <section className="px-5 py-20 sm:px-8" style={{ background: 'var(--fs-wine)', color: '#f6efe6' }}>
            <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-xl">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#c4a574]">ORVAE</p>
                    <h2 className="fs-display mt-4 text-4xl sm:text-6xl">Tu local empieza a operar.</h2>
                    <p className="mt-4 font-sans text-base leading-relaxed text-[#f6efe6]/85">
                        Activas FoodSaaS desde Orvae y entras a tu subdominio. Si prefieres verlo primero, la demo y el WhatsApp están abiertos.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <a href="#planes" className="fs-btn" style={{ background: '#f6efe6', color: '#3a001c' }}>
                        Ver planes
                    </a>
                    <a href={demoUrl} className="fs-btn-ghost" style={{ color: '#f6efe6', borderColor: '#c4a574' }} target="_blank" rel="noopener noreferrer">
                        Demo
                    </a>
                    <a
                        href={whatsappHref || WHATSAPP_HREF}
                        className="fs-btn-ghost"
                        style={{ color: '#f6efe6', borderColor: '#c4a574' }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        976 809 804
                    </a>
                </div>
            </div>
        </section>
    );
}
