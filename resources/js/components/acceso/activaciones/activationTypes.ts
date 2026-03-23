export type LicenseActivationRow = {
    id: string;
    domain: string;
    server_fingerprint: string | null;
    ip_address: string;
    last_ping_at: string | null;
    is_active: boolean;
    created_at: string;
    license_key?: {
        id: string;
        key: string;
        status: string;
        user?: {
            name: string;
            lastname: string | null;
            email: string;
        } | null;
    } | null;
};
