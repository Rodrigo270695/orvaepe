const SAAS_COLORS: Record<string, string> = {
    vetsaas: '#0e9f8e',
    tallersaas: '#e8772e',
    aulavirtual: '#7c5cff',
    sendsaas: '#25a366',
    foodsaas: '#e04f5f',
};

export function saasColor(key: string): string {
    return SAAS_COLORS[key] ?? '#D28C3C';
}
