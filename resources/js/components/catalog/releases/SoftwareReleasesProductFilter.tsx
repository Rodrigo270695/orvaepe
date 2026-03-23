import { router, usePage } from '@inertiajs/react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import type { ProductOption } from '@/components/catalog/releases/SoftwareReleaseFormFields';

type Props = {
    productsForSelect: ProductOption[];
    initialProductId: string;
    className?: string;
};

export default function SoftwareReleasesProductFilter({
    productsForSelect,
    initialProductId,
    className,
}: Props) {
    const page = usePage();

    return (
        <div className={className}>
            <div className="space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_catalog_product_id">
                    Producto
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_catalog_product_id"
                    name="filter_catalog_product_id"
                    value={initialProductId || '_all_'}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete(
                                'catalog_product_id',
                            );
                        } else {
                            currentUrl.searchParams.set(
                                'catalog_product_id',
                                next,
                            );
                        }
                        currentUrl.searchParams.set('page', '1');
                        router.get(
                            currentUrl.pathname + currentUrl.search,
                            {},
                            {
                                preserveScroll: true,
                                preserveState: true,
                                replace: true,
                            },
                        );
                    }}
                    options={[
                        { value: '_all_', label: 'Todos los sistemas' },
                        ...productsForSelect.map((p) => ({
                            value: p.id,
                            label: `${p.name}`,
                        })),
                    ]}
                />
            </div>
        </div>
    );
}
