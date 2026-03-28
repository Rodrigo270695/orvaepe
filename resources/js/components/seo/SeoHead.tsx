import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

export type SeoBreadcrumbItem = {
    name: string;
    /** Ruta absoluta desde la raíz, ej. /software */
    path: string;
};

export type SeoDefaults = {
    siteUrl: string;
    siteName: string;
    defaultDescription: string;
    defaultImage: string;
    defaultOgImageAlt: string;
    ogImageWidth: number;
    ogImageHeight: number;
    logoPath: string;
    locale: string;
    alternateLocale: string;
    twitterHandle: string | null;
    organizationDescription: string;
    organizationLegalName: string | null;
    organizationAlternateNames: string[];
    organizationEmail: string | null;
    organizationPhone: string | null;
    organizationSameAs: string[];
    siteSearchUrlTemplate: string | null;
    geoRegion: string;
    geoPlacename: string;
};

type PageWithSeo = { seo: SeoDefaults };

function toAbsolute(siteUrl: string, path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${siteUrl}${p}`;
}

function buildOrganizationNode(seo: SeoDefaults): Record<string, unknown> {
    const orgId = `${seo.siteUrl}#organization`;
    const logoUrl = toAbsolute(seo.siteUrl, seo.logoPath);

    const org: Record<string, unknown> = {
        '@type': 'Organization',
        '@id': orgId,
        name: seo.siteName,
        url: seo.siteUrl,
        description: seo.organizationDescription,
        logo: {
            '@type': 'ImageObject',
            url: logoUrl,
        },
        areaServed: {
            '@type': 'Country',
            name: 'Perú',
        },
    };

    if (seo.organizationLegalName) {
        org.legalName = seo.organizationLegalName;
    }

    if (seo.organizationAlternateNames.length > 0) {
        org.alternateName =
            seo.organizationAlternateNames.length === 1
                ? seo.organizationAlternateNames[0]
                : seo.organizationAlternateNames;
    }

    if (seo.organizationEmail) {
        org.email = seo.organizationEmail;
    }

    if (seo.organizationPhone) {
        org.telephone = seo.organizationPhone;
    }

    if (seo.organizationSameAs.length > 0) {
        org.sameAs = seo.organizationSameAs;
    }

    return org;
}

function buildWebSiteNode(seo: SeoDefaults): Record<string, unknown> {
    const orgId = `${seo.siteUrl}#organization`;
    const webId = `${seo.siteUrl}#website`;

    const site: Record<string, unknown> = {
        '@type': 'WebSite',
        '@id': webId,
        name: seo.siteName,
        url: seo.siteUrl,
        description: seo.defaultDescription,
        publisher: { '@id': orgId },
        inLanguage: seo.alternateLocale,
    };

    const template = seo.siteSearchUrlTemplate?.trim();
    if (template && template.includes('{search_term_string}')) {
        site.potentialAction = {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: template,
            },
            'query-input': 'required name=search_term_string',
        };
    }

    return site;
}

function buildBreadcrumbListNode(
    seo: SeoDefaults,
    items: SeoBreadcrumbItem[],
    canonicalPath: string,
): { list: Record<string, unknown>; listId: string } {
    const listId = `${toAbsolute(seo.siteUrl, canonicalPath)}#breadcrumb`;

    const elements = items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: toAbsolute(seo.siteUrl, item.path),
    }));

    return {
        listId,
        list: {
            '@type': 'BreadcrumbList',
            '@id': listId,
            itemListElement: elements,
        },
    };
}

function buildWebPageNode(
    seo: SeoDefaults,
    title: string,
    description: string,
    canonicalPath: string,
    breadcrumbListId: string | null,
): Record<string, unknown> {
    const pageId = `${toAbsolute(seo.siteUrl, canonicalPath)}#webpage`;
    const webId = `${seo.siteUrl}#website`;

    const page: Record<string, unknown> = {
        '@type': 'WebPage',
        '@id': pageId,
        name: title,
        description,
        url: toAbsolute(seo.siteUrl, canonicalPath),
        isPartOf: { '@id': webId },
        inLanguage: seo.alternateLocale,
    };

    if (breadcrumbListId) {
        page.breadcrumb = { '@id': breadcrumbListId };
    }

    return page;
}

