import { MessageCircle, Plus, Server } from 'lucide-react';
import { useState } from 'react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

import { OpenWaConfirmDialog } from './OpenWaConfirmDialog';
import { OpenWaLineCard } from './OpenWaLineCard';
import { OpenWaLineFormDialog } from './OpenWaLineFormDialog';
import { OpenWaLinkBoard } from './OpenWaLinkBoard';
import { OpenWaQrDialog } from './OpenWaQrDialog';
import { OpenWaTestMessageDialog } from './OpenWaTestMessageDialog';
import type { OpenWaLine, OpenWaPageProps } from './types';

type Confirm = { kind: 'logout' | 'delete'; line: OpenWaLine } | null;

export default function OperacionOpenWaIndex({
    configured,
    gatewayHost,
    products,
    lines,
    storeUrl,
}: OpenWaPageProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<OpenWaLine | null>(null);
    const [qrLine, setQrLine] = useState<OpenWaLine | null>(null);
    const [testLine, setTestLine] = useState<OpenWaLine | null>(null);
    const [confirm, setConfirm] = useState<Confirm>(null);

    const openForm = (line: OpenWaLine | null) => {
        setEditing(line);
        setFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                        <MessageCircle
                            className="mt-0.5 size-4 shrink-0 text-[#D28C3C]"
                            aria-hidden
                        />
                        <div>
                            <h1 className="text-sm font-bold">
                                OpenWA · Líneas de WhatsApp
                            </h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Vincula los números de ORVAE escaneando el QR
                                desde aquí y define qué SaaS atiende cada uno.
                                Las notificaciones de ORVAE (accesos, pagos,
                                vencimientos y alertas admin) salen por la línea
                                marcada como «Notificaciones».
                            </p>
                            {gatewayHost ? (
                                <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <Server className="size-3.5" aria-hidden />
                                    Gateway:{' '}
                                    <span className="font-mono text-foreground">
                                        {gatewayHost}
                                    </span>
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <NeuButtonRaised
                        type="button"
                        onClick={() => openForm(null)}
                        className="self-start"
                    >
                        <Plus className="size-4" aria-hidden /> Nueva línea
                    </NeuButtonRaised>
                </div>
            </NeuCardRaised>

            {!configured ? (
                <NeuCardRaised className="rounded-xl border border-dashed p-4 md:p-5">
                    <h2 className="text-sm font-bold">
                        OpenWA de ORVAE no está configurado
                    </h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Define{' '}
                        <span className="font-mono">
                            ORVAE_OPENWA_ENABLED=true
                        </span>
                        , <span className="font-mono">ORVAE_OPENWA_URL</span> y{' '}
                        <span className="font-mono">ORVAE_OPENWA_API_KEY</span>{' '}
                        en el .env del servidor y ejecuta{' '}
                        <span className="font-mono">
                            php artisan config:clear
                        </span>
                        .
                    </p>
                </NeuCardRaised>
            ) : null}

            {lines.length === 0 ? (
                <NeuCardRaised className="rounded-xl p-8 text-center">
                    <p className="text-sm font-bold">Aún no hay líneas</p>
                    <p className="mx-auto mt-1 max-w-sm text-[11px] text-muted-foreground">
                        Crea la primera (por ejemplo «ORVAE Ventas»), vincúlala
                        con el QR y luego conéctala con los SaaS que atiende.
                    </p>
                    <NeuButtonRaised
                        type="button"
                        onClick={() => openForm(null)}
                        className="mt-4"
                    >
                        <Plus className="size-4" aria-hidden /> Crear línea
                    </NeuButtonRaised>
                </NeuCardRaised>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {lines.map((line) => (
                        <OpenWaLineCard
                            key={line.id}
                            line={line}
                            products={products}
                            configured={configured}
                            onLink={() => setQrLine(line)}
                            onTest={() => setTestLine(line)}
                            onEdit={() => openForm(line)}
                            onLogout={() =>
                                setConfirm({ kind: 'logout', line })
                            }
                            onDelete={() =>
                                setConfirm({ kind: 'delete', line })
                            }
                        />
                    ))}
                </div>
            )}

            <OpenWaLinkBoard lines={lines} products={products} />

            <OpenWaLineFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                line={editing}
                storeUrl={storeUrl}
            />

            <OpenWaQrDialog
                line={qrLine}
                onOpenChange={(open) => !open && setQrLine(null)}
            />

            {testLine ? (
                <OpenWaTestMessageDialog
                    key={testLine.id}
                    open
                    onOpenChange={(open) => !open && setTestLine(null)}
                    defaultPhone={testLine.phone}
                    testUrl={testLine.routes.test}
                />
            ) : null}

            {confirm ? (
                <OpenWaConfirmDialog
                    open
                    onOpenChange={(open) => !open && setConfirm(null)}
                    title={
                        confirm.kind === 'logout'
                            ? `Desvincular ${confirm.line.nombre}`
                            : `Eliminar ${confirm.line.nombre}`
                    }
                    description={
                        confirm.kind === 'logout'
                            ? 'Se cerrará la sesión de WhatsApp en OpenWA y el dispositivo saldrá de «Dispositivos vinculados». Para volver a usarla tendrás que escanear el QR.'
                            : 'Se borrará la línea en ORVAE y su sesión en OpenWA. El número dejará de recibir y enviar mensajes por esta vía.'
                    }
                    confirmLabel={
                        confirm.kind === 'logout' ? 'Desvincular' : 'Eliminar'
                    }
                    url={
                        confirm.kind === 'logout'
                            ? confirm.line.routes.logout
                            : confirm.line.routes.destroy
                    }
                    method={confirm.kind === 'logout' ? 'post' : 'delete'}
                />
            ) : null}
        </div>
    );
}
