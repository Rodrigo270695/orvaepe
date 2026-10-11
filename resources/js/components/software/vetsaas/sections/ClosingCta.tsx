import VetSaaSReveal from '@/components/software/VetSaaSReveal';

export default function ClosingCta() {
    return (
        <VetSaaSReveal>
            <section className="bg-[#F4F7F5] py-16 sm:py-20">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                    <div className="max-w-xl">
                        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                            Tu clínica, tu subdominio
                        </h2>
                        <p className="font-body vs-muted mt-3 text-sm leading-relaxed sm:text-base">
                            Activa Free o un plan de pago. Al confirmar, entras a crear tu contraseña en VetSaaS.
                        </p>
                    </div>
                    <a
                        href="#planes"
                        className="font-body inline-flex shrink-0 cursor-pointer rounded-xl border border-[#015743] bg-[#006D55] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:bg-[#015743] active:translate-y-px"
                    >
                        Ver planes
                    </a>
                </div>
            </section>
        </VetSaaSReveal>
    );
}
