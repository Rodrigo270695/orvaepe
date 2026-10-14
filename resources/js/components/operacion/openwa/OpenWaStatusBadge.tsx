import { AlertTriangle, CheckCircle2, Clock3, Loader2, PlugZap, QrCode } from 'lucide-react';

import type { OpenWaLineStatus } from './types';

const STATUS: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    ready: {
        label: 'Conectada',
        className: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400',
        icon: CheckCircle2,
    },
    qr_ready: {
        label: 'Esperando QR',
        className: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
        icon: QrCode,
    },
    initializing: {
        label: 'Iniciando',
        className: 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
        icon: Loader2,
    },
    authenticating: {
        label: 'Vinculando',
        className: 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
        icon: Loader2,
    },
    action_required: {
        label: 'Revisa el celular',
        className: 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
        icon: AlertTriangle,
    },
    failed: {
        label: 'Con error',
        className: 'bg-destructive/12 text-destructive',
        icon: AlertTriangle,
    },
    disconnected: {
        label: 'Desconectada',
        className: 'bg-muted text-muted-foreground',
        icon: PlugZap,
    },
};

const FALLBACK = {
    label: 'Sin vincular',
    className: 'bg-muted text-muted-foreground',
    icon: Clock3,
};

export function OpenWaStatusBadge({ status }: { status: OpenWaLineStatus }) {
    const meta = STATUS[status] ?? FALLBACK;
    const Icon = meta.icon;
    const spinning = status === 'initializing' || status === 'authenticating';

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
        >
            <Icon className={`size-3.5 ${spinning ? 'animate-spin' : ''}`} aria-hidden />
            {meta.label}
        </span>
    );
}
