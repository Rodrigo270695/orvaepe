export type WebhookEventRow = {
    id: string;
    gateway: string;
    gateway_event_id: string;
    event_type: string;
    payload: Record<string, unknown> | unknown[] | null;
    processed: boolean;
    processed_at: string | null;
    error: string | null;
    attempts: number;
    created_at: string;
    updated_at: string;
};
