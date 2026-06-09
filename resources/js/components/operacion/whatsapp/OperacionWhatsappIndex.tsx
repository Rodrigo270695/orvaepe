import { MessageCircle, Phone } from 'lucide-react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';

import type { WhatsAppApiRoutes, WhatsAppProps } from './types';
import { WhatsappConnectCard } from './WhatsappConnectCard';

type Props = {
    whatsapp: WhatsAppProps;
    apiRoutes: WhatsAppApiRoutes;
};

export default function OperacionWhatsappIndex({ whatsapp, apiRoutes }: Props) {
    return (
        <div className="space-y-6">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <MessageCircle className="size-4 text-[#D28C3C]" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold">WhatsApp / OpenWA</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Vincula el número de Orvae para enviar notificaciones
                                automáticas: nuevas compras, avisos admin y recordatorios.
                            </p>
                        </div>
                    </div>
                    {whatsapp.admin_notification_number ? (
                        <div className="inline-flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Phone className="size-3.5 text-[#D28C3C]" />
                            Alertas admin:{' '}
                            <span className="font-mono font-medium text-foreground">
                                {whatsapp.admin_notification_number}
                            </span>
                        </div>
                    ) : null}
                </div>
            </NeuCardRaised>

            <WhatsappConnectCard whatsapp={whatsapp} apiRoutes={apiRoutes} />

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    ¿Qué se envía por WhatsApp?
                </h2>
                <ul className="mt-3 space-y-2 text-[11px] text-muted-foreground">
                    <li>
                        <span className="font-medium text-foreground">Admin</span> — nueva
                        compra confirmada, suscripciones y licencias por vencer.
                    </li>
                    <li>
                        <span className="font-medium text-foreground">Cliente</span> — pago
                        confirmado (si tiene teléfono en su perfil).
                    </li>
                    <li>
                        Las alertas admin van al número configurado arriba si el superadmin no
                        tiene celular en la base de datos.
                    </li>
                </ul>
            </NeuCardRaised>
        </div>
    );
}
