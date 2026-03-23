import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceDarkLightToggle({
    className,
    variant = 'two',
    orientation = 'horizontal',
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    variant?: 'two' | 'three';
    orientation?: 'horizontal' | 'vertical';
}) {
    const { appearance, resolvedAppearance, updateAppearance } = useAppearance();

    const isLight = appearance === 'light' || (variant === 'two' && resolvedAppearance === 'light');
    const isDark = appearance === 'dark' || (variant === 'two' && resolvedAppearance === 'dark');
    const isSystem = appearance === 'system';

    if (variant === 'three') {
        const activeIndex = appearance === 'light' ? 0 : appearance === 'system' ? 1 : 2;

        if (orientation === 'vertical') {
            return (
                <div
                    className={cn(
                        'relative flex h-full w-10 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-background/60 p-0 shadow-[0_0_0_1px_rgba(0,0,0,0.02)] backdrop-blur',
                        className ?? '',
                    )}
                    {...props}
                >
                    <button
                        type="button"
                        onClick={() => updateAppearance('light')}
                        aria-pressed={appearance === 'light'}
                        className={cn(
                            'relative z-10 flex h-1/3 w-full cursor-pointer items-center justify-center rounded-none transition-all',
                            appearance === 'light'
                                ? 'bg-[color-mix(in_oklab,var(--o-amber)_16%,transparent)] text-[var(--o-amber)]'
                                : 'text-[var(--muted-foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] hover:text-[var(--foreground)]',
                        )}
                        aria-label="Modo claro (sistema)"
                    >
                        <Sun className="size-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => updateAppearance('system')}
                        aria-pressed={appearance === 'system'}
                        className={cn(
                            'relative z-10 flex h-1/3 w-full cursor-pointer items-center justify-center rounded-none transition-all border-t border-[color-mix(in_oklab,var(--o-amber)_18%,transparent)]',
                            appearance === 'system'
                                ? 'bg-[color-mix(in_oklab,var(--o-amber)_16%,transparent)] text-[var(--o-amber)]'
                                : 'text-[var(--muted-foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] hover:text-[var(--foreground)]',
                        )}
                        aria-label="Modo sistema"
                    >
                        <Monitor className="size-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => updateAppearance('dark')}
                        aria-pressed={appearance === 'dark'}
                        className={cn(
                            'relative z-10 flex h-1/3 w-full cursor-pointer items-center justify-center rounded-none transition-all border-t border-[color-mix(in_oklab,var(--o-amber)_18%,transparent)]',
                            appearance === 'dark'
                                ? 'bg-[color-mix(in_oklab,var(--o-amber)_16%,transparent)] text-[var(--o-amber)]'
                                : 'text-[var(--muted-foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] hover:text-[var(--foreground)]',
                        )}
                        aria-label="Modo oscuro (sistema)"
                    >
                        <Moon className="size-5" />
                    </button>
                </div>
            );
        }

        // horizontal (three)
        return (
            <div
                className={cn(
                    'relative inline-flex h-10 w-[132px] items-center justify-center gap-1 overflow-hidden rounded-lg border border-[var(--border)] bg-background/60 p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.02)] backdrop-blur',
                    className ?? '',
                )}
                {...props}
            >
                <div
                    className={cn(
                        'absolute inset-y-1 left-0 w-1/3 rounded-md bg-[color-mix(in_oklab,var(--o-amber)_18%,transparent)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--o-amber)_35%,transparent),0_8px_20px_rgba(0,0,0,0.06)] transition-transform duration-300',
                    )}
                    style={{ transform: `translateX(${activeIndex * 100}%)` }}
                />

                <button
                    type="button"
                    onClick={() => updateAppearance('light')}
                    aria-pressed={appearance === 'light'}
                    className={cn(
                        'relative z-10 inline-flex h-full w-1/3 cursor-pointer items-center justify-center rounded-md transition-all',
                        appearance === 'light'
                            ? 'text-[var(--o-amber)]'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                    )}
                    aria-label="Modo claro"
                >
                    <Sun className="size-5 transition-transform duration-200 group-hover:scale-[1.05]" />
                </button>

                <button
                    type="button"
                    onClick={() => updateAppearance('system')}
                    aria-pressed={appearance === 'system'}
                    className={cn(
                        'relative z-10 inline-flex h-full w-1/3 cursor-pointer items-center justify-center rounded-md transition-all',
                        appearance === 'system'
                            ? 'text-[var(--o-amber)]'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                    )}
                    aria-label="Modo sistema"
                >
                    <Monitor className="size-5 transition-transform duration-200 group-hover:scale-[1.05]" />
                </button>

                <button
                    type="button"
                    onClick={() => updateAppearance('dark')}
                    aria-pressed={appearance === 'dark'}
                    className={cn(
                        'relative z-10 inline-flex h-full w-1/3 cursor-pointer items-center justify-center rounded-md transition-all',
                        appearance === 'dark'
                            ? 'text-[var(--o-amber)]'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                    )}
                    aria-label="Modo oscuro"
                >
                    <Moon className="size-5 transition-transform duration-200 group-hover:scale-[1.05]" />
                </button>
            </div>
        );
    }

    // two variant (light/dark only)
    if (orientation === 'vertical') {
        return (
            <div
                className={cn(
                    'relative flex h-full w-10 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-background/60 p-0 shadow-[0_0_0_1px_rgba(0,0,0,0.02)] backdrop-blur',
                    className ?? '',
                )}
                {...props}
            >
                <button
                    type="button"
                    onClick={() => updateAppearance('light')}
                    aria-pressed={isLight}
                    className={cn(
                        'relative z-10 flex h-1/2 w-full cursor-pointer items-center justify-center rounded-none transition-all',
                        isLight
                            ? 'bg-[color-mix(in_oklab,var(--o-amber)_16%,transparent)] text-[var(--o-amber)]'
                            : 'text-[var(--muted-foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] hover:text-[var(--foreground)]',
                    )}
                    aria-label="Modo claro"
                >
                    <Sun className="size-5 transition-transform duration-200" />
                </button>

                <button
                    type="button"
                    onClick={() => updateAppearance('dark')}
                    aria-pressed={isDark}
                    className={cn(
                        'relative z-10 flex h-1/2 w-full cursor-pointer items-center justify-center rounded-none transition-all',
                        'border-t border-[color-mix(in_oklab,var(--o-amber)_18%,transparent)]',
                        isDark
                            ? 'bg-[color-mix(in_oklab,var(--o-amber)_16%,transparent)] text-[var(--o-amber)]'
                            : 'text-[var(--muted-foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] hover:text-[var(--foreground)]',
                    )}
                    aria-label="Modo oscuro"
                >
                    <Moon className="size-5 transition-transform duration-200" />
                </button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative inline-flex h-10 w-[72px] items-center justify-center gap-1 overflow-hidden rounded-lg border border-[var(--border)] bg-background/60 p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.02)] backdrop-blur',
                className ?? '',
            )}
            {...props}
        >
            <div
                className={cn(
                    'absolute inset-y-1 left-0 w-1/2 rounded-md bg-[color-mix(in_oklab,var(--o-amber)_18%,transparent)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--o-amber)_35%,transparent),0_8px_20px_rgba(0,0,0,0.06)] transition-transform duration-300',
                    isDark ? 'translate-x-full' : 'translate-x-0',
                )}
            />

            <button
                type="button"
                onClick={() => updateAppearance('light')}
                aria-pressed={isLight}
                className={cn(
                    'relative z-10 inline-flex h-full w-1/2 cursor-pointer items-center justify-center rounded-md transition-all',
                    isLight
                        ? 'text-[var(--o-amber)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                )}
                aria-label="Modo claro"
            >
                <Sun
                    className="size-5 transition-transform duration-200 group-hover:scale-[1.05] dark:group-hover:scale-[1.05]"
                />
                <span className="sr-only">Claro</span>
            </button>

            <button
                type="button"
                onClick={() => updateAppearance('dark')}
                aria-pressed={isDark}
                className={cn(
                    'relative z-10 inline-flex h-full w-1/2 cursor-pointer items-center justify-center rounded-md transition-all',
                    isDark
                        ? 'text-[var(--o-amber)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                )}
                aria-label="Modo oscuro"
            >
                <Moon
                    className="size-5 transition-transform duration-200 group-hover:scale-[1.05]"
                />
                <span className="sr-only">Oscuro</span>
            </button>
        </div>
    );
}

