export type WhatsappCloudEventRow = {
    id: string;
    event_type: string;
    wamid: string;
    processed: boolean;
    processed_at: string | null;
    error: string | null;
    attempts: number;
    meta_error: { code: string | null; message: string | null } | null;
    created_at: string | null;
    mensaje: {
        producto: string;
        tenant_id: string;
        reminder_id: string | null;
        telefono: string;
        direccion: 'in' | 'out';
        plantilla: string | null;
        estado: string;
    } | null;
};

export type WhatsappCloudStats = {
    total: number;
    procesados: number;
    con_error: number;
    fallidos: number;
    entrantes: number;
};

export type WhatsappCloudFilters = {
    q?: string;
    processed?: string;
    tipo?: string;
    producto?: string;
    date_from?: string;
    date_to?: string;
};
