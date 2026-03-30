import * as React from 'react';

import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';

type RevenueLine = 'software_system' | 'oem_license' | 'service';

export type CatalogSkuProductOption = {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    category?: {
        id: string;
        name: string;
        revenue_line: RevenueLine;
    } | null;
};

type CatalogSkuCategoryOption = {
    id: string;
    name: string;
    revenue_line: RevenueLine;
};

export type CatalogSku = {
    id: string;
    catalog_product_id: string;
    code: string;
    name: string;
    sale_model: string;
    billing_interval: string | null;
    rental_days: number | null;
    list_price: string | number;
    currency: string;
    tax_included: boolean;
    /** Si es false, el precio de lista es el total (no se calcula IGV). */
    igv_applies?: boolean;
    limits?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
    fulfillment_type: string;
    is_active: boolean;
    sort_order: number;
    product?: {
        id: string;
        name: string;
        slug: string;
        category?: {
            id: string;
            name: string;
            revenue_line: RevenueLine;
        } | null;
    } | null;
};

type Props = {
    mode: 'create' | 'edit';
    item: CatalogSku | null;
    errors: Record<string, string | undefined>;
    productsForSelect: CatalogSkuProductOption[];
    nextSortOrder: number;
};

const saleModelOptions = [
    { value: 'source_perpetual', label: 'Código fuente (perpetuo)' },
    { value: 'source_rental', label: 'Código fuente (alquiler)' },
    { value: 'saas_subscription', label: 'SaaS (suscripción)' },
    { value: 'oem_license_one_time', label: 'OEM pago único' },
    { value: 'oem_license_subscription', label: 'OEM suscripción' },
    { value: 'service_project', label: 'Servicio por proyecto' },
    { value: 'service_subscription', label: 'Servicio recurrente' },
] as const;

const billingIntervalOptions = [
    { value: '_none_', label: 'No aplica' },
    { value: 'one_time', label: 'Una vez' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'annual', label: 'Anual' },
    { value: 'custom', label: 'Personalizado' },
] as const;

const fulfillmentOptions = [
    { value: 'download', label: 'Descarga' },
    { value: 'manual_provision', label: 'Provisionamiento manual' },
    { value: 'saas_url', label: 'URL SaaS' },
    { value: 'external_vendor', label: 'Proveedor externo' },
] as const;

const currencyOptions = [
    { value: 'PEN', label: 'Soles (PEN)' },
    { value: 'USD', label: 'Dólar (USD)' },
] as const;

