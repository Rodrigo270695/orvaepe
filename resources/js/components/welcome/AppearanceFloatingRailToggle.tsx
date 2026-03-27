import { useEffect, useRef, useState } from 'react';

import { useAppearance } from '@/hooks/use-appearance';
import AppearanceDarkLightToggle from '@/components/appearance-dark-light-toggle';
import { Moon, Sun } from 'lucide-react';

/**
 * Mismo patrón en todas las pantallas: botón flotante abajo-izquierda
 * y pastilla horizontal (claro / sistema / oscuro) al expandir.
 */
export default function AppearanceFloatingRailToggle() {
    const { resolvedAppearance } = useAppearance();
    const [open, setOpen] = useState(false);
    const railRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) {
                return;
            }

            if (railRef.current && !railRef.current.contains(target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown, { passive: true });

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [open]);

    return (
        <div ref={railRef} className="fixed bottom-6 left-4 z-50">
            {open && (
                <div
                    className="fixed inset-0 z-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                    aria-hidden
                />
            )}

            <div className="relative z-10">
                <button
                    type="button"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color-mix(in_oklab,var(--o-amber)_35%,transparent)] bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] dark:border-[color-mix(in_oklab,var(--state-info)_45%,var(--o-amber))] dark:bg-[color-mix(in_oklab,var(--state-info)_32%,var(--background))] backdrop-blur shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_18px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--state-info)_35%,transparent),0_18px_50px_color-mix(in_oklab,var(--state-info)_30%,transparent)] cursor-pointer transition-colors hover:bg-[color-mix(in_oklab,var(--o-amber)_18%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_44%,var(--background))]"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-label="Cambiar modo de apariencia"
                >
                    {resolvedAppearance === 'dark' ? (
                        <Sun className="size-5 text-[var(--o-amber)] dark:text-[color-mix(in_oklab,var(--state-info)_75%,white)]" />
                    ) : (
                        <Moon className="size-5 text-[var(--o-amber)] dark:text-[color-mix(in_oklab,var(--state-info)_75%,white)]" />
                    )}
                </button>

                {open && (
                    <div className="absolute left-12 top-1/2 -translate-y-1/2">
                        <div className="h-10 w-[132px] overflow-visible rounded-2xl bg-transparent backdrop-blur shadow-[0_18px_50px_rgba(0,0,0,0.35)] p-1">
                            <AppearanceDarkLightToggle
                                variant="three"
                                orientation="horizontal"
                                onAfterSelect={() => setOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
