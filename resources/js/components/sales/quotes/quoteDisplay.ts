import type { QuoteRow } from '@/components/sales/quotes/quoteTypes';

import { formatClientFullName } from '@/components/sales/orders/orderDisplay';
import type { OrderRow } from '@/components/sales/orders/orderTypes';

export function quoteStatusLabel(s: string): string {
    const map: Record<string, string> = {
        draft: 'Borrador',
        sent: 'Enviada',
        viewed: 'Vista',
        accepted: 'Aceptada',
        rejected: 'Rechazada',
        expired: 'Vencida',
        converted: 'Convertida',
    };
    return map[s] ?? s;
}

export function quoteStatusBadgeClass(s: string): string {
    if (s === 'converted' || s === 'accepted') {
        return 'bg-[#4A9A72]/15 text-[#4A9A72]';
    }
    if (s === 'sent' || s === 'viewed') {
        return 'bg-[#4A80B8]/15 text-[#4A80B8]';
    }
    if (s === 'rejected' || s === 'expired') {
        return 'bg-[#C05050]/15 text-[#C05050]';
    }
    return 'bg-muted text-muted-foreground';
}

export function quoteCanDelete(status: string): boolean {
    return status === 'draft';
}

export function quoteCanEdit(status: string): boolean {
    return status === 'draft';
}

export function quoteCanSendEmail(status: string): boolean {
    return status !== 'converted';
}

/** Correo sugerido para enviar la cotización (cotización o cuenta cliente). */
export function quoteDefaultSendEmail(row: QuoteRow): string {
    const fromQuote = row.customer_email?.trim();
    if (fromQuote) {
        return fromQuote;
    }
    return row.user?.email?.trim() ?? '';
}

export function formatQuoteClientName(row: QuoteRow): string {
    if (row.user) {
        return formatClientFullName(row.user as unknown as OrderRow['user']);
    }
    const name = row.customer_legal_name?.trim();
    return name && name.length > 0 ? name : '—';
}

export function formatQuoteClientDocument(row: QuoteRow): string {
    const onQuote = row.customer_document_number?.trim();
    if (onQuote) {
        return onQuote;
    }
    const onUser = row.user?.document_number?.trim();
    if (onUser) {
        return onUser;
    }
    return '—';
}
