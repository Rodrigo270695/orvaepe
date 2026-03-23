import * as React from 'react';

import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import { formatLicenseKeyPreview } from '@/components/acceso/licencias/licenseKeyDisplay';
import type { LicenseKeyRow } from '@/components/acceso/licencias/licenseKeyTypes';
import { formatClientFullName } from '@/components/acceso/entitlements/entitlementDisplay';

type Props = {
    item: LicenseKeyRow;
    errors: Record<string, string | undefined>;
};

function expiresAtToInputValue(iso: string | null): string {
    if (!iso) {
        return '';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '';
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function AccesoLicenciaEditFormFields({ item, errors }: Props) {
    return (
        <div className="space-y-5">
            <header className="border-b border-border/40 pb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Editar vigencia
                </h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    En borrador puedes activar la licencia o seguir editando; en
                    activa solo vigencia y máximo de activaciones.
                </p>
            </header>

            <div className="space-y-3 rounded-xl border border-border/50 p-3 text-xs">
                <div>
                    <p className="text-muted-foreground">Clave</p>
                    <p
                        className="break-all font-mono text-[11px] font-medium text-[#4A80B8]"
                        title={item.key}
                    >
                        {formatLicenseKeyPreview(item.key, 24, 8)}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="text-sm font-medium text-foreground">
                        {formatClientFullName(item.user ?? null)}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                        {item.user?.email ?? '—'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {item.status === 'draft' ? (
                    <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel htmlFor="edit_license_status" required>
                            Estado
                        </AdminUnderlineLabel>
                        <AdminUnderlineSelect
                            id="edit_license_status"
                            name="status"
                            value={item.status}
                            options={[
                                {
                                    value: 'draft',
                                    label: 'Borrador',
                                },
                                {
                                    value: 'active',
                                    label: 'Activa',
                                },
                            ]}
                            required
                        />
                        <InputError message={errors.status} />
                    </div>
                ) : null}

                <div className="space-y-1.5">
                    <AdminUnderlineLabel htmlFor="edit_max_activations" required>
                        Máx. activaciones
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="edit_max_activations"
                        name="max_activations"
                        type="number"
                        min={1}
                        max={999}
                        defaultValue={item.max_activations ?? 1}
                        required
                    />
                    <InputError message={errors.max_activations} />
                </div>

                <div className="space-y-1.5">
                    <AdminUnderlineLabel htmlFor="edit_expires_at">
                        Caduca (opcional)
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="edit_expires_at"
                        name="expires_at"
                        type="date"
                        defaultValue={expiresAtToInputValue(item.expires_at)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Vacío = sin fecha de caducidad.
                    </p>
                    <InputError message={errors.expires_at} />
                </div>
            </div>
        </div>
    );
}
