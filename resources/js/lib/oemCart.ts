import { readSoftwareCart, writeSoftwareCart } from '@/lib/softwareCartStorage';

/** Datos mínimos del SKU OEM para el carrito (coincide con lo que envía el backend). */
export type OemSkuCartInput = {
    id: string;
    name: string;
    list_price: number;
    currency: string;
};

export type MarketingCartCategoryLabel = 'Licencias' | 'Servicios';

/**
 * Añade una línea de catálogo (OEM o servicios) al carrito de marketing.
 * `productSlug` = slug del producto (ej. oem-nuevos-ingresos, svc-correos-corporativos).
 * `planId` en carrito = UUID del SKU.
 */
export function addMarketingCatalogSkuToCart(
    productSlug: string,
    sectionTitle: string,
    item: OemSkuCartInput,
    options?: { categoryLabel?: MarketingCartCategoryLabel },
): void {
    const categoryLabel: MarketingCartCategoryLabel =
        options?.categoryLabel ?? 'Licencias';
    const items = readSoftwareCart();
    const existing = items.find(
        (i) => i.systemSlug === productSlug && i.planId === item.id,
    );

    const priceText = `${item.list_price.toLocaleString('es-PE', {
        minimumFractionDigits: item.list_price % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    })} ${item.currency}`;

    const snapshot = {
        systemName: `${categoryLabel} · ${sectionTitle}`,
        planLabel: item.name,
        priceText,
        unitPricePen: item.list_price,
    };

    if (existing) {
        existing.qty += 1;
        Object.assign(existing, snapshot);
    } else {
        items.push({
            systemSlug: productSlug,
            planId: item.id,
            qty: 1,
            ...snapshot,
        });
    }

    writeSoftwareCart(items);
}

export function addOemLicenseToCart(
    productSlug: string,
    sectionTitle: string,
    item: OemSkuCartInput,
): void {
    addMarketingCatalogSkuToCart(productSlug, sectionTitle, item, {
        categoryLabel: 'Licencias',
    });
}
