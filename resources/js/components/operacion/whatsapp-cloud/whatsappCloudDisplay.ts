const STATUS_LABELS: Record<string, string> = {
    'status.sent': 'Enviado',
    'status.delivered': 'Entregado',
    'status.read': 'Leído',
    'status.failed': 'Falló',
};

const MESSAGE_LABELS: Record<string, string> = {
    text: 'texto',
    button: 'botón',
    interactive: 'interactivo',
    image: 'imagen',
    audio: 'audio',
    document: 'documento',
};

export function whatsappEventLabel(eventType: string): string {
    if (STATUS_LABELS[eventType]) {
        return STATUS_LABELS[eventType];
    }
    if (eventType.startsWith('message.')) {
        const kind = eventType.slice('message.'.length);
        return `Entrante · ${MESSAGE_LABELS[kind] ?? kind}`;
    }
    return eventType;
}

export function whatsappEventBadgeClass(eventType: string): string {
    switch (eventType) {
        case 'status.sent':
            return 'bg-[#4A80B8]/12 text-[#4A80B8]';
        case 'status.delivered':
            return 'bg-[#2E9C9C]/12 text-[#2E9C9C]';
        case 'status.read':
            return 'bg-[#4A9A72]/15 text-[#4A9A72]';
        case 'status.failed':
            return 'bg-[#C05050]/12 text-[#C05050]';
        default:
            return 'bg-[#8B5CF6]/12 text-[#8B5CF6]';
    }
}

export function productoLabel(producto: string | null | undefined): string {
    switch (producto) {
        case 'vetsaas':
            return 'VetSaaS';
        case 'tallersaas':
            return 'TallerSaaS';
        default:
            return producto ?? '—';
    }
}
