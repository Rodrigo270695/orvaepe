import { FileSpreadsheet } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
    /** Ruta absoluta o relativa de la exportación (p. ej. `/panel/.../export` + query). */
    href: string;
    'aria-label'?: string;
    title?: string;
    className?: string;
};

/**
 * Botón compacto de exportación a Excel para cabeceras del panel.
 * Fondo verde con el mismo relieve neumórfico que `NeuButtonRaised`; icono siempre blanco.
 */
export default function AdminExcelExportLink({
    href,
    'aria-label': ariaLabel = 'Descargar listado en Excel',
    title,
    className,
}: Props) {
    return (
        <a
            href={href}
            className={cn(
                'neumorph inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border-0',
                'bg-[#217346]! text-white transition-[box-shadow,transform,color] duration-200',
                'hover:[box-shadow:var(--neu-raised-hover)] active:scale-[0.99]',
                className,
            )}
            aria-label={ariaLabel}
            title={title}
        >
            <FileSpreadsheet className="size-5" aria-hidden />
        </a>
    );
}
