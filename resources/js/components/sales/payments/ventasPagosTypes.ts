export type PaymentRow = {
    id: string;
    created_at: string;
    gateway: string;
    gateway_payment_id: string | null;
    amount: string;
    currency: string;
    status: string;
    paid_at: string | null;
    order: {
        id: string;
        order_number: string;
        currency: string;
    } | null;
    user: {
        id: number;
        name: string | null;
        lastname: string | null;
        email: string;
    } | null;
};

export type VentasPagosFilters = {
    q: string;
    gateway: string;
    status: string;
    date_from: string;
    date_to: string;
};

export type VentasPagosIndexProps = {
    paymentGatewayEnabled: boolean;
    pendingPaymentCount: number;
    payments: any;
    filters: VentasPagosFilters;
    gatewayOptions: string[];
    statusOptions: string[];
};
