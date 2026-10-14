export type OpenWaProduct = {
    key: string;
    label: string;
};

export type OpenWaLineStatus =
    | 'created'
    | 'initializing'
    | 'qr_ready'
    | 'authenticating'
    | 'ready'
    | 'disconnected'
    | 'action_required'
    | 'failed'
    | (string & {});

export type OpenWaLine = {
    id: string;
    nombre: string;
    session_name: string;
    status: OpenWaLineStatus;
    is_ready: boolean;
    phone: string | null;
    push_name: string | null;
    productos: string[];
    connected_at: string | null;
    last_synced_at: string | null;
    last_error: string | null;
    routes: {
        update: string;
        destroy: string;
        connection: string;
        logout: string;
        test: string;
    };
};

export type OpenWaConnectionState = {
    status?: OpenWaLineStatus;
    ready?: boolean;
    phone?: string | null;
    qr_code?: string | null;
    message?: string | null;
    error?: string;
};

export type OpenWaPageProps = {
    configured: boolean;
    gatewayHost: string | null;
    products: OpenWaProduct[];
    lines: OpenWaLine[];
    storeUrl: string;
};
