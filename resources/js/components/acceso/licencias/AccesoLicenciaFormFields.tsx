import * as React from 'react';

import AdminClienteSelect, {
    type ClienteUserOption,
} from '@/components/admin/form/admin-cliente-select';
import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';

const EMPTY_SKU = '_none_';

export type SkuOption = {
    id: string;
    code: string;
    name: string;
    product_name: string;
    currency: string;
    list_price: string;
};

type Props = {
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuOption[];
    errors: Record<string, string | undefined>;
};

export default function AccesoLicenciaFormFields({
    usersForSelect,
    skusForSelect,
    errors,
}: Props) {
    const [userId, setUserId] = React.useState('');

    const skuOptions = React.useMemo(
        () => [
            { value: EMPTY_SKU, label: '— Elegir SKU —' },
            ...skusForSelect.map((s) => ({
                value: s.id,
                label: `${s.code} · ${s.name} (${s.product_name}) · ${s.currency} ${s.list_price}`,
            })),
        ],
        [skusForSelect],
    );

    return (
        <div>
            <input type="hidden" name="user_id" value={userId} />

            <header className="border-b border-border/40 pb-4">
                <h2
                    id="license-manual-heading"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                    Licencia manual
                </h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    La clave puede dejarse vacía: se generará un código único
                    tipo ORV-XXXX-XXXX-XXXX.
                </p>
            </header>

            <div
                role="group"
                className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
                aria-labelledby="license-manual-heading"
            >
                <div className="md:col-span-2">
                        <AdminClienteSelect
                            id="license_user_id"
                            value={userId}
                            onChange={setUserId}
                            users={usersForSelect}
                            error={errors.user_id}
                            required
                        />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                        <AdminUnderlineLabel htmlFor="catalog_sku_id" required>
                            SKU
                        </AdminUnderlineLabel>
                        <AdminUnderlineSelect
                            id="catalog_sku_id"
                            name="catalog_sku_id"
                            defaultValue={EMPTY_SKU}
                            options={skuOptions}
                            required
                        />
                        <InputError message={errors.catalog_sku_id} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel htmlFor="license_key_value">
                            Clave (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="license_key_value"
                            name="key"
                            type="text"
                            autoComplete="off"
                            placeholder="Vacío = generar automáticamente"
                        />
                        <InputError message={errors.key} />
                </div>

                <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="max_activations" required>
                            Máx. activaciones
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="max_activations"
                            name="max_activations"
                            type="number"
                            min={1}
                            max={999}
                            defaultValue={1}
                            required
                        />
                        <InputError message={errors.max_activations} />
                </div>

                <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="license_status" required>
                            Estado
                        </AdminUnderlineLabel>
                        <AdminUnderlineSelect
                            id="license_status"
                            name="status"
                            defaultValue="draft"
                            options={[
                                {
                                    value: 'draft',
                                    label: 'Borrador (editable y eliminable)',
                                },
                                {
                                    value: 'active',
                                    label: 'Activa (no se puede eliminar)',
                                },
                            ]}
                            required
                        />
                        <p className="text-[10px] text-muted-foreground">
                            En borrador puedes borrar la fila; al activarla solo
                            vigencia y máximo de activaciones.
                        </p>
                        <InputError message={errors.status} />
                </div>

                <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="expires_at">
                            Caduca (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="expires_at"
                            name="expires_at"
                            type="date"
                        />
                        <InputError message={errors.expires_at} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel htmlFor="order_number">
                            N° pedido (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="order_number"
                            name="order_number"
                            type="text"
                            placeholder="Ej. ORV-2026-00001"
                            autoComplete="off"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Debe pertenecer al mismo cliente elegido arriba.
                        </p>
                        <InputError message={errors.order_number} />
                </div>
            </div>
        </div>
    );
}
