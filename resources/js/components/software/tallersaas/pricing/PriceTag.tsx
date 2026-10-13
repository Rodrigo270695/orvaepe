import { planHasPurchasablePrice, planIsFreeSubscription } from '@/lib/cartPricing';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

type Props = { plan: SoftwarePricingPlan; featured?: boolean };

const PRICE_RE = /^\s*([\d.,]+)\s*(PEN|USD|S\/)?\s*(.*)$/i;

function splitPrice(text: string) {
    const match = text.match(PRICE_RE);
    if (!match) return null;
    const currency = (match[2] ?? 'PEN').toUpperCase();
    return {
        symbol: currency === 'USD' ? 'US$' : 'S/',
        amount: match[1],
        suffix: match[3].trim(),
    };
}

export default function PriceTag({ plan, featured = false }: Props) {
    const amountClass = [
        'font-display text-5xl font-extrabold leading-none tracking-tight tabular-nums',
        featured ? 'text-white' : 'text-[#f4efe6]',
    ].join(' ');

    if (planIsFreeSubscription(plan)) {
        return (
            <div>
                <p className={amountClass}>Gratis</p>
                <p className="mt-2 text-xs text-[#b7b0a4]">Sin tarjeta ni pasarela</p>
            </div>
        );
    }

    const text = plan.priceNowText ?? (plan.priceNow !== undefined ? String(plan.priceNow) : plan.priceText);
    const parts = planHasPurchasablePrice(plan) ? splitPrice(text) : null;

    if (!parts) {
        return <p className="font-display text-2xl font-extrabold text-[#f4efe6]">{text || 'A cotizar'}</p>;
    }

    return (
        <div>
            <p className="flex items-start gap-1">
                <span className="mt-1.5 text-lg font-semibold text-[#ea580c]">{parts.symbol}</span>
                <span className={amountClass}>{parts.amount}</span>
            </p>
            {parts.suffix ? <p className="mt-2 text-xs text-[#b7b0a4]">{parts.suffix}</p> : null}
        </div>
    );
}
