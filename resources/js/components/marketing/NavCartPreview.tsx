import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';

import {
    clearSoftwareCart,
    type SoftwareCartItem,
} from '@/lib/softwareCartStorage';

type Props = {
    cartCount: number;
    cartLines: SoftwareCartItem[];
    cartBump: boolean;
    onClear: () => void;
};

export default function NavCartPreview({ cartCount, cartLines, cartBump, onClear }: Props) {
    return (
        <div className="group/cart relative">
            <Link
                href="/carrito"
                aria-label="Ir al carrito de compras"
                title="Pasa el cursor para ver el resumen del carrito"
                className={[
                    'relative z-[60] inline-flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-[var(--foreground)]',
                    'transition-colors hover:border-[color-mix(in_oklab,var(--state-info)_48%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)]',
                    'transform-gpu',
                    cartBump ? 'animate-pulse scale-105' : '',
                ].join(' ')}
            >
                <ShoppingCart className="size-4 text-[var(--state-info)]" />
                {cartCount > 0 && (
                    <span
                        className="min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-bold text-[var(--primary-foreground)]"
                        style={{
                            background:
                                'linear-gradient(135deg, color-mix(in oklab, var(--state-success) 88%, var(--state-info)), color-mix(in oklab, var(--state-info) 72%, var(--state-success)))',
                        }}
                    >
                        {cartCount}
                    </span>
                )}
            </Link>

            {/* Panel hover — solo desktop, no táctil */}
            <div
                className="pointer-events-none invisible absolute right-0 top-full z-[70] w-[min(20rem,calc(100vw-2rem))] pt-2 opacity-0 transition-all duration-200 group-hover/cart:pointer-events-auto group-hover/cart:visible group-hover/cart:opacity-100"
                role="region"
                aria-label="Resumen del carrito"
            >
                <div className="max-h-[min(70vh,22rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-card/95 p-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md">
                    {cartLines.length === 0 ? (
                        <p className="px-2 py-4 text-center text-sm text-[var(--muted-foreground)]">
                            Tu carrito está vacío
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {cartLines.map((line) => (
                                <li
                                    key={`${line.systemSlug}:${line.planId}`}
                                    className="rounded-xl border border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-background/60 px-3 py-2"
                                >
                                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                                        {line.systemName ?? line.systemSlug}
                                    </p>
                                    <p className="truncate text-xs text-[var(--muted-foreground)]">
                                        {line.planLabel ?? line.planId}
                                    </p>
                                    <p className="mt-1 text-xs font-medium tabular-nums text-[var(--foreground)]">
                                        ×{line.qty}
                                        {line.priceText ? (
                                            <span className="ml-2 text-[var(--muted-foreground)]">
                                                · {line.priceText}
                                            </span>
                                        ) : null}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-2 flex items-center gap-2 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] pt-2">
                        <Link
                            href="/carrito"
                            className="flex-1 rounded-lg px-2 py-2 text-center text-sm font-semibold text-[var(--primary)] underline-offset-4 hover:bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] hover:underline"
                        >
                            Ver el carrito
                        </Link>
                        {cartLines.length > 0 && (
                            <button
                                type="button"
                                className="shrink-0 rounded-lg px-2 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--state-danger)_10%,transparent)] hover:text-[color-mix(in_oklab,var(--state-danger)_78%,var(--foreground))]"
                                onClick={() => {
                                    clearSoftwareCart();
                                    onClear();
                                }}
                                aria-label="Vaciar carrito"
                            >
                                Vaciar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
