export type EntitlementSecretRow = {
    id: string;
    kind: string;
    label: string | null;
    public_ref: string | null;
    expires_at: string | null;
    rotated_at: string | null;
    revoked_at: string | null;
    last_used_at: string | null;
    created_at: string;
    entitlement?: {
        id: string;
        status: string;
        catalog_product?: { id: string; name: string } | null;
        user?: {
            name: string;
            lastname: string | null;
            email: string;
        } | null;
    } | null;
};
