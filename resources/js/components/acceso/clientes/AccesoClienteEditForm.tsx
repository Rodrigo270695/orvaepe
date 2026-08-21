import { useForm } from '@inertiajs/react';
import { Building2, Loader2, Save, Search } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { getCsrfToken } from '@/lib/csrf';

export type AccesoClienteEditData = {
    id: number;
    username: string;
    name: string;
    lastname: string;
    email: string;
    document_number: string;
    phone: string;
    email_verified_at: string | null;
    company_name: string;
    legal_name: string;
    ruc: string;
    billing_email: string;
    city: string;
    address: string;
};

type Props = {
    client: AccesoClienteEditData;
};

type LookupPayload = {
    message?: string;
    tipo_doc?: string;
    name?: string;
    lastname?: string;
    nombres?: string;
    apellidos?: string;
            address?: string;
            city?: string | null;
            estado?: string | null;
            condicion?: string | null;
};

export default function AccesoClienteEditForm({ client }: Props) {
    const form = useForm({
        name: client.name,
        lastname: client.lastname,
        email: client.email,
        username: client.username,
        document_number: client.document_number,
        phone: client.phone,
        company_name: client.company_name,
        legal_name: client.legal_name,
        ruc: client.ruc,
        billing_email: client.billing_email,
        city: client.city,
        address: client.address,
    });

    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [lookupOk, setLookupOk] = useState<string | null>(null);

    const lookupDocument = async (raw: string) => {
        const digits = raw.replace(/\D/g, '');
        if (digits.length !== 8 && digits.length !== 11) {
            setLookupError('Ingresa un DNI (8) o RUC (11) válido para consultar.');
            setLookupOk(null);
            return;
        }

        setLookupLoading(true);
        setLookupError(null);
        setLookupOk(null);

        try {
            const res = await fetch('/panel/ventas-facturas/lookup-doc', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ document: digits }),
            });

            const body = (await res.json().catch(() => ({}))) as LookupPayload;

            if (!res.ok) {
                setLookupError(
                    body.message ?? 'No se encontraron datos para ese documento.',
                );
                return;
            }

            const nextName = (body.nombres ?? body.name ?? '').trim();
            const nextLast = (body.apellidos ?? body.lastname ?? '').trim();
            const nextAddress = (body.address ?? '').trim();
            const nextCity = (body.city ?? '').trim();
            const isRuc = digits.length === 11;

            if (isRuc) {
                const razon = nextName;
                if (razon !== '') {
                    form.setData((prev) => ({
                        ...prev,
                        name: razon,
                        lastname:
                            nextLast !== ''
                                ? nextLast
                                : prev.lastname.trim() !== ''
                                  ? prev.lastname
                                  : '—',
                        document_number: digits,
                        ruc: digits,
                        legal_name: razon,
                        company_name:
                            prev.company_name.trim() !== ''
                                ? prev.company_name
                                : razon,
                        address:
                            nextAddress !== '' ? nextAddress : prev.address,
                        city: nextCity !== '' ? nextCity : prev.city,
                    }));
                }
                setLookupOk(
                    [
                        'RUC consultado en SUNAT (apiperu.dev).',
                        body.estado ? `Estado: ${body.estado}` : null,
                        body.condicion ? `Condición: ${body.condicion}` : null,
                    ]
                        .filter(Boolean)
                        .join(' · '),
                );
            } else {
                form.setData((prev) => ({
                    ...prev,
                    name: nextName !== '' ? nextName : prev.name,
                    lastname: nextLast !== '' ? nextLast : prev.lastname,
                    document_number: digits,
                }));
                setLookupOk('DNI consultado (apiperu.dev). Revisa nombre y apellidos.');
            }
        } catch {
            setLookupError('Error de conexión al consultar apiperu.dev.');
        } finally {
            setLookupLoading(false);
        }
    };

    const canLookupDoc =
        form.data.document_number.replace(/\D/g, '').length === 8
        || form.data.document_number.replace(/\D/g, '').length === 11;

    const canLookupRuc = form.data.ruc.replace(/\D/g, '').length === 11;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.patch(`/panel/acceso-clientes/${client.id}`, {
                    preserveScroll: true,
                });
            }}
            className="space-y-5"
        >
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <h2 className="text-sm font-bold">Cuenta (portal)</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                    Correo y documento deben ser únicos. Usa «Consultar» con DNI o
                    RUC para rellenar datos vía apiperu.dev.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                        <AdminUnderlineLabel htmlFor="name" required>
                            Nombre
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            autoComplete="given-name"
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <div>
                        <AdminUnderlineLabel htmlFor="lastname" required>
                            Apellidos
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="lastname"
                            value={form.data.lastname}
                            onChange={(e) =>
                                form.setData('lastname', e.target.value)
                            }
                            autoComplete="family-name"
                        />
                        <InputError message={form.errors.lastname} />
                    </div>
                    <div>
                        <AdminUnderlineLabel htmlFor="email" required>
                            Correo
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            autoComplete="email"
                        />
                        <InputError message={form.errors.email} />
                        {client.email_verified_at ? (
                            <p className="mt-1 text-[10px] text-[#4A9A72]">
                                Correo verificado
                                {form.data.email !== client.email
                                    ? ' · al cambiarlo se pedirá verificar de nuevo'
                                    : ''}
                            </p>
                        ) : (
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Correo sin verificar
                            </p>
                        )}
                    </div>
                    <div>
                        <AdminUnderlineLabel htmlFor="username" required>
                            Usuario
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="username"
                            value={form.data.username}
                            onChange={(e) =>
                                form.setData('username', e.target.value)
                            }
                            autoComplete="username"
                        />
                        <InputError message={form.errors.username} />
                    </div>
                    <div className="md:col-span-2">
                        <AdminUnderlineLabel htmlFor="document_number">
                            Documento (DNI 8 / RUC 11)
                        </AdminUnderlineLabel>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                            <div className="min-w-0 flex-1">
                                <AdminUnderlineInput
                                    id="document_number"
                                    inputMode="numeric"
                                    maxLength={11}
                                    value={form.data.document_number}
                                    onChange={(e) => {
                                        setLookupError(null);
                                        setLookupOk(null);
                                        form.setData(
                                            'document_number',
                                            e.target.value.replace(/\D/g, ''),
                                        );
                                    }}
                                />
                            </div>
                            <NeuButtonRaised
                                type="button"
                                disabled={lookupLoading || !canLookupDoc}
                                onClick={() =>
                                    void lookupDocument(form.data.document_number)
                                }
                                className="h-10 shrink-0 cursor-pointer gap-1.5 px-3 text-[11px] sm:mt-px"
                                title="Consultar DNI/RUC en apiperu.dev"
                            >
                                {lookupLoading ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Search className="size-3.5 text-[#4A80B8]" />
                                )}
                                Consultar
                            </NeuButtonRaised>
                        </div>
                        <InputError message={form.errors.document_number} />
                    </div>
                    <div>
                        <AdminUnderlineLabel htmlFor="phone">
                            Teléfono
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="phone"
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                            autoComplete="tel"
                        />
                        <InputError message={form.errors.phone} />
                    </div>
                </div>
            </NeuCardRaised>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <h2 className="text-sm font-bold">Facturación (adquirente)</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                    RUC y razón social para comprobantes. Consulta SUNAT con el
                    botón junto al RUC.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                        <AdminUnderlineLabel htmlFor="legal_name">
                            Razón social
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="legal_name"
                            value={form.data.legal_name}
                            onChange={(e) =>
                                form.setData('legal_name', e.target.value)
                            }
                        />
                        <InputError message={form.errors.legal_name} />
                    </div>
                    <div>
                        <AdminUnderlineLabel htmlFor="company_name">
                            Nombre comercial
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="company_name"
                            value={form.data.company_name}
                            onChange={(e) =>
                                form.setData('company_name', e.target.value)
                            }
                        />
                        <InputError message={form.errors.company_name} />
                    </div>
                    <div className="md:col-span-2">
                        <AdminUnderlineLabel htmlFor="ruc">
                            RUC (11 dígitos)
                        </AdminUnderlineLabel>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                            <div className="min-w-0 flex-1">
                                <AdminUnderlineInput
                                    id="ruc"
                                    inputMode="numeric"
                                    maxLength={11}
                                    value={form.data.ruc}
                                    onChange={(e) => {
                                        setLookupError(null);
                                        setLookupOk(null);
                                        form.setData(
                                            'ruc',
                                            e.target.value.replace(/\D/g, ''),
                                        );
                                    }}
                                    placeholder="20XXXXXXXXX"
                                />
                            </div>
                            <NeuButtonRaised
                                type="button"
                                disabled={lookupLoading || !canLookupRuc}
                                onClick={() => void lookupDocument(form.data.ruc)}
                                className="h-10 shrink-0 cursor-pointer gap-1.5 px-3 text-[11px] sm:mt-px"
                                title="Consultar razón social y dirección en SUNAT (apiperu.dev)"
                            >
                                {lookupLoading ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Building2 className="size-3.5 text-[#4A80B8]" />
                                )}
                                Consultar SUNAT
                            </NeuButtonRaised>
                        </div>
                        <InputError message={form.errors.ruc} />
                    </div>
                    <div>
                        <AdminUnderlineLabel htmlFor="billing_email">
                            Correo de facturación
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="billing_email"
                            type="email"
                            value={form.data.billing_email}
                            onChange={(e) =>
                                form.setData('billing_email', e.target.value)
                            }
                        />
                        <InputError message={form.errors.billing_email} />
                    </div>
                    <div>
                        <AdminUnderlineLabel htmlFor="city">
                            Ciudad
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="city"
                            value={form.data.city}
                            onChange={(e) => form.setData('city', e.target.value)}
                        />
                        <InputError message={form.errors.city} />
                    </div>
                    <div className="md:col-span-2">
                        <AdminUnderlineLabel htmlFor="address">
                            Dirección
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="address"
                            value={form.data.address}
                            onChange={(e) =>
                                form.setData('address', e.target.value)
                            }
                        />
                        <InputError message={form.errors.address} />
                    </div>
                </div>

                {lookupError ? (
                    <p className="mt-3 text-[11px] text-[#C05050]">{lookupError}</p>
                ) : null}
                {lookupOk ? (
                    <p className="mt-3 text-[11px] text-[#4A9A72]">{lookupOk}</p>
                ) : null}
            </NeuCardRaised>

            <div className="flex justify-end">
                <NeuButtonRaised
                    type="submit"
                    disabled={form.processing}
                    className="inline-flex cursor-pointer items-center gap-2"
                >
                    <Save className="size-3.5" />
                    {form.processing ? 'Guardando…' : 'Guardar cliente'}
                </NeuButtonRaised>
            </div>
        </form>
    );
}
