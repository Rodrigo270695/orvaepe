import { formatClientFullName } from '@/components/acceso/entitlements/entitlementDisplay';
import type { EntitlementRow } from '@/components/acceso/entitlements/entitlementTypes';

/**
 * Enlace al listado de API keys filtrado por entitlement, con `q` rellenado para el buscador.
 */
export function credencialesListHrefForEntitlement(
    row: EntitlementRow,
    dateFrom: string,
    dateTo: string,
): string {
    const q = [
        formatClientFullName(row.user),
        row.catalog_product?.name,
        row.catalog_sku?.code,
    ]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    const params = new URLSearchParams({
        date_from: dateFrom,
        date_to: dateTo,
        entitlement_id: row.id,
    });
    if (q.length > 0) {
        params.set('q', q);
    }

    return `/panel/acceso-credenciales?${params.toString()}`;
}
