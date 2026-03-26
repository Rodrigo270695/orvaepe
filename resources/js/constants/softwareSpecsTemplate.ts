/**
 * Plantilla general de claves de "specs" usadas en la app.
 *
 * Objetivo:
 * - Centralizar aliases para que el panel y el detalle público compartan la misma lógica conceptual.
 * - Dejar de usar archivos separados para imágenes y demo.
 */

// -----------------------------
// Imágenes (imagenes|image|img)
// -----------------------------

export const SOFTWARE_SPECS_IMAGES_ALIASES = [
    'imagenes',
    'image',
    'img',
] as const;

export const SOFTWARE_SPECS_IMAGES_CANONICAL = 'imagenes' as const;

export function isSoftwareSpecsImagesKey(
    code: string | null | undefined,
): boolean {
    const c = (code ?? '').trim().toLowerCase();

    return SOFTWARE_SPECS_IMAGES_ALIASES.includes(c as any);
}

// -----------------------------
// Demo URL (demo|link|url)
// -----------------------------

export const SOFTWARE_SPECS_DEMO_URL_ALIASES = ['demo', 'link', 'url'] as const;
export const SOFTWARE_SPECS_DEMO_URL_CANONICAL = 'demo' as const;

// -----------------------------
// Demo user (demo_user|demo_username|usuario|username|user)
// -----------------------------

export const SOFTWARE_SPECS_DEMO_USERNAME_ALIASES = [
    'demo_user',
    'demo_username',
    'usuario',
    'username',
    'user',
] as const;
export const SOFTWARE_SPECS_DEMO_USERNAME_CANONICAL = 'demo_user' as const;

// -----------------------------
// Demo password (demo_password|demo_pass|contraseña|contrasena|password|pass)
// -----------------------------

export const SOFTWARE_SPECS_DEMO_PASSWORD_ALIASES = [
    'demo_password',
    'demo_pass',
    'contraseña',
    'contrasena',
    'password',
    'pass',
] as const;
export const SOFTWARE_SPECS_DEMO_PASSWORD_CANONICAL = 'demo_password' as const;

