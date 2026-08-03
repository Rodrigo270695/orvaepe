/**
 * Helpers SEO para JSON-LD de productos (evitar VideoObject inválidos).
 */

/** URL http(s) absoluta con host real. */
export function isAbsoluteHttpUrl(value: string | null | undefined): value is string {
    if (!value?.trim()) {
        return false;
    }

    try {
        const u = new URL(value.trim());
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            return false;
        }
        return Boolean(u.hostname && u.hostname.includes('.'));
    } catch {
        return false;
    }
}

/**
 * Solo medios de vídeo reales (YouTube, Vimeo, mp4/webm…).
 * Un enlace a entorno demo NO es VideoObject.
 */
export function isVideoMediaUrl(value: string | null | undefined): value is string {
    if (!isAbsoluteHttpUrl(value)) {
        return false;
    }

    const u = new URL(value.trim());
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();
    const path = u.pathname.toLowerCase();

    if (
        host === 'youtube.com' ||
        host === 'youtu.be' ||
        host === 'm.youtube.com' ||
        host === 'vimeo.com' ||
        host.endsWith('.youtube.com')
    ) {
        return true;
    }

    return /\.(mp4|webm|ogg|m3u8)(\?|#|$)/i.test(path);
}

export function buildVideoObjectLd(args: {
    name: string;
    description: string;
    contentUrl: string;
    thumbnailUrl: string;
    uploadDate: string;
    pageUrl: string;
}): Record<string, unknown> {
    return {
        '@type': 'VideoObject',
        name: args.name,
        description: args.description,
        contentUrl: args.contentUrl,
        embedUrl: args.contentUrl,
        thumbnailUrl: args.thumbnailUrl,
        uploadDate: args.uploadDate,
        mainEntityOfPage: args.pageUrl,
    };
}
