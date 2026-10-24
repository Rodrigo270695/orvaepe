import { ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Inputs con subrayado (login, registro, recuperar). */
export const authInputUnderlineClassName =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent py-3 pl-9 pr-3 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--auth-focus-border)] focus:outline-none transition-colors duration-150';

export const authPasswordUnderlineClassName =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent py-3 pl-9 pr-10 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--auth-focus-border)] focus:outline-none focus-visible:outline-none focus-visible:ring-0 transition-colors duration-150';

type AuthCardHeaderProps = {
    title: string;
    subtitle: string;
    icon?: LucideIcon;
    accent?: 'info' | 'success' | 'alert';
};

export function AuthOrvaeIconBadge({
    icon: Icon,
    accent = 'info',
}: {
    icon: LucideIcon;
    accent?: 'info' | 'success' | 'alert';
}) {
    const token =
        accent === 'success'
            ? 'var(--state-success)'
            : accent === 'alert'
              ? 'var(--state-alert)'
              : 'var(--state-info)';

    return (
        <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border"
            style={{
                borderColor: `color-mix(in oklab, ${token} 70%, var(--border))`,
                background: `linear-gradient(135deg, color-mix(in oklab, ${token} 46%, var(--auth-header-icon-bg)), color-mix(in oklab, var(--state-success) 34%, var(--auth-header-icon-bg)))`,
                boxShadow: `0 0 24px -4px color-mix(in oklab, ${token} 65%, transparent)`,
            }}
        >
            <Icon
                className="size-6"
                style={{
                    color: token,
                    filter: `drop-shadow(0 0 6px color-mix(in oklab, ${token} 60%, transparent))`,
                }}
            />
        </div>
    );
}

export function AuthOrvaeCardHeader({ title, subtitle, icon, accent = 'info' }: AuthCardHeaderProps) {
    return (
        <div className="flex flex-col gap-3">
            {icon ? <AuthOrvaeIconBadge icon={icon} accent={accent} /> : null}
            <div>
                <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">
                    {title}
                </h1>
                <p className="mt-0.5 font-[family-name:var(--font-body)] text-sm text-[var(--muted-foreground)]">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

export function AuthOrvaeGoogleDivider({ label = 'o' }: { label?: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--o-border2)]" />
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                {label}
            </span>
            <span className="h-px flex-1 bg-[var(--o-border2)]" />
        </div>
    );
}

export function AuthOrvaeSecureFooter() {
    return (
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-[var(--o-border2)] pt-6 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted-foreground)]">
            <ShieldCheck
                className="size-3.5"
                style={{
                    color: 'var(--state-info)',
                    filter: 'drop-shadow(0 0 4px color-mix(in oklab, var(--state-info) 62%, transparent))',
                }}
            />
            <span className="text-[color-mix(in_oklab,var(--state-info)_68%,var(--muted-foreground))]">
                Conexión segura
            </span>
            <span className="opacity-50">·</span>
            <span className="text-[color-mix(in_oklab,var(--state-success)_52%,var(--muted-foreground))]">
                ORVAE
            </span>
        </div>
    );
}

export function AuthOrvaeStatusBanner({
    children,
    tone = 'success',
}: {
    children: React.ReactNode;
    tone?: 'success' | 'danger';
}) {
    const token = tone === 'danger' ? 'var(--state-danger)' : 'var(--state-success)';

    return (
        <div
            className="rounded-sm border px-4 py-3 font-[family-name:var(--font-mono)] text-xs tracking-wide"
            style={{
                borderColor: `color-mix(in oklab, ${token} 35%, transparent)`,
                background: `color-mix(in oklab, ${token} 12%, transparent)`,
                color: token,
            }}
        >
            {children}
        </div>
    );
}
