export type NotificationRow = {
    id: string;
    user_id?: number | string;
    user: {
        id: number | string;
        name: string;
        lastname?: string | null;
        email: string;
    } | null;
    type: string;
    channel: string;
    subject: string | null;
    message: string | null;
    status: string;
    error: string | null;
    created_at: string;
    read_at: string | null;
    sent_at: string | null;
};
