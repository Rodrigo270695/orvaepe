export function activationActiveLabel(active: boolean): string {
    return active ? 'Activa' : 'Inactiva';
}

export function activationActiveBadgeClass(active: boolean): string {
    return active
        ? 'bg-[#4A9A72]/15 text-[#4A9A72]'
        : 'bg-[#C05050]/15 text-[#C05050]';
}
