import { Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CompanyLegalProfile } from '@/components/sunat/emisor/types';

type Props = {
    profiles: CompanyLegalProfile[];
    onEdit: (profile: CompanyLegalProfile) => void;
};

function DefaultBadge({ isDefault }: { isDefault: boolean }) {
    if (!isDefault) return null;

    return (
        <span className="inline-flex items-center rounded-full bg-[var(--o-amber)]/15 px-2 py-0.5 text-xs font-medium text-[var(--o-amber)]">
            Default
        </span>
    );
}

export default function EmisorProfilesTable({ profiles, onEdit }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                        <th className="px-3">Estado</th>
                        <th className="px-3">Razón social</th>
                        <th className="px-3">RUC</th>
                        <th className="px-3">Régimen</th>
                        <th className="px-3">Ubicación</th>
                        <th className="px-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {profiles.map((p) => (
                        <tr key={p.id} className="bg-muted/20">
                            <td className="px-3 py-2 align-middle">
                                <DefaultBadge isDefault={p.is_default_issuer} />
                            </td>
                            <td className="px-3 py-2 align-middle">
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        {p.legal_name}
                                    </span>
                                    {p.trade_name ? (
                                        <span className="text-xs text-muted-foreground">
                                            {p.trade_name}
                                        </span>
                                    ) : null}
                                </div>
                            </td>
                            <td className="px-3 py-2 align-middle font-mono text-sm">
                                {p.ruc}
                            </td>
                            <td className="px-3 py-2 align-middle">
                                <span className="text-sm">
                                    {p.tax_regime ?? '—'}
                                </span>
                            </td>
                            <td className="px-3 py-2 align-middle text-sm">
                                {[
                                    p.district,
                                    p.province,
                                    p.department,
                                ]
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                            </td>
                            <td className="px-3 py-2 align-middle">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(p)}
                                    >
                                        <Pencil className="mr-1 size-4" />
                                        Editar
                                    </Button>
                                    {/* Por ahora, “Ver” no abre modal separado. */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(p)}
                                    >
                                        <Eye className="size-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {profiles.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-3 py-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No hay emisores configurados todavía.
                                </p>
                            </td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        </div>
    );
}

