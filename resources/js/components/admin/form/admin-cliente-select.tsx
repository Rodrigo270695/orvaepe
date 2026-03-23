import * as React from 'react';

import InputError from '@/components/input-error';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import {
    SearchableSelect,
    type SearchableSelectOption,
} from '@/components/admin/form/searchable-select';

export type ClienteUserOption = {
    id: number;
    name: string;
    email: string;
};

type Props = {
    id?: string;
    /** Id de usuario como string, o '' si no hay selección */
    value: string;
    onChange: (userId: string) => void;
    users: ClienteUserOption[];
    placeholder?: string;
    noOptionsMessage?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
};

/**
 * Select buscable de usuarios con rol cliente (`client` en Spatie).
 * Los datos deben venir ya filtrados desde el backend.
 */
export default function AdminClienteSelect({
    id = 'cliente_user_id',
    value,
    onChange,
    users,
    placeholder = 'Buscar cliente por nombre o correo…',
    noOptionsMessage = 'No hay coincidencias',
    error,
    required = false,
    disabled = false,
}: Props) {
    const options = React.useMemo<SearchableSelectOption[]>(
        () =>
            users.map((u) => ({
                value: String(u.id),
                label: `${u.name} (${u.email})`,
                searchTerms: [u.name, u.email],
            })),
        [users],
    );

    return (
        <div className="space-y-1.5">
            <AdminUnderlineLabel htmlFor={id} required={required}>
                Cliente
            </AdminUnderlineLabel>
            <div className="cursor-pointer">
                <SearchableSelect
                    id={id}
                    value={value}
                    onChange={onChange}
                    options={options}
                    placeholder={placeholder}
                    noOptionsMessage={noOptionsMessage}
                    isClearable
                    disabled={disabled}
                />
            </div>
            <InputError message={error} />
        </div>
    );
}
