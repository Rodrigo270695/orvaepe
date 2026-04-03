/**
 * Datos de contacto y redes ORVAE (footer, landings, /redesorvae).
 */
export type OrvaeSocialLink = {
    id: string;
    label: string;
    subtitle: string;
    href: string;
    iconKey: string;
    iconColor: string;
};

export const ORVAE_CONTACT_EMAIL = 'ventas@orvae.pe';

export const ORVAE_RUC = '20611148217';

export const ORVAE_LEGAL_NAME = 'Cloud Byte SAC';

/** Slug del producto servicio en admin (debe coincidir con `catalog_products.slug`). */
export const ORVAE_SERVICIO_SOFTWARE_MEDIDA_SLUG = 'ORVAE-DESARROLLO-SOFTWARE-MEDIDA';

/** Landing / página informativa (catálogo servicios). */
export const ORVAE_SERVICIO_LANDING_SLUG = 'ORVAE-LANDING-PAGINA-INFORMATIVA';

export const orvaeSocialLinks: OrvaeSocialLink[] = [
    {
        id: 'facebook',
        label: 'Facebook',
        subtitle: 'Síguenos en Facebook',
        href: 'https://www.facebook.com/share/1B9ZMXbTRh/',
        iconKey: 'facebook',
        iconColor: '1877F2',
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        subtitle: 'Videos y novedades',
        href: 'https://www.tiktok.com/@orvae.pe?_r=1&_t=ZS-95CCe7LjUdW',
        iconKey: 'tiktok',
        iconColor: '000000',
    },
    {
        id: 'instagram',
        label: 'Instagram',
        subtitle: 'Fotos, reels y marca',
        href: 'https://www.instagram.com/orvaepe?igsh=MTN0MDg5bTEyemJiYQ==',
        iconKey: 'instagram',
        iconColor: 'E4405F',
    },
];

export function simpleIconUrl(iconKey: string, color: string): string {
    return `https://cdn.simpleicons.org/${iconKey}/${color}`;
}
