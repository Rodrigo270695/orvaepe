import { Rocket, ShieldCheck, Layers } from 'lucide-react';

import PageHero from '@/components/marketing/PageHero';

export default function SoftwareDevelopmentHero() {
    return (
        <PageHero
            id="inicio"
            eyebrow="Desarrollo de software"
            title={
                <>
                    Software pensado para
                    <span className="text-[var(--o-amber)]"> operar</span>
                </>
            }
            description="Elige el sistema por categorías, ajusta tu plan (SaaS, licencia o módulos sueltos) y recibe entregables con documentación y trazabilidad. Todo orientado a implementación en días o semanas."
            ctas={[
                { href: '#contacto', label: 'Solicitar demo', variant: 'outline' },
                { href: '/licencias', label: 'Ver licencias', variant: 'primary' },
            ]}
        >
            <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-background/60 px-4 py-3">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--o-amber)_18%,transparent)]">
                        <Rocket className="size-4 text-[var(--o-amber)]" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                            Entrega con ruta clara
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            Timeline + checklist
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-background/60 px-4 py-3">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--o-amber)_18%,transparent)]">
                        <Layers className="size-4 text-[var(--o-amber)]" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                            Módulos y planes
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            Escala sin fricción
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-background/60 px-4 py-3">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--o-amber)_18%,transparent)]">
                        <ShieldCheck className="size-4 text-[var(--o-amber)]" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                            Documentación y trazabilidad
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            SLA + entregables
                        </p>
                    </div>
                </div>
            </div>
        </PageHero>
    );
}

