/**
 * Detalle completo de una credencial (admin vía API o cliente desde props).
 */
export type EntitlementSecretDetail = {
    id: string;
    kind: string;
    label: string | null;
    public_ref: string | null;
    secret_value: string | null;
    metadata: Record<string, unknown> | null;
    expires_at: string | null;
    revoked_at: string | null;
    rotated_at: string | null;
    last_used_at: string | null;
    created_at: string | null;
    entitlement: {
        id: string;
        status: string;
        product_name?: string | null;
        sku?: string | null;
        sku_name?: string | null;
        user?: {
            name: string;
            lastname: string | null;
            email: string;
        } | null;
    } | null;
};
