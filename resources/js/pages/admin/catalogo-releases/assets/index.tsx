import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import SoftwareReleaseAssetsIndex from '@/components/catalog/releases/SoftwareReleaseAssetsIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type ProductPayload = {
    id: string;
    name: string;
    slug: string;
};

type AssetRow = {
    id: string;
    label: string;
    path: string;
    sha256: string | null;
    created_at: string | null;
};

type Props = {
    release: {
        id: string;
        version: string;
        catalog_product_id: string;
        product: ProductPayload | null;
    };
    assets: AssetRow[];
};

export default function SoftwareReleaseAssetsPage({ release, assets }: Props) {
    const section = 'catalogo-releases';
    const title = `Archivos · v${release.version}`;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
        { title, href: `/panel/catalogo-releases/${release.id}/assets` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={panelPath('catalogo-releases')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a versiones
                    </Link>
                </div>

                <SoftwareReleaseAssetsIndex
                    releaseId={release.id}
                    version={release.version}
                    product={release.product}
                    assets={assets}
                />
            </div>
        </AppLayout>
    );
}
