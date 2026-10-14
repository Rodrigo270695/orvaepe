import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import SeoHead, { type SeoBreadcrumbItem } from '@/components/seo/SeoHead';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import MarketingUnifiedNavbar from './MarketingUnifiedNavbar';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';

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
    breadcrumbs?: SeoBreadcrumbItem[];
    keywords?: string;
    /** Imagen LCP de la página: se precarga con prioridad alta. */
    preloadImage?: string;
    hideAppearanceToggle?: boolean;
    /** El hero de la página arranca detrás del navbar flotante (debe reservar ~5.5rem arriba). */
    heroBehindNav?: boolean;
    children: ReactNode;
};

export default function MarketingLayout({
    title,
    description,
    canonicalPath,
    ogImage,
    ogImageAlt,
    ogType,
    noindex,
    jsonLd,
    structuredData = 'full',
    breadcrumbs,
    keywords,
    preloadImage,
    hideAppearanceToggle = false,
    heroBehindNav = false,
    children,
}: Props) {
    return (
        <>
            <SeoHead
                title={title}
                description={description}
                canonicalPath={canonicalPath}
                ogImage={ogImage}
                ogImageAlt={ogImageAlt}
                ogType={ogType}
                noindex={noindex}
                jsonLd={jsonLd}
                structuredData={structuredData}
                breadcrumbs={breadcrumbs}
                keywords={keywords}
            />
            {preloadImage ? (
                <Head>
                    <link rel="preload" as="image" href={preloadImage} fetchPriority="high" head-key="lcp-preload" />
                </Head>
            ) : null}
            <div className="min-h-screen overflow-x-clip bg-background text-foreground">
                <MarketingUnifiedNavbar />
                {heroBehindNav ? null : <div className="h-[5.5rem] shrink-0" aria-hidden />}
                {hideAppearanceToggle ? null : <AppearanceFloatingRailToggle />}
                <main>{children}</main>
                <WelcomeFooter />
            </div>
        </>
    );
}
