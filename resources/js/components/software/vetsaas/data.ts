export const HERO_FRAMES = [
    { src: '/images/vetsaas-hero-pets.webp', alt: 'Pacientes de una clínica veterinaria' },
    { src: '/images/vetsaas-consulta.webp', alt: 'Consulta veterinaria' },
    { src: '/images/vetsaas-grooming.webp', alt: 'Grooming en la clínica' },
    { src: '/images/vetsaas-recepcion.webp', alt: 'Recepción de la clínica' },
] as const;

export const DAY_STEPS = [
    {
        index: '01',
        title: 'Historia clínica',
        body: 'Ficha del paciente, vacunas, plan de tratamiento y el historial de cada consulta.',
        image: '/images/vetsaas-consulta.webp',
        alt: 'Consulta veterinaria en la sala de examen',
    },
    {
        index: '02',
        title: 'Agenda, grooming y hotel',
        body: 'Citas, peluquería y guardería en el mismo calendario. El recordatorio sale por WhatsApp.',
        image: '/images/vetsaas-grooming.webp',
        alt: 'Peluquería canina dentro de la clínica',
    },
    {
        index: '03',
        title: 'Caja y SUNAT',
        body: 'Cobras en recepción y emites el comprobante electrónico sin abrir otro sistema.',
        image: '/images/vetsaas-recepcion.webp',
        alt: 'Recepción de una clínica veterinaria',
    },
] as const;

export const CLINIC_MODULES = [
    { title: 'Historia clínica', body: 'Consultas, vacunas, plan de tratamiento y el historial completo del paciente.' },
    { title: 'Sala de espera', body: 'Ves quién llegó, en qué orden pasa y cuándo entra a consulta.' },
    { title: 'Agenda', body: 'Citas clínicas, grooming y hotel en un solo calendario por sede.' },
    { title: 'Grooming', body: 'Servicios, insumos, adelantos y el estado de cada mascota en peluquería.' },
    { title: 'Hotel y guardería', body: 'Estadías, diario de cuidado y cargos que pasan directo a caja.' },
    { title: 'Inventario', body: 'Medicinas, alimento y productos de petshop, con stock por sede.' },
    { title: 'Caja y SUNAT', body: 'Cobros, descuentos y comprobantes electrónicos desde la recepción.' },
    { title: 'WhatsApp', body: 'Recordatorios de citas y vacunas al celular del dueño.' },
] as const;

export const AI_FEATURES = [
    'Atiende los mensajes de citas y operación en el WhatsApp de tu veterinaria, de día y de noche.',
    'Avisa la cita 48 horas antes y otra vez 2 horas antes. Menos inasistencias.',
    'Recuerda vacunas a 7 días, cumpleaños de la mascota y avisa cuando el grooming está listo.',
    'No reemplaza al veterinario: agenda, informa y deja todo registrado en la ficha.',
] as const;

export type ChatMessage =
    | { from: 'owner' | 'ai'; text: string; time: string }
    | { from: 'system'; text: string };

export const CHAT: readonly ChatMessage[] = [
    { from: 'owner', text: 'Hola, ¿hay cita para vacunar a Luna mañana?', time: '09:12' },
    { from: 'ai', text: 'Hola. Mañana hay 10:30 am y 4:00 pm con la Dra. Ríos. ¿Cuál te reservo?', time: '09:12' },
    { from: 'owner', text: '4 pm, por favor.', time: '09:13' },
    { from: 'ai', text: 'Listo. Luna queda agendada mañana a las 4:00 pm. Te aviso 2 horas antes.', time: '09:13' },
    { from: 'system', text: 'Recordatorio automático programado · 48 h y 2 h antes' },
];

export const NOVELTIES = [
    { tag: 'Nuevo', title: 'Agenda unificada de servicios', body: 'Grooming y hotel en un calendario, aparte de citas clínicas.' },
    { tag: 'Mejora', title: 'Activación directa post-pago', body: 'Tras confirmar en Orvae entras a tu subdominio a crear tu contraseña.' },
    { tag: 'Integración', title: 'AlmaPet ID listo para clínicas', body: 'Identidad digital de mascotas: registro, búsqueda y certificado.' },
] as const;

export const FAQS = [
    {
        q: '¿Qué es VetSaaS?',
        a: 'Es el sistema de la clínica en la nube: historia clínica, sala de espera, agenda, grooming, hotel, inventario, caja y comprobantes SUNAT. Cada veterinaria entra por su propio subdominio.',
    },
    {
        q: '¿La inteligencia artificial responde en WhatsApp?',
        a: 'Sí. Un asistente de IA atiende el WhatsApp de la clínica: responde consultas de citas y operación, sin reemplazar el criterio del veterinario.',
    },
    {
        q: '¿Qué recordatorios salen solos?',
        a: 'La cita se avisa 48 horas antes y otra vez 2 horas antes. También puedes activar recordatorios de vacunas, cumpleaños de la mascota y el aviso de que el grooming está listo.',
    },
    {
        q: '¿Sirve para clínicas en Perú?',
        a: 'Sí. Emite comprobantes electrónicos SUNAT, cobra en soles y los datos de cada clínica quedan aislados de las demás.',
    },
    {
        q: '¿Grooming y hotel van en el mismo sistema?',
        a: 'Sí. Peluquería y guardería comparten calendario con las citas clínicas. Los cargos pasan a caja.',
    },
    {
        q: '¿Cómo lo activo?',
        a: 'Eliges Free o un plan de pago en Orvae, confirmas y entras a tu subdominio a crear la contraseña.',
    },
] as const;

export const PLAN_ORDER = ['free', 'starter', 'pro', 'clinica'] as const;
