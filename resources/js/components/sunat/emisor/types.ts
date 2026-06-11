export type CompanyLegalProfile = {
    id: string;
    slug: string;
    legal_name: string;
    trade_name: string | null;
    ruc: string;
    tax_regime: string | null;
    address_line: string | null;
    district: string | null;
    province: string | null;
    department: string | null;
    ubigeo: string | null;
    country: string;
    phone: string | null;
    support_email: string | null;
    website: string | null;
    logo_path: string | null;
    is_default_issuer: boolean;
};

export type FormErrors = Record<string, string | undefined>;

export type DigitalCertificateRow = {
    id: string;
    company_legal_profile_id: string;
    label: string;
    storage_disk: string;
    storage_path: string;
    certificate_thumbprint: string | null;
    serial_number: string | null;
    issuer_cn: string | null;
    valid_from: string | null;
    valid_until: string | null;
    is_active: boolean;
    /** Indica si la contraseña del cert está guardada (password_enc no se expone). */
    has_password: boolean;
};

export type SunatEmitterSettingRow = {
    id: string;
    company_legal_profile_id: string;
    emission_mode: string;
    ose_provider_code: string | null;
    api_base_url: string | null;
    sol_username: string | null;
    /** Indica si la clave SOL está guardada (sol_password_enc no se expone). */
    has_sol_password: boolean;
    default_certificate_id: string | null;
    environment: string;
    options: Record<string, unknown> | null;
    is_active: boolean;
};

export type InvoiceDocumentSequenceRow = {
    id: string;
    company_legal_profile_id: string;
    document_type_code: string;
    serie: string;
    establishment_code: string;
    next_correlative: number;
    correlative_from: number | null;
    correlative_to: number | null;
    authorization_metadata: Record<string, unknown> | null;
    is_active: boolean;
};

/** Perfil con relaciones cargadas desde el backend (snake_case). */
export type CompanyLegalProfileLoaded = CompanyLegalProfile & {
    digital_certificates?: DigitalCertificateRow[];
    sunat_emitter_setting?: SunatEmitterSettingRow | null;
    invoice_document_sequences?: InvoiceDocumentSequenceRow[];
};

export type EmisorTabId = 'perfil' | 'certificados' | 'setup' | 'secuencias';
