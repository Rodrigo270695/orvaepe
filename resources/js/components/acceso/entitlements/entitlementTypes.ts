export type EntitlementRow = {
    id: string;
    status: string;
    starts_at: string;
    ends_at: string | null;
    created_at: string;
    secrets_count: number;
    user?: {
        name: string;
        lastname: string | null;
        email: string;
        document_number: string | null;
    } | null;
    catalog_product?: { id: string; name: string } | null;
    catalog_sku?: { id: string; code: string; name: string } | null;
};
