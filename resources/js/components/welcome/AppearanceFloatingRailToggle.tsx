import { useEffect, useRef, useState } from 'react';

import { useAppearance } from '@/hooks/use-appearance';
import { useIsMobile } from '@/hooks/use-mobile';
import AppearanceDarkLightToggle from '@/components/appearance-dark-light-toggle';
import { Moon, Sun } from 'lucide-react';

export default function AppearanceFloatingRailToggle() {
    const isMobile = useIsMobile();
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

    if (isMobile) {
        return (
            <div className="fixed bottom-6 left-4 z-50">
                {open && (
                    <div
                        className="fixed inset-0 z-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                )}

                <div className="relative z-10">
                    <button
                        type="button"
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color-mix(in_oklab,var(--o-amber)_35%,transparent)] bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] backdrop-blur shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_18px_50px_rgba(0,0,0,0.25)] cursor-pointer transition-colors hover:bg-[color-mix(in_oklab,var(--o-amber)_18%,transparent)]"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Cambiar modo de apariencia"
                    >
                        {resolvedAppearance === 'dark' ? (
                            <Sun className="size-5 text-[var(--o-amber)]" />
                        ) : (
                            <Moon className="size-5 text-[var(--o-amber)]" />
                        )}
                    </button>

                    {open && (
                        <div className="absolute left-12 top-1/2 -translate-y-1/2">
                            <div className="h-10 w-[132px] overflow-visible rounded-2xl bg-transparent backdrop-blur shadow-[0_18px_50px_rgba(0,0,0,0.35)] p-1">
                                <AppearanceDarkLightToggle
                                    variant="three"
                                    orientation="horizontal"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed left-4 top-1/2 z-50 -translate-y-1/2">
            <div
                ref={railRef}
                className={[
                    'group relative flex h-40 w-10 items-center justify-start overflow-visible',
                    'transition-[width] duration-300',
                    open ? 'w-16' : 'w-10',
                ].join(' ')}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                aria-label="Cambiar modo de apariencia"
                onClick={() => setOpen((v) => !v)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpen((v) => !v);
                    }
                }}
            >
                {/* Línea visible (compacta) */}
                <div
                    className="absolute left-1/2 top-1/2 h-20 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-[color-mix(in_oklab,var(--o-amber)_12%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--o-amber)_28%,transparent)] shadow-[0_0_18px_rgba(245,176,3,0.16)] transition-opacity duration-200"
                    style={{ opacity: open ? 0 : 1 }}
                />
                <div
                    className="absolute left-1/2 top-1/2 h-20 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-[color-mix(in_oklab,var(--o-amber)_78%,transparent)] shadow-[0_0_20px_rgba(245,176,3,0.25)] transition-opacity duration-200"
                    style={{ opacity: open ? 0 : 1 }}
                />

                {/* Panel: no recortar para que se vean los botones */}
                <div
                    className={[
                        'absolute left-3 top-1/2 -translate-y-1/2',
                        'h-10',
                        'transition-opacity duration-200',
                        open ? 'opacity-100' : 'opacity-0 pointer-events-none',
                    ].join(' ')}
                >
                    <div className="h-full w-[132px] overflow-visible rounded-xl bg-background/20 backdrop-blur shadow-[0_18px_40px_rgba(0,0,0,0.18)] p-1">
                        <AppearanceDarkLightToggle
                            variant="three"
                            orientation="horizontal"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

