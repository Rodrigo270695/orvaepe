import {
    AlertTriangle,
    Check,
    CheckCircle2,
    Copy,
    Inbox,
    MessageCircle,
    Tags,
    XCircle,
} from 'lucide-react';
import * as React from 'react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import type { WhatsappCloudStats } from '@/components/operacion/whatsapp-cloud/whatsappCloudTypes';

type Props = {
    stats: WhatsappCloudStats;
    webhookUrl: string;
};

export default function OperacionWhatsappCloudToolbar({
    stats,
    webhookUrl,
}: Props) {
    const [copied, setCopied] = React.useState(false);

    const copyUrl = () => {
        void navigator.clipboard?.writeText(webhookUrl).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <MessageCircle className="size-4 text-[#25A366]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">
                            Webhooks de WhatsApp Cloud API
                        </h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Estados (enviado, entregado, leído, falló) y
                            mensajes entrantes que Meta envía a ORVAE. Cada
                            evento se cruza con su mensaje y recordatorio.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={copyUrl}
                    title="Copiar URL del webhook"
                    className="neumorph-inset inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <span className="truncate">{webhookUrl}</span>
                    {copied ? (
                        <Check className="size-3.5 shrink-0 text-[#4A9A72]" />
                    ) : (
                        <Copy className="size-3.5 shrink-0" />
                    )}
                </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <Tags className="size-3.5" />
                    Eventos {stats.total}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    <CheckCircle2 className="size-3.5" />
                    Procesados {stats.procesados}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <Inbox className="size-3.5" />
                    Entrantes {stats.entrantes}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C05050]/12 px-2.5 py-1 text-xs text-[#C05050]">
                    <XCircle className="size-3.5" />
                    Envíos fallidos {stats.fallidos}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#B8860B]/12 px-2.5 py-1 text-xs text-[#D4A84B]">
                    <AlertTriangle className="size-3.5" />
                    Error al procesar {stats.con_error}
                </span>
            </div>
        </NeuCardRaised>
    );
}
