/**
 * Claves canónicas y aliases para metadata/límites de SKU.
 * Se usan en el panel de extras y para reconocer campos especiales.
 */

export const SKU_METADATA_LINEA_ALIASES = ['linea_sku', 'sku_line'] as const;
export const SKU_METADATA_LINEA_CANONICAL = 'linea_sku' as const;

export const SKU_METADATA_NUMERO_LISTA_ALIASES = ['numero_lista', 'list_number'] as const;
export const SKU_METADATA_NUMERO_LISTA_CANONICAL = 'numero_lista' as const;

export const SKU_METADATA_DETALLE_ALIASES = ['detalle', 'detail'] as const;
export const SKU_METADATA_DETALLE_CANONICAL = 'detalle' as const;

export const SKU_METADATA_CLAVE_ICONO_ALIASES = ['clave_icono', 'icon_key'] as const;
export const SKU_METADATA_CLAVE_ICONO_CANONICAL = 'clave_icono' as const;

export const SKU_METADATA_IMAGEN_ITEM_ALIASES = [
    'imagen_item',
    'imagen_url',
    'image_item',
    'image_url',
] as const;
export const SKU_METADATA_IMAGEN_ITEM_CANONICAL = 'imagen_item' as const;

export function isSkuMetadataImageItemKey(code: string | null | undefined): boolean {
    const c = (code ?? '').trim().toLowerCase();
    return SKU_METADATA_IMAGEN_ITEM_ALIASES.includes(c as any);
}

