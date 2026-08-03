import { cn } from '@/lib/utils';
import type { BillingPeriod } from '@/lib/softwarePricingPlans';

type Props = {
    value: BillingPeriod;
    onChange: (value: BillingPeriod) => void;
    className?: string;
};

/**
 * Toggle Mensual / Anual con branding verde VetSaaS.
 */
export default function VetSaaSBillingToggle({ value, onChange, className }: Props) {
    return (
        <div
            className={cn(
                'relative grid grid-cols-2 rounded-2xl border border-[#99D2BC]/60 bg-[#E6F4EF]/80 p-1.5 shadow-inner dark:border-[#33A07B]/35 dark:bg-[#04362B]/90',
                className,
            )}
            role="group"
            aria-label="Periodo de facturación"
        >
            <span
                aria-hidden
                className={cn(
                    'pointer-events-none absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-br from-[#006D55] via-[#008762] to-[#33A07B] shadow-lg shadow-[#006D55]/40 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    value === 'annual' && 'translate-x-full',
                )}
            />
            {(
                [
                    ['monthly', 'Mensual', null],
                    ['annual', 'Anual', '−2 meses'],
                ] as const
            ).map(([period, label, badge]) => (
                <button
                    key={period}
                    type="button"
                    onClick={() => onChange(period)}
                    className={cn(
                        'relative z-10 flex cursor-pointer flex-col items-center justify-center rounded-xl px-4 py-2.5 transition-colors duration-200',
                        value === period
                            ? 'text-white'
                            : 'text-[#015743] hover:text-[#006D55] dark:text-[#C5E5D9] dark:hover:text-white',
                    )}
                >
                    <span className="text-sm font-semibold leading-none">{label}</span>
                    {badge ? (
                        <span
                            className={cn(
                                'mt-1 text-[10px] font-bold uppercase tracking-wide',
                                value === period
                                    ? 'text-[#E6F4EF]/95'
                                    : 'text-[#008762] dark:text-[#33A07B]',
                            )}
                        >
                            {badge}
                        </span>
                    ) : (
                        <span className="mt-1 text-[10px] font-medium opacity-0">·</span>
                    )}
                </button>
            ))}
        </div>
    );
}
