export type LicenseKeyRow = {
    id: string;
    key: string;
    status: string;
    max_activations: number;
    activation_count: number;
    expires_at: string | null;
    revoked_at: string | null;
    revoke_reason: string | null;
    created_at: string;
    metadata?: { created_via?: string } | null;
    user?: {
        name: string;
        lastname: string | null;
        email: string;
        document_number?: string | null;
    } | null;
    catalog_sku?: {
        code: string;
        name: string;
        product?: { name: string } | null;
    } | null;
    order?: { order_number: string } | null;
    activations_count?: number;
};
