/** Número en formato internacional sin + (Perú 51 + 9 dígitos móvil). */
export const WHATSAPP_E164 = '51976809804';

const defaultMessage =
    'Hola, me gustaría comunicarme con ustedes desde el sitio web de Orvae.';

export function buildWhatsAppHref(e164: string, message: string): string {
    const params = new URLSearchParams({ text: message });
    return `https://wa.me/${e164}?${params.toString()}`;
}

export function whatsAppHref(message: string = defaultMessage): string {
    return buildWhatsAppHref(WHATSAPP_E164, message);
}