function buildJsonLdGraph(args: {
    seo: SeoDefaults;
    title: string;
    description: string;
    path: string;
    structuredData: 'full' | 'minimal' | 'none';
    breadcrumbs: SeoBreadcrumbItem[] | undefined;
    extra: Record<string, unknown>[];
}): Record<string, unknown> | null {
    const { seo, title, description, path, structuredData, breadcrumbs, extra } =
        args;

    if (structuredData === 'none' && extra.length === 0) {
        return null;
    }

    const graph: Record<string, unknown>[] = [];

    if (structuredData === 'full') {
        graph.push(buildOrganizationNode(seo));
        graph.push(buildWebSiteNode(seo));

        let breadcrumbId: string | null = null;
        if (breadcrumbs && breadcrumbs.length > 0) {
            const { list, listId } = buildBreadcrumbListNode(seo, breadcrumbs, path);
            breadcrumbId = listId;
            graph.push(list);
        }

        graph.push(
            buildWebPageNode(seo, title, description, path, breadcrumbId),
        );
    } else if (structuredData === 'minimal') {
        graph.push(buildWebPageNode(seo, title, description, path, null));
    }

    for (const node of extra) {
        graph.push(node);
    }

    if (graph.length === 0) {
        return null;
    }

    return {
        '@context': 'https://schema.org',
        '@graph': graph,
    };
}

type Props = {
    title: string;
    description: string;
    canonicalPath?: string;
    ogImage?: string;
    ogImageAlt?: string;
    ogType?: 'website' | 'article' | 'product';
    noindex?: boolean;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    structuredData?: 'full' | 'minimal' | 'none';
    /** Migas de pan (JSON-LD BreadcrumbList + ruta semántica) */
    breadcrumbs?: SeoBreadcrumbItem[];
    children?: ReactNode;
};

export default function SeoHead({
    title,
    description,
    canonicalPath,
    ogImage,
    ogImageAlt,
    ogType = 'website',
    noindex = false,
    jsonLd,
    structuredData = 'full',
    breadcrumbs,
    children,
}: Props) {
    const page = usePage<PageWithSeo>();
    const { seo } = page.props;

    const pathFromPage = page.url.split('?')[0] || '/';
    const path = canonicalPath ?? pathFromPage;
    const canonicalUrl = toAbsolute(seo.siteUrl, path);

    const rawImage = ogImage ?? seo.defaultImage;
    const absoluteImage = rawImage.startsWith('http')
        ? rawImage
        : toAbsolute(
              seo.siteUrl,
              rawImage.startsWith('/') ? rawImage : `/${rawImage}`,
          );

    const imageAlt = ogImageAlt ?? seo.defaultOgImageAlt;
    const ogLocale = seo.locale.replace('_', '-');

    const extra = jsonLd
        ? Array.isArray(jsonLd)
            ? jsonLd
            : [jsonLd]
        : [];

    const graphLd = buildJsonLdGraph({
        seo,
        title,
        description,
        path,
        structuredData,
        breadcrumbs,
        extra,
    });

    return (
        <Head title={title}>
            <meta name="description" content={description} />
            <meta name="author" content={seo.siteName} />
            <meta name="publisher" content={seo.siteName} />
            <meta name="geo.region" content={seo.geoRegion} />
            <meta name="geo.placename" content={seo.geoPlacename} />

            <link rel="canonical" href={canonicalUrl} />
            <link rel="alternate" hreflang={seo.alternateLocale} href={canonicalUrl} />
            <link rel="alternate" hreflang="x-default" href={canonicalUrl} />

            {noindex ? (
                <>
                    <meta name="robots" content="noindex, nofollow" />
                    <meta name="googlebot" content="noindex, nofollow" />
                </>
            ) : (
                <meta
                    name="robots"
                    content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
                />
            )}

            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={seo.siteName} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:locale" content={ogLocale} />
            <meta property="og:image" content={absoluteImage} />
            <meta property="og:image:secure_url" content={absoluteImage} />
            <meta property="og:image:alt" content={imageAlt} />
            <meta
                property="og:image:width"
                content={String(seo.ogImageWidth)}
            />
            <meta
                property="og:image:height"
                content={String(seo.ogImageHeight)}
            />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteImage} />
            <meta name="twitter:image:alt" content={imageAlt} />
            {seo.twitterHandle ? (
                <meta name="twitter:site" content={`@${seo.twitterHandle}`} />
            ) : null}

            {graphLd ? (
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(graphLd) }}
                />
            ) : null}

            {children}
        </Head>
    );
}
