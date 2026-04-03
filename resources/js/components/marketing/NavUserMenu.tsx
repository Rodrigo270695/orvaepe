import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

type Props = {
    user: { name: string };
    open: boolean;
    onOpenChange: (open: boolean) => void;
    closeAll: () => void;
};

function getUserDisplayName(name?: string | null) {
    if (!name) return { short: 'Cuenta', full: 'Cuenta' };
    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean) return { short: 'Cuenta', full: 'Cuenta' };
    const parts = clean.split(' ');
    return { short: parts.slice(0, 2).join(' '), full: clean };
}

export default function NavUserMenu({ user, open, onOpenChange, closeAll }: Props) {
    const userDisplay = getUserDisplayName(user.name);

    return (
        <div className="relative">
            <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[color-mix(in_oklab,var(--state-info)_48%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)]"
                aria-label={`Cuenta de ${userDisplay.full}`}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => onOpenChange(!open)}
            >
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--state-info)_18%,transparent)] text-xs font-bold text-[var(--state-info)]">
                    {userDisplay.short
                        .split(' ')
                        .map((p) => p.charAt(0).toUpperCase())
                        .join('')
                        .slice(0, 2)}
                </span>
                <span className="max-w-[10rem] truncate">{userDisplay.short}</span>
                <ChevronDown className="size-4 text-[var(--state-info)]" />
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full z-[70] w-64 pt-2"
                    role="menu"
                    aria-label="Menú de usuario"
                >
                    <div className="rounded-2xl border border-[var(--border)] bg-card/95 p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md">
                        <div
                            className="rounded-2xl border p-2 shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--state-info)_35%,transparent)] backdrop-blur-md"
                            style={{
                                borderColor: 'color-mix(in oklab, var(--state-info) 28%, var(--border))',
                                background:
                                    'linear-gradient(165deg, color-mix(in oklab, var(--card) 96%, transparent), color-mix(in oklab, var(--state-info) 8%, var(--card)), color-mix(in oklab, var(--state-success) 6%, var(--card)))',
                            }}
                        >
                            <div
                                className="rounded-xl border px-3 py-2.5"
                                style={{
                                    borderColor: 'color-mix(in oklab, var(--state-info) 22%, var(--border))',
                                    background:
                                        'linear-gradient(135deg, color-mix(in oklab, var(--state-info) 14%, transparent), color-mix(in oklab, var(--state-success) 8%, transparent))',
                                }}
                            >
                                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                                    {userDisplay.short}
                                </p>
                                <p className="truncate text-xs text-[var(--muted-foreground)]">Sesión activa</p>
                            </div>
                            <div className="mt-2 space-y-1">
                                <Link
                                    href="/dashboard"
                                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--state-info)_14%,transparent)] hover:text-[color-mix(in_oklab,var(--state-info)_75%,var(--foreground))]"
                                    onClick={() => { closeAll(); onOpenChange(false); }}
                                >
                                    Ir al panel
                                </Link>
                                <Link
                                    href="/logout"
                                    as="button"
                                    method="post"
                                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--state-danger)_12%,transparent)] hover:text-[color-mix(in_oklab,var(--state-danger)_78%,var(--foreground))]"
                                    onClick={() => { closeAll(); onOpenChange(false); }}
                                >
                                    Cerrar sesión
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
