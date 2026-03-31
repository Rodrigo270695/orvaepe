import { FileSpreadsheet } from 'lucide-react';

type Props = {
    /** Ruta absoluta o relativa de la exportación (p. ej. `/panel/.../export` + query). */
    href: string;
    'aria-label'?: string;
    title?: string;
    className?: string;
};

/**
 * Botón compacto de exportación a Excel para cabeceras del panel.
 * Fondo verde fijo; el icono contrasta en claro (oscuro) y oscuro (blanco).
 */
export default function AdminExcelExportLink({
    href,
    'aria-label': ariaLabel = 'Descargar listado en Excel',
    title,
    className = '',
}: Props) {
    return (
        <a
            href={href}
            className={[
                'inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl',
                'border border-[color-mix(in_oklab,#145c32_35%,transparent)]',
                'bg-[#217346] text-neutral-950 shadow-sm transition-colors hover:bg-[#1a5c38]',
                'dark:text-white',
                className,
            ].join(' ')}
            aria-label={ariaLabel}
            title={title}
        >
            <FileSpreadsheet className="size-5" aria-hidden />
        </a>
    );
}
