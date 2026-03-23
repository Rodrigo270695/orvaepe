/** Perfil fiscal del cliente (`user_profiles`). */
export type ClientUserProfile = {
    id: string;
    user_id: number;
    company_name: string | null;
    legal_name: string | null;
    ruc: string | null;
    tax_status: string | null;
    billing_email: string | null;
    phone: string | null;
    country: string;
    city: string | null;
    address: string | null;
    metadata?: Record<string, unknown>;
};
