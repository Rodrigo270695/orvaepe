export const PLAN_ORDER = ['free', 'basico', 'pro', 'experto'] as const;

export type TallerPlanCodigo = (typeof PLAN_ORDER)[number];

export const PLAN_META: Record<
    TallerPlanCodigo,
    {
        nombre: string;
        descripcion: string;
        badge: string | null;
        trial_days: number;
        highlights: string[];
    }
> = {
    free: {
        nombre: 'Gratis',
        descripcion: 'Para conocer el piso del taller sin compromiso.',
        badge: null,
        trial_days: 15,
        highlights: [
            'Todos los módulos incluidos',
            '1 sede · 2 usuarios',
            '100 clientes y vehículos',
            '50 productos',
            'Sin comprobantes SUNAT',
        ],
    },
    basico: {
        nombre: 'Básico',
        descripcion: 'Una sede que ya emite boleta.',
        badge: 'Más vendido',
        trial_days: 7,
        highlights: [
            'Todos los módulos incluidos',
            '1 sede · 5 usuarios',
            '1 000 clientes y vehículos',
            'Boleta electrónica SUNAT',
            '200 comprobantes / mes',
        ],
    },
    pro: {
        nombre: 'Pro',
        descripcion: 'Varias sedes y factura electrónica.',
        badge: 'Más popular',
        trial_days: 7,
        highlights: [
            'Todos los módulos incluidos',
            'Hasta 5 sedes · 20 usuarios',
            'Boleta y factura SUNAT',
            'Guías de remisión',
            '2 000 comprobantes / mes',
        ],
    },
    experto: {
        nombre: 'Experto',
        descripcion: 'El taller que ya factura fuerte.',
        badge: 'Más nuevo',
        trial_days: 7,
        highlights: [
            'Todos los módulos incluidos',
            'Varias sedes y más volumen',
            'Boleta, factura y guías',
            'Inventario y caja por sede',
            'WhatsApp y recordatorios',
        ],
    },
};

export const COMPARISON = [
    { label: 'Sedes', free: '1', basico: '1', pro: '5', experto: 'Varias' },
    { label: 'Usuarios', free: '2', basico: '5', pro: '20', experto: 'Más' },
    { label: 'Boleta SUNAT', free: 'No', basico: 'Sí', pro: 'Sí', experto: 'Sí' },
    { label: 'Factura SUNAT', free: 'No', basico: 'No', pro: 'Sí', experto: 'Sí' },
    { label: 'Guías de remisión', free: 'No', basico: 'No', pro: 'Sí', experto: 'Sí' },
    { label: 'Car wash', free: 'Sí', basico: 'Sí', pro: 'Sí', experto: 'Sí' },
    { label: 'WhatsApp', free: 'Sí', basico: 'Sí', pro: 'Sí', experto: 'Sí' },
];

export const SHIFT_STEPS = [
    {
        index: '01',
        title: 'Entra por placa',
        body: 'El cliente llega. Recibes el auto, abres la orden o el lavado y el historial ya está ahí.',
        image: '/images/tallersaas/recepcion.jpg',
        alt: 'Recepción del taller con la orden en tablet',
    },
    {
        index: '02',
        title: 'Se repara o se lava',
        body: 'La orden corre en el puesto. Si es car wash, el ticket comparte la misma caja.',
        image: '/images/tallersaas/lavado.jpg',
        alt: 'Bahía de lavado del taller',
    },
    {
        index: '03',
        title: 'WhatsApp avisa solo',
        body: 'Cita a 48 h y a 2 h. Cuando el auto está listo, el mensaje sale. Aceite y revisión también.',
        image: '/images/tallersaas/whatsapp.jpg',
        alt: 'Aviso de WhatsApp desde el taller',
    },
    {
        index: '04',
        title: 'Cobra y emite',
        body: 'Caja del turno, boleta o factura a SUNAT. El repuesto que se usó ya salió del stock.',
        image: '/images/tallersaas/caja.jpg',
        alt: 'Caja del taller con comprobante',
    },
] as const;

export const BAYS = [
    { code: 'B-01', title: 'Órdenes de trabajo', body: 'Recepción, diagnóstico, reparación y entrega. Todo por placa.' },
    { code: 'B-02', title: 'Presupuestos', body: 'El cliente ve el alcance y lo aprueba antes de que abras el capó.' },
    { code: 'B-03', title: 'Car wash', body: 'Ticket de lavado, servicios y cobro en la misma caja del taller.' },
    { code: 'B-04', title: 'Inventario', body: 'El repuesto que entra a la orden sale del stock. Compras y proveedores.' },
    { code: 'B-05', title: 'Caja y SUNAT', body: 'Turno, venta, boleta y factura electrónica. Series listas.' },
    { code: 'B-06', title: 'WhatsApp', body: 'Citas, auto listo, aceite y revisión. Sin copiar números a mano.' },
    { code: 'B-07', title: 'Aseguradoras', body: 'Siniestro, póliza e informe. El caso no vive en un chat suelto.' },
    { code: 'B-08', title: 'Portal por placa', body: 'El cliente consulta su auto sin pedirte captura de pantalla.' },
] as const;

export const FAQ = [
    {
        q: '¿Qué es TallerSaaS?',
        a: 'Es el sistema del taller mecánico en la nube: órdenes, lavado, inventario, WhatsApp, caja y comprobantes SUNAT. Cada taller entra por su subdominio.',
    },
    {
        q: '¿Sirve si también lavo autos?',
        a: 'Sí. Car wash abre su propio ticket y cobra en la misma caja. No es otro programa.',
    },
    {
        q: '¿Los recordatorios salen solos?',
        a: 'La cita se avisa 48 horas antes y otra vez 2 horas antes. También sale el recordatorio de cambio de aceite y de la próxima revisión.',
    },
    {
        q: '¿Emite a SUNAT?',
        a: 'Sí. Boleta desde Básico. Factura y guías desde Pro. Los precios en Orvae ya incluyen IGV.',
    },
    {
        q: '¿Cómo lo activo?',
        a: 'Eliges Gratis o un plan de pago en Orvae, confirmas y entras a tu subdominio a crear la contraseña. Hay demo pública para probar antes.',
    },
] as const;

export const DEMO_URL = 'https://demo.tallersaas.orvae.pe';
