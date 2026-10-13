'use client';

import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, Clock3, KeyRound, MessageCircle, ShoppingCart, Zap } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { ComponentType, CSSProperties } from 'react';

import { addMarketingCatalogSkuToCart } from '@/lib/oemCart';
import type { MarketingCartCategoryLabel } from '@/lib/oemCart';
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

type DetailLine = {
    text: string;
    icon: ComponentType<{ className?: string; style?: CSSProperties }>;
    color: string;
};

export function formatPen(value: number): string {
    return `S/ ${value.toLocaleString('es-PE', {
        minimumFractionDigits: value % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    })}`;
}

function toSentenceCase(value: string): string {
    const lower = value.trim().toLowerCase();

    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Separa "(NO CADUCA) Entrega inmediata" en etiqueta de vigencia + línea de entrega. */
function parseDetails(lines: string[]): { badges: string[]; lines: DetailLine[] } {
    const badges: string[] = [];
    const parsed: DetailLine[] = [];

    for (const raw of lines) {
        const match = raw.trim().match(/^\(([^)]+)\)\s*(.*)$/);
        const text = match ? match[2].trim() : raw.trim();

        if (match) {
            badges.push(toSentenceCase(match[1]));
        }

        if (text === '') {
            continue;
        }

        if (/entrega inmediata/i.test(text)) {
            parsed.push({ text, icon: Zap, color: '#0f766e' });
        } else if (/consultar stock/i.test(text)) {
            parsed.push({ text, icon: Clock3, color: '#b45309' });
        } else {
            parsed.push({ text, icon: Check, color: '#2563eb' });
        }
    }

    return { badges, lines: parsed };
}

export default function LicenseOemSkuCard({
    item,
    productSlug,
    sectionTitle,
    cartCategoryLabel = 'Licencias',
    detailHref,
    accent = '#2563eb',
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
    /** Muestra imagen/ícono de marca en el card (ej. licencias). */
    showImage?: boolean;
}) {
    const { contact } = usePage().props as { contact?: { whatsapp_e164?: string } };
    const whatsappE164 = contact?.whatsapp_e164?.replace(/\D/g, '') || WHATSAPP_E164;

    const [justAdded, setJustAdded] = useState(false);
    const [addedOnce, setAddedOnce] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const hasPrice = item.list_price > 0;
    const fallbackIconUrl = resolveOemBrandIconUrl(item.icon_key);
    const imageUrl = item.image_url ?? fallbackIconUrl;

    const { badges, lines } = useMemo(() => {
        const raw =
            item.details && item.details.length > 0
                ? item.details.filter((line) => line.trim() !== '')
                : item.detail
                  ? [item.detail]
                  : [];

        return parseDetails(raw);
    }, [item.details, item.detail]);

    const addToCart = useCallback(() => {
        addMarketingCatalogSkuToCart(productSlug, sectionTitle, item, {
            categoryLabel: cartCategoryLabel,
        });
        setJustAdded(true);
        setAddedOnce(true);
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
            className="pf-card group relative flex h-full flex-col overflow-hidden rounded-2xl transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_oklab,var(--foreground)_18%,var(--border))]"
            data-catalog-card
        >
            <span
                className="absolute inset-x-0 top-0 h-[3px] opacity-80"
                style={{ background: accent }}
                aria-hidden
            />

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3.5">
                    {showImage ? (
                        <span
                            className="inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--foreground)_8%,var(--border))]"
                            style={{ background: `color-mix(in oklab, ${accent} 7%, var(--background))` }}
                            aria-hidden
                        >
                            {imageUrl && !imageFailed ? (
                                <img
                                    src={imageUrl}
                                    alt=""
                                    className={item.image_url ? 'size-full object-cover' : 'size-7 object-contain'}
                                    loading="lazy"
                                    onError={() => setImageFailed(true)}
                                />
                            ) : (
                                <KeyRound className="size-6" style={{ color: accent }} />
                            )}
                        </span>
                    ) : null}

                    <div className="min-w-0 flex-1">
                        {item.list_number !== null ? (
                            <p className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground">
                                N.º {String(item.list_number).padStart(2, '0')}
                            </p>
                        ) : null}
                        <h3 className="mt-0.5 text-base font-bold leading-snug text-foreground">{item.name}</h3>
                    </div>
                </div>

                {badges.length > 0 ? (
                    <ul className="mt-3.5 flex flex-wrap gap-1.5" aria-label="Vigencia">
                        {badges.map((badge) => (
                            <li
                                key={`${item.id}-${badge}`}
                                className="rounded-full border border-[color-mix(in_oklab,#2563eb_30%,var(--border))] bg-[color-mix(in_oklab,#2563eb_8%,transparent)] px-2.5 py-0.5 text-[11px] font-semibold text-[#1d4ed8] dark:text-[#93c5fd]"
                            >
                                {badge}
                            </li>
                        ))}
                    </ul>
                ) : null}

                {lines.length > 0 ? (
                    <ul className="mt-3 space-y-1.5">
                        {lines.map(({ text, icon: Icon, color }) => (
                            <li
                                key={`${item.id}-${text}`}
                                className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                            >
                                <Icon className="mt-[3px] size-3.5 shrink-0" style={{ color }} aria-hidden />
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
                ) : null}

                <div className="mt-auto pt-5">
                    <div className="flex items-end justify-between gap-3 border-t border-[color-mix(in_oklab,var(--foreground)_8%,var(--border))] pt-4">
                        {hasPrice ? (
                            <p className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Precio
                                </span>
                                <span className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">
                                    {formatPen(item.list_price)}
                                </span>
                            </p>
                        ) : (
                            <p className="text-sm font-semibold text-muted-foreground">Precio a consultar</p>
                        )}
                        {addedOnce ? (
                            <Link
                                href="/carrito"
                                className="inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-[#c2410c] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] dark:text-[#fb923c]"
                            >
                                Ver carrito
                                <ArrowRight className="size-3.5" aria-hidden />
                            </Link>
                        ) : null}
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                        {hasPrice ? (
                            <button
                                type="button"
                                onClick={addToCart}
                                className={cn('co-cta w-full', justAdded && '!bg-[#0f766e]')}
                            >
                                {justAdded ? (
                                    <>
                                        <Check className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                                        Añadido
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="size-4 shrink-0" aria-hidden />
                                        Añadir al carrito
                                    </>
                                )}
                            </button>
                        ) : (
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[0.875rem] bg-[#0e7266] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0b5d53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7266] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <MessageCircle className="size-4 shrink-0" aria-hidden />
                                Consultar por WhatsApp
                                <span className="sr-only">(abre en una pestaña nueva)</span>
                            </a>
                        )}

                        {detailHref ? (
                            <Link href={detailHref} className="co-ghost w-full">
                                Ver detalle
                                <ArrowRight className="size-4 shrink-0" aria-hidden />
                            </Link>
                        ) : null}
                    </div>

                    <p className="sr-only" aria-live="polite">
                        {justAdded ? `${item.name} añadido al carrito` : ''}
                    </p>
                </div>
            </div>
        </article>
    );
}
