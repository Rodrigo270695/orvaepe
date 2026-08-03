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
            <div className="min-h-screen bg-background text-foreground">
                <MarketingUnifiedNavbar />
                <div className="h-20 shrink-0" aria-hidden />
                <AppearanceFloatingRailToggle />
                <main>{children}</main>
                <WelcomeFooter />
            </div>
        </>
    );
}
