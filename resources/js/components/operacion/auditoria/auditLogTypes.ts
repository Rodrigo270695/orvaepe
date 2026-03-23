export type AuditLogRow = {
    id: string;
    user_id: number | null;
    action: string;
    entity_type: string;
    entity_id: string;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: {
        name: string;
        lastname: string | null;
        email: string;
    } | null;
};
