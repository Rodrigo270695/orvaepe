export const DEMO = {
    url: 'https://demo.foodsaas.orvae.pe/login',
    user: 'demo@foodsaas.pe',
    password: 'demo1234',
} as const;

export const WHATSAPP_HREF =
    'https://wa.me/51976809804?text=' +
    encodeURIComponent('Hola ORVAE, quiero información de FoodSaaS para mi restaurante.');

export const COURSES = [
    {
        index: '01',
        name: 'Salón',
        detail: 'Mesas, cuentas y el pedido que sale de la mesa.',
        image: '/images/foodsaas/salon.jpg',
        imageAlt: 'Salón de un restaurante con mesas puestas',
    },
    {
        index: '02',
        name: 'Cocina',
        detail: 'La comanda llega sola. El plato se marca listo.',
        image: '/images/foodsaas/cocina.jpg',
        imageAlt: 'Pase de cocina con lomo saltado y ceviche',
    },
    {
        index: '03',
        name: 'Caja',
        detail: 'Turno, medios de pago y el ticket del día.',
        image: '/images/foodsaas/caja.jpg',
        imageAlt: 'Caja del restaurante con tablet, efectivo y tarjeta',
    },
    {
        index: '04',
        name: 'SUNAT',
        detail: 'Boleta o factura en el mismo cobro.',
        image: '',
        imageAlt: '',
    },
] as const;

export const MENU = [
    {
        course: 'El piso',
        items: [
            { name: 'Salón', note: 'Zonas, mesas libres, ocupadas o en cuenta. Unión de mesas.' },
            { name: 'Pedidos', note: 'Salón, para llevar o delivery. El estado viaja con el plato.' },
            { name: 'Cocina', note: 'Cola en vivo para el pase. Mesero y cocina en el celular.' },
            { name: 'Caja', note: 'Apertura, ventas del turno, efectivo, Yape y tarjeta.' },
        ],
    },
    {
        course: 'La carta',
        items: [
            { name: 'Carta', note: 'Categorías, precios y lo que hoy está en menú.' },
            { name: 'Recetas', note: 'El plato descuenta insumos. Ves el costo del plato.' },
            { name: 'Almacén', note: 'Stock, compras y lo que se está acabando.' },
            { name: 'Ofertas', note: 'Descuentos del local, no de una hoja aparte.' },
        ],
    },
    {
        course: 'La calle',
        items: [
            { name: 'Delivery', note: 'Pedidos en camino, por distrito, en el mismo sistema.' },
            { name: 'Reservas', note: 'La mesa de las 20:30 queda anotada.' },
            { name: 'Multi-sede', note: 'Cada local con su carta y su caja. Tú ves la casa.' },
            { name: 'Roles', note: 'Mesero, cocina, cajero y gerente ven lo suyo.' },
        ],
    },
] as const;

export const FAQ = [
    {
        q: '¿Qué es FoodSaaS?',
        a: 'Es el sistema del restaurante en la nube: salón, pedidos, cocina, caja, carta, almacén y comprobantes SUNAT. Cada local entra por su subdominio.',
    },
    {
        q: '¿Sirve para un restaurante en Perú?',
        a: 'Sí. Está pensado para restaurantes, bares y cocinas ocultas en Perú, con boleta y factura electrónica al cobrar.',
    },
    {
        q: '¿El mesero y la cocina usan el celular?',
        a: 'Sí. Salón y cocina funcionan como aplicación web en celular o tablet. No hace falta instalar un programa en cada caja.',
    },
    {
        q: '¿Todos los planes traen delivery y SUNAT?',
        a: 'El piso (salón, pedidos, cocina y caja) es la base. Delivery, reservas, WhatsApp y los comprobantes SUNAT dependen del plan que elijas.',
    },
    {
        q: '¿Cómo lo activo?',
        a: 'Eliges el plan en esta página, confirmas y entras al subdominio de tu restaurante a crear la contraseña.',
    },
    {
        q: '¿Hay demo?',
        a: 'Sí. Hay una demo pública con datos de ejemplo para recorrer salón, cocina y caja antes de activar.',
    },
] as const;
