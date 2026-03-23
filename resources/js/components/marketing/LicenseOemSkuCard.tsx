'use client';

import { Check, Package, ShoppingCart } from 'lucide-react';
import { useCallback, useState } from 'react';

import { cn } from '@/lib/utils';
import {
    addMarketingCatalogSkuToCart,
    type MarketingCartCategoryLabel,
} from '@/lib/oemCart';
import { resolveOemBrandIconUrl } from '@/lib/oemLicenseIcons';

export type LicenseSkuItem = {
    id: string;
    name: string;
    list_price: number;
    currency: string;
    price_text: string;
    detail: string | null;
    list_number: number | null;
    image_url: string | null;
    icon_key: string;
};

export default function LicenseOemSkuCard({
    item,
    productSlug,
    sectionTitle,
    cartCategoryLabel = 'Licencias',
}: {
    item: LicenseSkuItem;
    /** Slug del catalog_product (ej. oem-nuevos-ingresos). */
    productSlug: string;
    /** Texto de la sección para el carrito. */
    sectionTitle: string;
    /** Prefijo de línea en el carrito (Licencias vs Servicios). */
    cartCategoryLabel?: MarketingCartCategoryLabel;
}) {
    const [justAdded, setJustAdded] = useState(false);
    const imgSrc = item.image_url ?? resolveOemBrandIconUrl(item.icon_key);

    const addToCart = useCallback(() => {
        addMarketingCatalogSkuToCart(productSlug, sectionTitle, item, {
            categoryLabel: cartCategoryLabel,
        });
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1600);
    }, [productSlug, sectionTitle, item, cartCategoryLabel]);

    return (
        <article
            className={cn(
                'group relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)]',
                'bg-[color-mix(in_oklab,var(--card)_35%,transparent)] backdrop-blur-md',
                'p-4 shadow-[0_8px_32px_-16px_color-mix(in_oklab,var(--foreground)_12%,transparent)]',
                'transition-[transform,box-shadow] duration-300 ease-out',
                'hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_28%,var(--border))]',
                'hover:shadow-[0_12px_40px_-12px_color-mix(in_oklab,var(--primary)_18%,transparent)]',
            )}
        >
            <div className="flex gap-4">
                <div
                    className={cn(
                        'relative flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-xl',
                        'border border-[color-mix(in_oklab,var(--border)_60%,transparent)]',
                        'bg-[color-mix(in_oklab,var(--muted)_40%,transparent)]',
                    )}
                >
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt=""
                            className="max-h-12 max-w-[3rem] object-contain opacity-95"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <Package className="size-8 text-[var(--muted-foreground)]" aria-hidden />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    {item.list_number !== null ? (
                        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                            #{String(item.list_number).padStart(2, '0')}
                        </p>
                    ) : null}
                    <h3 className="mt-0.5 text-sm font-bold leading-snug text-[var(--foreground)]">
                        {item.name}
                    </h3>
                    {item.detail ? (
                        <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
                            {item.detail}
                        </p>
                    ) : null}
                    <div className="mt-3 border-t border-[color-mix(in_oklab,var(--border)_55%,transparent)] pt-2">
                        <p
                            className="font-[family-name:var(--font-display)] text-xl font-bold tabular-nums tracking-tight text-[var(--foreground)]"
                            style={{ fontFeatureSettings: '"tnum" 1' }}
                        >
                            S/.{' '}
                            {item.list_price.toLocaleString('es-PE', {
                                minimumFractionDigits: item.list_price % 1 === 0 ? 0 : 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                    </div>
                    <div className="mt-4">
                        <button
                            type="button"
                            className={cn(
                                'group/btn relative w-full cursor-pointer overflow-hidden rounded-xl px-4 py-3 text-[15px] font-semibold tracking-tight',
                                'text-[var(--primary-foreground)]',
                                'shadow-[0_6px_24px_-8px_color-mix(in_oklab,var(--primary)_55%,transparent),inset_0_1px_0_0_color-mix(in_oklab,var(--primary-foreground)_14%,transparent)]',
                                'transition-[transform,box-shadow,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                                'hover:shadow-[0_10px_32px_-8px_color-mix(in_oklab,var(--primary)_45%,transparent),inset_0_1px_0_0_color-mix(in_oklab,var(--primary-foreground)_18%,transparent)]',
                                'hover:brightness-[1.05]',
                                'active:scale-[0.99]',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--primary)_70%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_oklab,var(--background)_90%,transparent)]',
                                'disabled:pointer-events-none disabled:opacity-60',
                                justAdded
                                    ? 'bg-[color-mix(in_oklab,var(--primary)_88%,var(--foreground))]'
                                    : 'bg-[var(--primary)]',
                            )}
                            onClick={addToCart}
                        >
                            {!justAdded ? (
                                <span
                                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
                                    aria-hidden
                                    style={{
                                        background:
                                            'radial-gradient(ellipse 120% 80% at 50% -20%, color-mix(in oklab, var(--primary-foreground) 12%, transparent), transparent 55%)',
                                    }}
                                />
                            ) : null}
                            <span className="relative inline-flex w-full items-center justify-center gap-2.5">
                                {justAdded ? (
                                    <>
                                        <Check
                                            className="size-[1.1rem] shrink-0 opacity-95"
                                            strokeWidth={2.5}
                                            aria-hidden
                                        />
                                        Añadido al carrito
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart
                                            className="size-[1.1rem] shrink-0 opacity-95"
                                            strokeWidth={2}
                                            aria-hidden
                                        />
                                        Añadir al carrito
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
