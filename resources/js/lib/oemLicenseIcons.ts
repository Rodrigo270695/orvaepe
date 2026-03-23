/**
 * Iconos de marca (Simple Icons CDN) cuando no hay metadata.image_url en el SKU.
 * Sustituir por imagen propia vía panel: catalog_skus.metadata.image_url
 *
 * @see https://simpleicons.org/
 */
const SIMPLE_ICON_COLORS: Record<string, string> = {
    microsoft: '5E5E5E',
    microsoftoffice: 'D83B01',
    windows: '0078D4',
    autodesk: '0696D7',
    eset: '7EBC44',
    kaspersky: '006D54',
    mcafee: 'C01818',
    bitdefender: 'ED1C24',
    norton: 'FFE01A',
    avg: '1C69D4',
    canva: '00C4CC',
    generic: '94A3B8',
};

export function resolveOemBrandIconUrl(iconKey: string): string | null {
    const key = iconKey.trim().toLowerCase() || 'generic';
    const color = SIMPLE_ICON_COLORS[key] ?? SIMPLE_ICON_COLORS.generic;

    if (key === 'generic') {
        return null;
    }

    return `https://cdn.simpleicons.org/${key}/${color}`;
}
