'use client';

import { Link, usePage } from '@inertiajs/react';
import { Check, MessageCircle, ShoppingCart } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import {
    addMarketingCatalogSkuToCart
    
} from '@/lib/oemCart';
import type {MarketingCartCategoryLabel} from '@/lib/oemCart';
import { resolveOemBrandIconUrl } from '@/lib/oemLicenseIcons';
import { cn } from '@/lib/utils';
import { buildWhatsAppHref, WHATSAPP_E164 } from '@/lib/whatsapp';

export type LicenseSkuItem = {
    id: string;
    name: string;
    list_price: number;
    currency: string;
    price_text: string;
    detail: string | null;
    details?: string[];
    list_number: number | null;
    image_url: string | null;
    icon_key: string;
};

export default function LicenseOemSkuCard({
    item,
    productSlug,
    sectionTitle,
    cartCategoryLabel = 'Licencias',
    detailHref,
    accent = 'var(--state-info)',
    showImage = false,
}: {
    item: LicenseSkuItem;
    /** Slug del catalog_product (ej. oem-nuevos-ingresos). */
    productSlug: string;
    /** Texto de la sección para el carrito. */
    sectionTitle: string;
    /** Prefijo de línea en el carrito (Licencias vs Servicios). */
    cartCategoryLabel?: MarketingCartCategoryLabel;
    /** Enlace opcional a página de detalle (ej. `/servicios/{slug}`). */
    detailHref?: string;
    accent?: string;
    /** Muestra imagen/ícono en el card (ej. licencias). */
    showImage?: boolean;
}) {
    const { contact } = usePage().props as { contact?: { whatsapp_e164?: string } };
    const whatsappE164 = contact?.whatsapp_e164?.replace(/\D/g, '') || WHATSAPP_E164;

    const [justAdded, setJustAdded] = useState(false);
    const hasPrice = item.list_price > 0;
    const fallbackIconUrl = resolveOemBrandIconUrl(item.icon_key);
    const imageUrl = item.image_url ?? fallbackIconUrl;

    const detailLines =
        item.details && item.details.length > 0
            ? item.details.filter((line) => line.trim() !== '')
            : item.detail
              ? [item.detail]
              : [];

    const addToCart = useCallback(() => {
        addMarketingCatalogSkuToCart(productSlug, sectionTitle, item, {
            categoryLabel: cartCategoryLabel,
        });
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1600);
    }, [productSlug, sectionTitle, item, cartCategoryLabel]);

    const whatsappHref = useMemo(
        () =>
            buildWhatsAppHref(
                whatsappE164,
                `Hola ORVAE, quiero información sobre: ${item.name} (${sectionTitle}). [Catálogo web]`,
            ),
        [whatsappE164, item.name, sectionTitle],
    );

    return (
        <article
            className={cn(
                'group relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)]',
                'bg-[color-mix(in_oklab,var(--card)_35%,transparent)] backdrop-blur-md',
                'p-4 shadow-[0_8px_32px_-16px_color-mix(in_oklab,var(--foreground)_12%,transparent)]',
                'transition-[transform,box-shadow] duration-300 ease-out',
                'hover:-translate-y-0.5',
            )}
            style={{
                borderLeft: `3px solid color-mix(in oklab, ${accent} 48%, var(--border))`,
                boxShadow: `0 8px 32px -16px color-mix(in oklab, ${accent} 24%, transparent)`,
            }}
        >
            <div className="min-w-0">
                {showImage && imageUrl ? (
                    <div
                        className="mb-3 flex h-40 items-center justify-center overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--border)_65%,transparent)] p-3"
                        style={{
                            background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 8%, var(--background)), color-mix(in oklab, ${accent} 3%, var(--card)))`,
                        }}
                    >
                        <img
                            src={imageUrl}
                            alt={item.name}
                            className="h-full w-full rounded-lg object-contain object-center"
                            loading="lazy"
                        />
                    </div>
                ) : null}

                {item.list_number !== null ? (
                    <p
                        className="mb-2 text-center font-mono text-[0.62rem] font-bold uppercase tracking-widest text-[var(--muted-foreground)]"
                        style={{
                            color: `color-mix(in oklab, ${accent} 72%, var(--muted-foreground))`,
                        }}
                    >
                        #{String(item.list_number).padStart(2, '0')}
                    </p>
                ) : null}
                <h3 className="mt-0.5 text-center text-base font-bold leading-snug text-[var(--foreground)]">
                    {item.name}
                </h3>
                {detailLines.length > 0 ? (
                    <ul className="mt-3 space-y-1.5">
                        {detailLines.map((line) => (
                            <li
                                key={`${item.id}-${line}`}
                                className="flex items-start gap-2 text-sm leading-relaxed text-[var(--muted-foreground)]"
                            >
                                <span
                                    className="mt-0.5 inline-flex shrink-0 items-center justify-center text-xs font-bold"
                                    style={{ color: `color-mix(in oklab, ${accent} 82%, var(--state-info))` }}
                                    aria-hidden
                                >
                                    ✓
                                </span>
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {hasPrice ? (
                    <div className="mt-4 border-t border-[color-mix(in_oklab,var(--border)_55%,transparent)] pt-3">
                        <p
                            className="text-center font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]"
                            style={{
                                color: `color-mix(in oklab, ${accent} 46%, var(--foreground))`,
                                fontFeatureSettings: '"tnum" 1',
                            }}
                        >
                            S/.{' '}
                            {item.list_price.toLocaleString('es-PE', {
                                minimumFractionDigits: item.list_price % 1 === 0 ? 0 : 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                    </div>
                ) : null}

                <div className="mt-4 flex flex-col gap-2">
                    {detailHref ? (
                        <Link
                            href={detailHref}
                            className={cn(
                                'inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight',
                                'border-2 border-[color-mix(in_oklab,var(--foreground)_14%,var(--border))]',
                                'bg-[color-mix(in_oklab,var(--background)_90%,var(--card))] text-[var(--foreground)]',
                                'shadow-sm shadow-[color-mix(in_oklab,var(--foreground)_8%,transparent)]',
                                'dark:border-[color-mix(in_oklab,var(--foreground)_26%,var(--border))]',
                                'dark:bg-[color-mix(in_oklab,var(--card)_50%,var(--background))]',
                                'dark:shadow-[color-mix(in_oklab,var(--foreground)_12%,transparent)]',
                                'transition-colors hover:border-[color-mix(in_oklab,var(--primary)_42%,var(--border))] hover:bg-[color-mix(in_oklab,var(--primary)_7%,var(--background))]',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--state-info)_55%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_oklab,var(--background)_90%,transparent)]',
                            )}
                        >
                            Ver detalle
                        </Link>
                    ) : null}

                    {hasPrice ? (
                        <button
                            type="button"
                            className={cn(
                                'group/btn relative w-full cursor-pointer overflow-hidden rounded-xl px-4 py-3 text-[15px] font-semibold tracking-tight',
                                'text-[var(--primary-foreground)]',
                                'shadow-[0_6px_24px_-8px_color-mix(in_oklab,var(--state-info)_55%,transparent),inset_0_1px_0_0_color-mix(in_oklab,var(--primary-foreground)_14%,transparent)]',
                                'transition-[transform,box-shadow,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                                'hover:shadow-[0_10px_32px_-8px_color-mix(in_oklab,var(--state-info)_45%,transparent),inset_0_1px_0_0_color-mix(in_oklab,var(--primary-foreground)_18%,transparent)]',
                                'hover:brightness-[1.05]',
                                'active:scale-[0.99]',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--state-info)_70%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_oklab,var(--background)_90%,transparent)]',
                                'disabled:pointer-events-none disabled:opacity-60',
                            )}
                            style={{
                                background: justAdded
                                    ? `linear-gradient(135deg, color-mix(in oklab, ${accent} 86%, var(--foreground)), color-mix(in oklab, ${accent} 72%, black))`
                                    : `linear-gradient(135deg, color-mix(in oklab, ${accent} 92%, var(--state-info)), color-mix(in oklab, ${accent} 74%, var(--state-success)))`,
                            }}
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
                    ) : (
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold tracking-tight',
                                'bg-[#25D366] text-white shadow-[0_6px_24px_-8px_rgba(37,211,102,0.45)]',
                                'transition-[transform,filter] duration-200 hover:brightness-110 active:scale-[0.99]',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
                            )}
                        >
                            <MessageCircle className="size-5 shrink-0" strokeWidth={2} aria-hidden />
                            Contactar por WhatsApp
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
