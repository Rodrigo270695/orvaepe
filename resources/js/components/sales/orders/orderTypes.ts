export type OrderRow = {
    id: string;
    order_number: string;
    status: string;
    currency: string;
    subtotal: string;
    discount_total: string;
    tax_total: string;
    grand_total: string;
    placed_at: string | null;
    created_at: string;
    lines_count?: number;
    user?: {
        name: string;
        lastname: string | null;
        email: string;
        document_number: string | null;
    } | null;
};
