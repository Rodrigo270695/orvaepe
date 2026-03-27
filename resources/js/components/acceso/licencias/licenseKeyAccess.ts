import type { LicenseKeyRow } from '@/components/acceso/licencias/licenseKeyTypes';

export const CREATED_VIA_ADMIN_MANUAL = 'admin_manual';

export const CREATED_VIA_ORDER_PAYMENT = 'order_payment';

function metadataIsEmpty(
    m: LicenseKeyRow['metadata'],
): m is null | undefined | Record<string, never> {
    if (m == null) {
        return true;
    }
    return Object.keys(m).length === 0;
}

/** Licencia creada desde el panel (formulario manual). */
export function isLicenseManualAdmin(row: LicenseKeyRow): boolean {
    if (row.metadata?.created_via === CREATED_VIA_ADMIN_MANUAL) {
        return true;
    }
    // Legacy: sin pedido y sin metadata (filas antes de created_via).
    return row.order == null && metadataIsEmpty(row.metadata);
}

/** Usos reales: relación activations o contador persistido. */
export function licenseActivationsUsed(row: LicenseKeyRow): number {
    const n = row.activations_count ?? row.activation_count ?? 0;
    return typeof n === 'number' ? n : 0;
}

export function isLicenseFromOrderPayment(row: LicenseKeyRow): boolean {
    return row.metadata?.created_via === CREATED_VIA_ORDER_PAYMENT;
}

export function canEditLicense(row: LicenseKeyRow): boolean {
    if (row.status === 'revoked') {
        return false;
    }
    if (isLicenseManualAdmin(row)) {
        return true;
    }
    return isLicenseFromOrderPayment(row);
}

/** Solo borrador, sin activaciones. */
export function canDeleteLicense(row: LicenseKeyRow): boolean {
    return (
        isLicenseManualAdmin(row) &&
        row.status === 'draft' &&
        licenseActivationsUsed(row) === 0
    );
}
