/** Número en formato internacional sin + (Perú 51 + 9 dígitos móvil). */
export const WHATSAPP_E164 = '51976809804';

const defaultMessage =
    'Hola, me gustaría comunicarme con ustedes desde el sitio web de Orvae.';

export function whatsAppHref(message: string = defaultMessage): string {
    const params = new URLSearchParams({ text: message });
    return `https://wa.me/${WHATSAPP_E164}?${params.toString()}`;
}
