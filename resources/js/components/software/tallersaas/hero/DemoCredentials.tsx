import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type Props = {
    url: string;
    user: string;
    password: string;
};

function CopyField({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
    const [copied, setCopied] = useState(false);
    const [visible, setVisible] = useState(true);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--ts-muted)' }}>
                {label}
            </p>
            <div
                className="mt-1 flex items-center gap-1.5 rounded-md border px-2 py-1.5"
                style={{ borderColor: 'var(--ts-line)', background: 'var(--ts-surface)' }}
            >
                <code className="min-w-0 flex-1 truncate font-mono text-xs" style={{ color: 'var(--ts-ink-strong)' }}>
                    {visible ? value : '••••••••'}
                </code>
                {secret ? (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="inline-flex size-7 cursor-pointer items-center justify-center rounded-sm hover:opacity-80"
                        style={{ color: 'var(--ts-muted)' }}
                        aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                        {visible ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={() => void copy()}
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded-sm hover:opacity-80"
                    style={{ color: copied ? 'var(--ts-ember)' : 'var(--ts-muted)' }}
                    aria-label={`Copiar ${label.toLowerCase()}`}
                >
                    {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                </button>
            </div>
        </div>
    );
}

export default function DemoCredentials({ url, user, password }: Props) {
    return (
        <div
            className="ts-rise mt-6 max-w-lg rounded-md border p-3.5"
            style={{
                animationDelay: '0.34s',
                borderColor: 'var(--ts-line)',
                background: 'var(--ts-bg-alt)',
                borderLeft: '3px solid var(--ts-ember)',
            }}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--ts-ember)' }}>
                    Acceso demo
                </p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold underline-offset-4 hover:underline"
                    style={{ color: 'var(--ts-ember)' }}
                >
                    Abrir taller de prueba
                </a>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <CopyField label="Usuario" value={user} />
                <CopyField label="Contraseña" value={password} secret />
            </div>
            <p className="mt-3 text-[11px]" style={{ color: 'var(--ts-muted)' }}>
                Se reinicia cada noche a las 2:00. Solo para probar.
            </p>
        </div>
    );
}
