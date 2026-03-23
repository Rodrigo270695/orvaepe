import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    section: string;
};

export default function AdminComingSoonPage({ section }: Props) {
    const title = panelSectionTitle(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title, href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-xl text-sm">
                        Esta sección está en construcción. El menú lateral ya
                        refleja la estructura del modelo de datos (catálogo,
                        ventas, derechos, operación e informes).
                    </p>
                    <p className="text-muted-foreground mt-1 font-mono text-xs">
                        Ruta: {panelPath(section)}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}

