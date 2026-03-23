export type OemLicenseDeliveryRow = {
    id: string;
    vendor: string;
    license_code: string | null;
    activation_payload: string | null;
    delivered_at: string | null;
    expires_at: string | null;
    status: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
    order_line?: {
        id: string;
        product_name_snapshot: string;
        sku_name_snapshot: string;
        order?: {
            order_number: string;
            user?: {
                name: string;
                lastname: string | null;
                email: string;
            } | null;
        } | null;
    } | null;
};
