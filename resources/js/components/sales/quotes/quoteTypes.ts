export type QuoteRow = {
    id: string;
    quote_number: string;
    status: string;
    currency: string;
    subtotal: string;
    discount_total: string;
    tax_total: string;
    grand_total: string;
    created_at: string;
    customer_legal_name: string | null;
    customer_document_number: string | null;
    customer_email: string | null;
    lines_count?: number;
    user?: {
        name: string;
        lastname: string | null;
        email: string;
        document_number: string | null;
    } | null;
};
