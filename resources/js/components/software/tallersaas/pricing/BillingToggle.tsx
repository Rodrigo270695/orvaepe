import type { BillingPeriod } from '@/lib/softwarePricingPlans';

type Props = {
    value: BillingPeriod;
    onChange: (value: BillingPeriod) => void;
};

export default function BillingToggle({ value, onChange }: Props) {
    return (
        <div
            className="inline-flex rounded-md border p-1"
            style={{ borderColor: 'var(--ts-line)', background: 'var(--ts-surface)' }}
        >
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
                        className="cursor-pointer rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wide transition"
                        style={
                            active
                                ? { background: 'var(--ts-ember)', color: 'var(--ts-on-ember)' }
                                : { color: 'var(--ts-muted)' }
                        }
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
