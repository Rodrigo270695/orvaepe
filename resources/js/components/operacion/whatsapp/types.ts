export type WhatsAppSessionProps = {
    id: string;
    openwa_session_id: string;
    openwa_session_name: string;
    status: string;
    phone: string | null;
    push_name: string | null;
    connected_at: string | null;
    last_synced_at: string | null;
    last_error: string | null;
    is_ready: boolean;
};

export type WhatsAppProps = {
    enabled: boolean;
    configured: boolean;
    admin_notification_number: string;
    session: WhatsAppSessionProps | null;
};

export type WhatsAppApiRoutes = {
    sync: string;
    qr: string;
    logout: string;
    test: string;
};
