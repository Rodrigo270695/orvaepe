export type SalesHubTab = 'conocimiento' | 'conversaciones';

export type SalesHubSectionTipo =
    | 'modulo'
    | 'faq'
    | 'objecion'
    | 'novedad'
    | 'general';

export type SalesHubProductItem = {
    key: string;
    label: string;
    /** true = ya tiene conocimiento propio en ORVAE */
    editado: boolean;
    secciones: number;
};

export type SalesHubPlan = {
    codigo: string | null;
    nombre: string;
    descripcion: string | null;
    precio_mensual: number | null;
    precio_anual: number | null;
    moneda: string;
    trial_days: number;
    incluye: string[];
};

export type SalesHubSection = {
    id: number;
    tipo: SalesHubSectionTipo;
    titulo: string;
    contenido: string;
    activo: boolean;
    routes: { update: string; destroy: string };
};

export type SalesHubKnowledgeForm = {
    nombre: string;
    resumen: string;
    publico: string;
    palabras_clave: string;
    demo_url: string;
    demo_usuario: string;
    demo_password: string;
    registro_url: string;
    instrucciones: string;
};

export type SalesHubKnowledge = {
    producto: string;
    saas_ok: boolean;
    saas_obtenido_at: string | null;
    planes: SalesHubPlan[];
    saas_secciones: number;
    form: SalesHubKnowledgeForm;
    placeholders: Partial<Record<keyof SalesHubKnowledgeForm, string | null>>;
    sections: SalesHubSection[];
    routes: { update: string; importar: string; bloques: string };
};

export type SalesHubConversation = {
    id: string;
    phone: string | null;
    nombre: string | null;
    producto: string | null;
    linea: string | null;
    bot_activo: boolean;
    pausa: string | null;
    pausa_motivo: string | null;
    no_leidos: number;
    last_inbound_at: string | null;
    last_outbound_at: string | null;
    created_at: string | null;
    ultimo_mensaje: { autor: string; body: string; at: string | null } | null;
    routes: { show: string; pausar: string; reanudar: string };
};

export type SalesHubMessage = {
    id: number;
    direccion: 'in' | 'out';
    autor: 'cliente' | 'bot' | 'humano';
    tipo: string;
    body: string;
    producto: string | null;
    at: string | null;
};

export type SalesHubConversationsPayload = {
    data: SalesHubConversation[];
    meta: { total: number; page: number; last_page: number };
    stats: { total: number; activos: number; pausados: number; hoy: number };
    filters: { producto: string | null; estado: string; search: string };
};

export type SalesHubPageProps = {
    tab: SalesHubTab;
    products: SalesHubProductItem[];
    knowledge: SalesHubKnowledge | null;
    conversations: SalesHubConversationsPayload;
    routes: { index: string };
};
