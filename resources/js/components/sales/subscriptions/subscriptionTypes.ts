export type SubscriptionRow = {
    id: string;
    status: string;
    gateway_customer_id: string | null;
    gateway_subscription_id: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    cancelled_at: string | null;
    trial_ends_at: string | null;
    created_at: string;
    items_count: number;
    user?: {
        name: string;
        lastname: string | null;
        email: string;
        document_number: string | null;
    } | null;
    items?: Array<{
        id: string;
        catalog_sku_id: string;
        quantity: number;
        unit_price: string;
        catalog_sku?: {
            code: string;
            name: string;
        } | null;
    }>;
};
