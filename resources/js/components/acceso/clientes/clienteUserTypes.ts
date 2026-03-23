export type ClientUserRow = {
    id: number;
    username: string;
    name: string;
    lastname: string | null;
    email: string;
    document_number: string | null;
    phone: string | null;
    email_verified_at: string | null;
    created_at: string;
};
