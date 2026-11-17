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
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fs-muted)]">{label}</p>
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-[var(--fs-rule)] bg-[var(--fs-paper)] px-2.5 py-1.5">
                <code className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--fs-ink)]">{visible ? value : '••••••••'}</code>
                {secret ? (
                    <button
                        type="button"
                        onClick={() => setVisible((value) => !value)}
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-[var(--fs-muted)] hover:bg-[var(--fs-paper-2)]"
                        aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                        {visible ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={() => void copy()}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-[var(--fs-wine)] hover:bg-[var(--fs-paper-2)]"
                    aria-label={copied ? `${label} copiado` : `Copiar ${label.toLowerCase()}`}
                >
                    {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                </button>
            </div>
        </div>
    );
}

export default function DemoCredentials({ url, user, password }: Props) {
    return (
        <div className="mt-8 max-w-xl rounded-2xl border border-[var(--fs-rule)] bg-[var(--fs-paper-2)] p-4 shadow-[0_18px_40px_-28px_rgba(58,0,28,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--fs-wine)]">Acceso demo</p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[var(--fs-wine)] underline-offset-4 hover:underline"
                >
                    Abrir restaurante de prueba
                </a>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <CopyField label="Usuario" value={user} />
                <CopyField label="Contraseña" value={password} secret />
            </div>
            <p className="mt-3 font-sans text-xs leading-relaxed text-[var(--fs-muted)]">
                Restaurante de prueba con datos ficticios. Solo para probar.
            </p>
        </div>
    );
}
