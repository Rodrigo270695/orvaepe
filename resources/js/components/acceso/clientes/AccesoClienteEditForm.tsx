import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';

import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

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
                    Correo y documento deben ser únicos. Si el correo ya existe en
                    otro usuario, cámbialo aquí antes de crear la orden.
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
                    <div>
                        <AdminUnderlineLabel htmlFor="document_number">
                            Documento (DNI 8 / RUC 11)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="document_number"
                            inputMode="numeric"
                            maxLength={11}
                            value={form.data.document_number}
                            onChange={(e) =>
                                form.setData(
                                    'document_number',
                                    e.target.value.replace(/\D/g, ''),
                                )
                            }
                        />
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
                    RUC y razón social para comprobantes. El RUC no puede repetirse
                    en otro cliente.
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
                    <div>
                        <AdminUnderlineLabel htmlFor="ruc">
                            RUC (11 dígitos)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="ruc"
                            inputMode="numeric"
                            maxLength={11}
                            value={form.data.ruc}
                            onChange={(e) =>
                                form.setData(
                                    'ruc',
                                    e.target.value.replace(/\D/g, ''),
                                )
                            }
                            placeholder="20XXXXXXXXX"
                        />
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
