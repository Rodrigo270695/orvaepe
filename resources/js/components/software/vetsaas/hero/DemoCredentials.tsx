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
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F6B52]">{label}</p>
            <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-[#C4E6D8] bg-white px-2.5 py-1.5">
                <code className="min-w-0 flex-1 truncate font-mono text-xs text-[#06241C]">
                    {visible ? value : '••••••••'}
                </code>
                {secret ? (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-[#1F6B52] transition-colors hover:bg-[#F3FBF7]"
                        aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                        {visible ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={() => void copy()}
                    className={[
                        'inline-flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-[#F3FBF7]',
                        copied ? 'text-[#008762]' : 'text-[#1F6B52]',
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
        <div
            className="vs-fade-up mt-6 max-w-xl rounded-2xl border border-[#99D2BC] border-l-[3px] border-l-[#006D55] bg-white/85 p-4 shadow-[0_20px_40px_-30px_rgba(0,109,85,0.6)] backdrop-blur"
            style={{ animationDelay: '0.55s' }}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-body text-[11px] font-bold uppercase tracking-[0.16em] text-[#006D55]">
                    Acceso demo
                </p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs font-semibold text-[#006D55] underline-offset-4 hover:underline"
                >
                    Abrir clínica de prueba →
                </a>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <CopyField label="Usuario" value={user} />
                <CopyField label="Contraseña" value={password} secret />
            </div>
            <p className="font-body mt-3 text-xs text-[#1F6B52]">Clínica de prueba con datos ficticios. Solo para probar.</p>
        </div>
    );
}