export default function CatalogSkuFormFields({
    mode,
    item,
    errors,
    productsForSelect,
    nextSortOrder,
}: Props) {
    const [isActive, setIsActive] = React.useState(item?.is_active ?? true);
    const [taxIncluded, setTaxIncluded] = React.useState(item?.tax_included ?? false);
    const [igvApplies, setIgvApplies] = React.useState(item?.igv_applies ?? true);
    const [codeValue, setCodeValue] = React.useState(item?.code ?? '');
    const [nameValue, setNameValue] = React.useState(item?.name ?? '');
    const [sortOrderValue, setSortOrderValue] = React.useState(
        mode === 'create' ? String(nextSortOrder) : String(item?.sort_order ?? ''),
    );
    const [selectedCategoryId, setSelectedCategoryId] = React.useState('');
    const [selectedProductId, setSelectedProductId] = React.useState('');
    const [saleModelValue, setSaleModelValue] = React.useState(item?.sale_model ?? 'saas_subscription');
    const [billingIntervalValue, setBillingIntervalValue] = React.useState(item?.billing_interval ?? '_none_');

    const fallbackProductId = item?.catalog_product_id
        ? String(item.catalog_product_id)
        : item?.product?.id
            ? String(item.product.id)
            : '';

    const fallbackCategoryId = item?.product?.category?.id
        ? String(item.product.category.id)
        : '';

    const effectiveCategoryId = selectedCategoryId || fallbackCategoryId;
    const effectiveProductId = selectedProductId || fallbackProductId;

    React.useEffect(() => {
        setIsActive(item?.is_active ?? true);
        setTaxIncluded(item?.tax_included ?? false);
        setIgvApplies(item?.igv_applies ?? true);
        setCodeValue(item?.code ?? '');
        setNameValue(item?.name ?? '');
        setSortOrderValue(mode === 'create' ? String(nextSortOrder) : String(item?.sort_order ?? ''));
        setSelectedProductId(
            item?.catalog_product_id
                ? String(item.catalog_product_id)
                : item?.product?.id
                    ? String(item.product.id)
                    : '',
        );
        setSaleModelValue(item?.sale_model ?? 'saas_subscription');
        setBillingIntervalValue(item?.billing_interval ?? '_none_');

        const currentProductId = item?.catalog_product_id
            ? String(item.catalog_product_id)
            : item?.product?.id
                ? String(item.product.id)
                : '';
        const matchedProduct = productsForSelect.find((p) => String(p.id) === currentProductId);
        setSelectedCategoryId(
            matchedProduct?.category?.id
                ? String(matchedProduct.category.id)
                : item?.product?.category?.id
                    ? String(item.product.category.id)
                    : '',
        );
    }, [
        item?.id,
        item?.is_active,
        item?.tax_included,
        item?.igv_applies,
        item?.code,
        item?.name,
        item?.sort_order,
        item?.catalog_product_id,
        mode,
        nextSortOrder,
        productsForSelect,
    ]);

    const recurringModels = React.useMemo(
        () => new Set(['source_rental', 'saas_subscription', 'oem_license_subscription', 'service_subscription']),
        [],
    );
    const isRecurringModel = recurringModels.has(saleModelValue);

    const billingOptionsForModel = React.useMemo(() => {
        if (isRecurringModel) {
            return billingIntervalOptions.filter((opt) => ['monthly', 'annual', 'custom'].includes(opt.value));
        }

        return billingIntervalOptions.filter((opt) => ['_none_', 'one_time'].includes(opt.value));
    }, [isRecurringModel]);

    React.useEffect(() => {
        if (isRecurringModel) {
            if (!['monthly', 'annual', 'custom'].includes(billingIntervalValue)) {
                setBillingIntervalValue('monthly');
            }
            return;
        }

        if (!['_none_', 'one_time'].includes(billingIntervalValue)) {
            setBillingIntervalValue('_none_');
        }
    }, [isRecurringModel, billingIntervalValue]);

    const toTitleCaseWords = (value: string) =>
        value
            .toLocaleLowerCase('es')
            .replace(/(^|\s)(\p{L})/gu, (match, sep: string, letter: string) => `${sep}${letter.toLocaleUpperCase('es')}`);

    const productLabel = (p: CatalogSkuProductOption) =>
        `${p.name} (${p.category?.name ?? 'Sin categoría'})`;

    const categoriesForSelect = React.useMemo<CatalogSkuCategoryOption[]>(() => {
        const map = new Map<string, CatalogSkuCategoryOption>();
        productsForSelect.forEach((product) => {
            const cat = product.category;
            if (!cat) return;
            const categoryId = String(cat.id);
            if (!map.has(categoryId)) {
                map.set(categoryId, {
                    id: categoryId,
                    name: cat.name,
                    revenue_line: cat.revenue_line,
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }, [productsForSelect]);

    const filteredProducts = React.useMemo(() => {
        if (!effectiveCategoryId) return [];

        const base = productsForSelect.filter(
            (p) => String(p.category?.id ?? '') === effectiveCategoryId,
        );

        // Fallback para edición: si el producto actual no vino en productsForSelect,
        // lo inyectamos desde el item para que el select se precargue.
        const currentProductId = effectiveProductId;

        const hasCurrent = currentProductId !== '' && base.some((p) => String(p.id) === currentProductId);
        if (hasCurrent || !item?.product || !item?.product?.category) {
            return base;
        }

        if (String(item.product.category.id) !== effectiveCategoryId) {
            return base;
        }

        return [
            ...base,
            {
                id: String(item.product.id),
                name: item.product.name,
                slug: item.product.slug,
                is_active: true,
                category: {
                    id: String(item.product.category.id),
                    name: item.product.category.name,
                    revenue_line: item.product.category.revenue_line,
                },
            } satisfies CatalogSkuProductOption,
        ];
    }, [productsForSelect, effectiveCategoryId, effectiveProductId, item]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="catalog_category_id" required>
                        Categoría
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="catalog_category_id"
                        name="catalog_category_id"
                        value={effectiveCategoryId}
                        onValueChange={(next) => {
                            setSelectedCategoryId(next);
                            setSelectedProductId('');
                        }}
                        options={categoriesForSelect.map((c) => ({
                            value: String(c.id),
                            label: c.name,
                        }))}
                        placeholder="Selecciona una categoría"
                    />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="catalog_product_id" required>
                        Producto
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="catalog_product_id"
                        name="catalog_product_id"
                        value={effectiveProductId}
                        onValueChange={(next) => setSelectedProductId(next)}
                        options={filteredProducts.map((p) => ({
                            value: String(p.id),
                            label: productLabel(p),
                        }))}
                        disabled={!effectiveCategoryId}
                        placeholder="Selecciona un producto"
                    />
                    <InputError message={errors.catalog_product_id} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="code" required>
                        Código SKU
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="code"
                        name="code"
                        value={codeValue}
                        onChange={(event) => setCodeValue(event.target.value.toLocaleUpperCase('es'))}
                        required
                        placeholder="Ej: ERP-CONTAB-MENSUAL"
                    />
                    <InputError message={errors.code} />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="name" required>
                        Nombre comercial
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="name"
                        name="name"
                        value={nameValue}
                        onChange={(event) => setNameValue(toTitleCaseWords(event.target.value))}
                        required
                        placeholder="Ej: ERP Contabilidad mensual"
                    />
                    <InputError message={errors.name} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="sale_model" required>
                        Modelo de venta
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="sale_model"
                        name="sale_model"
                        value={saleModelValue}
                        onValueChange={(next) => setSaleModelValue(next)}
                        options={saleModelOptions as unknown as { value: string; label: string }[]}
                    />
                    <InputError message={errors.sale_model} />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="billing_interval">
                        Intervalo de facturación
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="billing_interval"
                        name="billing_interval"
                        value={billingIntervalValue}
                        onValueChange={(next) => setBillingIntervalValue(next)}
                        options={billingOptionsForModel as unknown as { value: string; label: string }[]}
                        required={false}
                    />
                    <p className="text-[11px] text-muted-foreground">
                        {isRecurringModel
                            ? 'Modelo recurrente: usa mensual, anual o personalizado.'
                            : 'Modelo no recurrente: usa una vez o no aplica.'}
                    </p>
                    <InputError message={errors.billing_interval} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="list_price" required>
                        Precio lista
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="list_price"
                        name="list_price"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={item?.list_price ?? ''}
                        required
                        placeholder="0.00"
                    />
                    <InputError message={errors.list_price} />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="currency" required>
                        Moneda
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="currency"
                        name="currency"
                        defaultValue={item?.currency ?? 'PEN'}
                        options={currencyOptions as unknown as { value: string; label: string }[]}
                    />
                    <InputError message={errors.currency} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="rental_days">
                        Días de alquiler
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="rental_days"
                        name="rental_days"
                        type="number"
                        min="1"
                        required={billingIntervalValue === 'custom'}
                        defaultValue={item?.rental_days ?? ''}
                        placeholder={billingIntervalValue === 'custom' ? 'Requerido' : 'Opcional'}
                    />
                    {billingIntervalValue === 'custom' ? (
                        <p className="text-[11px] text-muted-foreground">Con intervalo personalizado, indica cuántos días dura.</p>
                    ) : null}
                    <InputError message={errors.rental_days} />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <AdminUnderlineLabel htmlFor="fulfillment_type" required>
                        Tipo de entrega
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="fulfillment_type"
                        name="fulfillment_type"
                        defaultValue={item?.fulfillment_type ?? 'download'}
                        options={fulfillmentOptions as unknown as { value: string; label: string }[]}
                    />
                    <InputError message={errors.fulfillment_type} />
                </div>
            </div>

            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="sort_order">
                    Orden
                </AdminUnderlineLabel>
                <AdminUnderlineInput
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    value={sortOrderValue}
                    onChange={(event) => setSortOrderValue(event.target.value)}
                    placeholder="0"
                />
                <InputError message={errors.sort_order} />
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                    <Checkbox
                        id="tax_included"
                        checked={taxIncluded}
                        onCheckedChange={(v) => setTaxIncluded(Boolean(v))}
                        className="cursor-pointer"
                    />
                    <span className="font-mono text-[9px] font-normal uppercase tracking-[0.14em] text-(--o-warm)">
                        Precio incluye IGV
                    </span>
                    <input type="hidden" name="tax_included" value={taxIncluded ? '1' : '0'} />
                </div>
                <div className="flex items-center gap-3">
                    <Checkbox
                        id="igv_applies"
                        checked={igvApplies}
                        onCheckedChange={(v) => setIgvApplies(Boolean(v))}
                        className="cursor-pointer"
                    />
                    <span className="font-mono text-[9px] font-normal uppercase tracking-[0.14em] text-(--o-warm)">
                        Aplica IGV
                    </span>
                    <input type="hidden" name="igv_applies" value={igvApplies ? '1' : '0'} />
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                    <Checkbox
                        id="is_active"
                        checked={isActive}
                        onCheckedChange={(v) => setIsActive(Boolean(v))}
                        className="cursor-pointer"
                    />
                    <span className="font-mono text-[9px] font-normal uppercase tracking-[0.14em] text-(--o-warm)">
                        Activo
                    </span>
                    <input type="hidden" name="is_active" value={isActive ? '1' : '0'} />
                </div>
            </div>
            <p className="text-[11px] text-(--muted-foreground)">
                Si desmarcas &quot;Aplica IGV&quot;, el precio de lista es el total para el cliente (exento / no
                grava IGV en venta).
            </p>
            <InputError message={errors.tax_included} />
            <InputError message={errors.igv_applies} />
            <InputError message={errors.is_active} />
        </div>
    );
}

