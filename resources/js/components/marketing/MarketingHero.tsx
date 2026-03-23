import type { ReactNode } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';

type CTA = {
    href: string;
    label: string;
    variant?: 'primary' | 'outline';
};

type Props = {
    eyebrow: string;
    title: ReactNode;
    description: ReactNode;
    ctas?: CTA[];
};

export default function MarketingHero({
    eyebrow,
    title,
    description,
    ctas = [],
}: Props) {
    return (
        <section id="inicio" className="relative overflow-hidden scroll-mt-28">
            <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-10 md:pb-16 md:pt-14">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-background/60 px-4 py-2">
                            <AppLogoIcon className="size-5 fill-[var(--o-amber)]" />
                            <span className="font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-[0.35em] text-[var(--o-amber)]">
                                {eyebrow}
                            </span>
                        </div>

                        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.06] text-[var(--foreground)] md:text-5xl">
                            {title}
                        </h1>

                        <p className="mt-5 max-w-xl font-[family-name:var(--font-body)] text-[16px] leading-relaxed text-[var(--muted-foreground)]">
                            {description}
                        </p>

                        {ctas.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-3">
                                {ctas.map((cta) => (
                                    <a
                                        key={cta.href + cta.label}
                                        href={cta.href}
                                        className={
                                            cta.variant === 'outline'
                                                ? 'inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-background px-5 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--accent)]/10'
                                                : 'inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-95'
                                        }
                                    >
                                        {cta.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="rounded-3xl border border-[var(--border)] bg-card/60 p-6 shadow-sm backdrop-blur">
                            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                                Orvae en simple
                            </h3>
                            <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[var(--muted-foreground)]">
                                Software y servicios que se compran por categorías y se entregan con documentación clara
                                y trazabilidad. Implementación en días o semanas.
                            </p>
                            <div className="mt-5 space-y-3 text-sm text-[var(--foreground)]">
                                {[
                                    'Sistemas por módulos.',
                                    'Modelos: SaaS, licencia o módulos sueltos.',
                                    'Control, seguridad y soporte real.',
                                ].map((t) => (
                                    <div key={t} className="flex items-start gap-3">
                                        <span className="mt-2 size-2 rounded-full bg-[var(--o-amber)]" />
                                        <span className="text-[var(--muted-foreground)]">{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pointer-events-none absolute -bottom-6 -left-4 h-16 w-16 rounded-2xl bg-[var(--o-amber)]/15 blur-xl" />
                        <div className="pointer-events-none absolute -top-6 -right-4 h-24 w-24 rounded-3xl bg-[var(--o-amber)]/10 blur-xl" />
                    </div>
                </div>
            </div>
        </section>
    );
}

