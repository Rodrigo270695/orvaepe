import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

import './checkout-orvae.css';

const STEPS = [
    { label: 'Elige tu plan', href: '/software' },
    { label: 'Carrito', href: '/carrito' },
    { label: 'Pago seguro', href: null },
    { label: 'Acceso', href: null },
] as const;

type Props = {
    /** Índice del paso actual (0 = elegir plan). */
    current: 0 | 1 | 2 | 3;
    className?: string;
};

export default function CheckoutSteps({ current, className }: Props) {
    return (
        <nav aria-label="Progreso de compra" className={className}>
            <p
                className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:hidden"
                aria-hidden
            >
                Paso {current + 1} de {STEPS.length} · {STEPS[current].label}
            </p>
            <ol className="flex items-center gap-2">
                {STEPS.map((step, index) => {
                    const done = index < current;
                    const isCurrent = index === current;
                    const isLast = index === STEPS.length - 1;
                    const dot = (
                        <span className="co-step-dot" aria-hidden>
                            {done ? <Check className="size-4" strokeWidth={3} /> : index + 1}
                        </span>
                    );
                    const label = (
                        <span
                            className={cn(
                                'sr-only truncate text-sm font-semibold sm:not-sr-only',
                                isCurrent ? 'text-foreground' : 'text-muted-foreground',
                            )}
                        >
                            {step.label}
                        </span>
                    );

                    return (
                        <li
                            key={step.label}
                            className={cn(
                                'co-step',
                                isLast && 'flex-none',
                                done && 'is-done',
                                isCurrent && 'is-current',
                            )}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            {done && step.href ? (
                                <Link
                                    href={step.href}
                                    className="inline-flex min-h-11 min-w-0 cursor-pointer items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                                >
                                    {dot}
                                    {label}
                                    <span className="sr-only">(completado, volver)</span>
                                </Link>
                            ) : (
                                <span className="inline-flex min-w-0 items-center gap-2.5">
                                    {dot}
                                    {label}
                                    {done ? <span className="sr-only">(completado)</span> : null}
                                </span>
                            )}
                            {!isLast ? <span className="co-step-bar" aria-hidden /> : null}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
