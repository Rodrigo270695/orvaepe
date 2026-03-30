import { Copy, Eye } from 'lucide-react';
import * as React from 'react';

import {
    formatDateTime,
    secretKindLabel,
} from '@/components/acceso/credenciales/secretDisplay';
import type { EntitlementSecretDetail } from '@/components/acceso/credenciales/secretDetailTypes';
import {
    entitlementStatusBadgeClass,
    entitlementStatusLabel,
    formatClientFullName,
} from '@/components/acceso/entitlements/entitlementDisplay';
import AdminModalShell from '@/components/ui/admin-modal-shell';
import { Button } from '@/components/ui/button';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    detail: EntitlementSecretDetail | null;
    loading?: boolean;
    errorMessage?: string | null;
};

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <div className="text-sm leading-snug">
                {children}
            </div>
        </div>
    );
}

export default function CredentialSecretViewModal({
    open,
    onOpenChange,
    detail,
    loading = false,
    errorMessage = null,
}: Props) {
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!open) {
            setCopied(false);
        }
    }, [open]);

    const copySecret = async () => {
        if (!detail?.secret_value) {
            return;
        }
        try {
            await navigator.clipboard.writeText(detail.secret_value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    const metadataStr =
        detail?.metadata && Object.keys(detail.metadata).length > 0
            ? JSON.stringify(detail.metadata, null, 2)
            : null;

    return (
        <AdminModalShell
            open={open}
            onOpenChange={onOpenChange}
            title="Detalle de credencial"
            description="Información completa de la credencial o API key"
            width="wide"
        >
            <div className="space-y-4">
                {loading ? (
                    <p className="text-sm text-muted-foreground">Cargando…</p>
                ) : null}
                {errorMessage ? (
                    <p className="text-sm text-[color-mix(in_oklab,var(--state-danger)_80%,var(--foreground))]">
                        {errorMessage}
                    </p>
                ) : null}
                {!loading && detail ? (
                    <>
                        <NeuCardRaised className="rounded-xl p-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Eye className="size-4 text-[#D28C3C]" />
                                <span className="text-sm font-semibold">
                                    {secretKindLabel(detail.kind)}
                                </span>
                                {detail.entitlement?.status ? (
                                    <span
                                        className={[
                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                            entitlementStatusBadgeClass(
                                                detail.entitlement.status,
                                            ),
                                        ].join(' ')}
                                    >
                                        {entitlementStatusLabel(
                                            detail.entitlement.status,
                                        )}
                                    </span>
                                ) : null}
                            </div>
                        </NeuCardRaised>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Etiqueta">
                                {detail.label ?? '—'}
                            </Field>
                            <Field label="Ref. pública">
                                <span className="font-mono text-xs break-all">
                                    {detail.public_ref ?? '—'}
                                </span>
                            </Field>
                            <Field label="Producto">
                                <span className="break-words">
                                    {detail.entitlement?.product_name ?? '—'}
                                </span>
                            </Field>
                            {detail.entitlement?.sku || detail.entitlement?.sku_name ? (
                                <Field label="SKU">
                                    <span className="break-words">
                                        {[detail.entitlement.sku, detail.entitlement.sku_name]
                                            .filter(Boolean)
                                            .join(' · ') || '—'}
                                    </span>
                                </Field>
                            ) : null}
                            <Field label="ID entitlement">
                                <span className="font-mono text-xs break-all">
                                    {detail.entitlement?.id ?? '—'}
                                </span>
                            </Field>
                            {detail.entitlement?.user ? (
                                <Field label="Cliente">
                                    {formatClientFullName(detail.entitlement.user)}
                                </Field>
                            ) : null}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Caduca">
                                {formatDateTime(detail.expires_at)}
                            </Field>
                            <Field label="Revocado">
                                {formatDateTime(detail.revoked_at)}
                            </Field>
                            <Field label="Rotado">
                                {formatDateTime(detail.rotated_at)}
                            </Field>
                            <Field label="Último uso">
                                {formatDateTime(detail.last_used_at)}
                            </Field>
                            <Field label="Alta">
                                {formatDateTime(detail.created_at)}
                            </Field>
                        </div>

                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Valor del secreto
                                </p>
                                {detail.secret_value ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-8 cursor-pointer px-2 text-xs"
                                        onClick={copySecret}
                                    >
                                        <Copy className="mr-1 size-3.5" />
                                        {copied ? 'Copiado' : 'Copiar'}
                                    </Button>
                                ) : null}
                            </div>
                            <pre className="max-h-[min(40vh,320px)] overflow-auto rounded-lg border border-border/60 bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                                {detail.secret_value ?? 'No se pudo descifrar el valor.'}
                            </pre>
                        </div>

                        {metadataStr ? (
                            <div className="space-y-2">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Metadatos (JSON)
                                </p>
                                <pre className="max-h-[min(30vh,240px)] overflow-auto rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-[11px] whitespace-pre-wrap break-all">
                                    {metadataStr}
                                </pre>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </div>
        </AdminModalShell>
    );
}
