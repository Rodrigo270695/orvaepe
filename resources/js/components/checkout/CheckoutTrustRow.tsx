import { BadgeCheck, CreditCard, FileText, LockKeyhole } from 'lucide-react';

import { cn } from '@/lib/utils';

const ITEMS = [
    { icon: LockKeyhole, label: 'Pago cifrado', hint: 'Procesado por Culqi', color: '#2563eb' },
    { icon: CreditCard, label: 'Tarjeta o Yape', hint: 'También billeteras', color: '#0d9488' },
    { icon: FileText, label: 'Comprobante SUNAT', hint: 'Boleta o factura', color: '#ea580c' },
    { icon: BadgeCheck, label: 'Acceso inmediato', hint: 'Al confirmar el pago', color: '#7c3aed' },
] as const;

export default function CheckoutTrustRow({
    compact = false,
    className,
}: {
    compact?: boolean;
    className?: string;
}) {
    return (
        <ul
            className={cn(
                'grid gap-2',
                compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4',
                className,
            )}
            aria-label="Garantías de compra"
        >
            {ITEMS.map(({ icon: Icon, label, hint, color }) => (
                <li
                    key={label}
                    className="flex items-start gap-2.5 rounded-xl border border-[color-mix(in_oklab,var(--foreground)_8%,var(--border))] bg-[color-mix(in_oklab,var(--background)_70%,transparent)] px-3 py-2.5"
                >
                    <Icon className="mt-0.5 size-4 shrink-0" style={{ color }} aria-hidden />
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-foreground">{label}</span>
                        <span className="block text-[11px] leading-snug text-muted-foreground">{hint}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}
