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
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] vs-text-muted">{label}</p>
            <div className="vs-demo-field">
                <code className="min-w-0 flex-1 truncate font-mono text-xs">
                    {visible ? value : '••••••••'}
                </code>
                {secret ? (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="vs-demo-field-btn inline-flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors"
                        aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                        {visible ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={() => void copy()}
                    className={[
                        'vs-demo-field-btn inline-flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors',
                        copied ? 'vs-text-accent' : '',
                    ].join(' ')}
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
        <div className="vs-fade-up vs-surface-glass mt-6 max-w-xl p-4" style={{ animationDelay: '0.55s' }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-body text-[11px] font-bold uppercase tracking-[0.16em] vs-text-accent-strong">
                    Acceso demo
                </p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs font-semibold vs-text-accent-strong underline-offset-4 hover:underline"
                >
                    Abrir clínica de prueba →
                </a>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <CopyField label="Usuario" value={user} />
                <CopyField label="Contraseña" value={password} secret />
            </div>
            <p className="font-body mt-3 text-xs vs-text-muted">Clínica de prueba con datos ficticios. Solo para probar.</p>
        </div>
    );
}
