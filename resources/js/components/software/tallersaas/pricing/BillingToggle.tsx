import type { BillingPeriod } from '@/lib/softwarePricingPlans';

type Props = {
    value: BillingPeriod;
    onChange: (value: BillingPeriod) => void;
};

export default function BillingToggle({ value, onChange }: Props) {
    return (
        <div className="inline-flex rounded-md border border-white/15 bg-[#0b1220] p-1">
            {(
                [
                    ['monthly', 'Mensual'],
                    ['annual', 'Anual −2 meses'],
                ] as const
            ).map(([id, label]) => {
                const active = value === id;
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onChange(id)}
                        className={[
                            'cursor-pointer rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wide transition',
                            active ? 'bg-[#ea580c] text-white' : 'text-[#b7b0a4] hover:text-white',
                        ].join(' ')}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
