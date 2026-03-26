export type SoftwareModule = {
    name: string;
    description?: string;
};

export type SoftwarePricingPlan = {
    id: string;
    label: string;
    priceText: string;
    /** Precio numérico (catálogo admin) para carrito marketing */
    listPrice?: number;
    currency?: string;
    // Opcionales para mostrar descuentos (admin los puede controlar)
    priceBeforeText?: string;
    priceNowText?: string;
    priceBefore?: string | number;
    priceNow?: string | number;
    // Texto opcional para indicar si el plan es mensual, código fuente o por periodos.
    saleModelLabel?: string;
    saleModel?: 'codigo_fuente' | 'mensual' | 'periodos' | string;
    highlights: string[];
};

export type SoftwareSystem = {
    slug: string;
    categorySlug: string;
    name: string;
    shortDescription: string;
    description: string;
    /** Origen del detalle: sistemas propios vs servicios */
    revenueLine?: 'software_system' | 'service';
    /** Solo servicios: texto largo de alcance */
    alcance?: string | null;
    /** Solo servicios: SLA u oferta comercial */
    sla?: string | null;
    badges: string[];
    modules: SoftwareModule[];
    pricingPlans: SoftwarePricingPlan[];
    /** Presente cuando el sistema viene del catálogo admin */
    catalogProductId?: string;
    /** URL para la demo (viene de `specs.demo|specs.link|specs.url`). */
    demoUrl?: string | null;
    /** Usuario para la demo (viene de `specs.demo_user|specs.demo_username|specs.usuario|...`). */
    demoUser?: string | null;
    /** Contraseña para la demo (viene de `specs.demo_password|specs.demo_pass|specs.contraseña|...`). */
    demoPassword?: string | null;
    /** Lista de URLs para imágenes (viene de `specs.imagenes|image|img`). */
    images?: string[] | null;
    /**
     * Especificaciones adicionales agregadas por administración
     * (todas las keys de `specs` que no pertenecen al stack conocido).
     */
    extraSpecs?: Array<
        | { code: string; value: string }
        | { code: string; values: string[] }
    >;
    // Información opcional (se espera que venga desde administración/catálogo)
    howItWorksSteps?: string[];
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    baseDeDatos?: string[];
    // fallback para nombres si prefieren usar otro idioma
    tecnologias?: {
        languages?: string[];
        frameworks?: string[];
        databases?: string[];
        baseDeDatos?: string[];
    };
};

export type SoftwareCategory = {
    slug: string;
    title: string;
    description: string;
};

export const softwareCategories: SoftwareCategory[] = [
    {
        slug: 'contabilidad',
        title: 'Contabilidad',
        description: 'Libros, estados y control financiero para decisiones claras.',
    },
    {
        slug: 'ventas',
        title: 'Ventas',
        description: 'Gestión comercial para cotizar, vender y cerrar con orden.',
    },
    {
        slug: 'matriculas',
        title: 'Matrículas',
        description: 'Registro, pagos y control académico con trazabilidad.',
    },
    {
        slug: 'contratos',
        title: 'Contratos',
        description: 'Vigencias, renovaciones y plantillas para toda la operación.',
    },
    {
        slug: 'inventario',
        title: 'Inventario',
        description: 'Movimientos y control operativo de almacén y activos.',
    },
    {
        slug: 'reportes',
        title: 'Reportes',
        description: 'Tableros, mensajes y reportes para actuar rápido.',
    },
    {
        slug: 'veterinaria',
        title: 'Veterinaria',
        description: 'Agenda clínica e historial con operación ordenada.',
    },
    {
        slug: 'transporte',
        title: 'Transporte',
        description: 'Flota, solicitudes, viajes y cobros tipo marketplace.',
    },
    {
        slug: 'mensajeria',
        title: 'Mensajería',
        description: 'Envíos, seguimiento y operación por rutas.',
    },
];

export const softwareSystems: SoftwareSystem[] = [
    {
        slug: 'sistema-contable',
        categorySlug: 'contabilidad',
        name: 'Sistema Contable',
        shortDescription: 'Control financiero con estructura enterprise.',
        description:
            'Un sistema contable pensado para operar con claridad: registro, conciliación, estados y reportes para que tu equipo tome decisiones con datos.',
        badges: ['SaaS', 'Implementación rápida'],
        modules: [
            { name: 'Plan de cuentas' },
            { name: 'Libro diario y mayor' },
            { name: 'Estados financieros' },
            { name: 'Conciliación y control' },
            { name: 'Reportes exportables' },
        ],
        pricingPlans: [
            {
                id: 'starter',
                label: 'Starter',
                priceText: 'Cotización mensual',
                highlights: ['Setup base', 'Documentación', 'Soporte estándar'],
            },
            {
                id: 'pro',
                label: 'Pro',
                priceText: 'Cotización mensual',
                highlights: ['Automatizaciones', 'Reportes avanzados', 'Soporte prioritario'],
            },
            {
                id: 'enterprise',
                label: 'Enterprise',
                priceText: 'Cotización con implementación',
                highlights: ['Integraciones', 'Capacitación', 'SLA documentado'],
            },
        ],
    },
    {
        slug: 'sistema-ventas',
        categorySlug: 'ventas',
        name: 'Sistema de Ventas',
        shortDescription: 'Vende con control: cotiza, factura y cierra.',
        description:
            'Diseñado para equipos comerciales: desde cotizaciones y pedidos hasta facturación y control de operación.',
        badges: ['SaaS', 'Licencia', 'Módulos sueltos'],
        modules: [
            { name: 'Cotizaciones y pedidos' },
            { name: 'Clientes y segmentación' },
            { name: 'Facturación' },
            { name: 'Control de comisiones' },
            { name: 'Historial y trazabilidad' },
        ],
        pricingPlans: [
            {
                id: 'starter',
                label: 'Starter',
                priceText: 'Cotización mensual',
                highlights: ['Flujo base de ventas', 'Capacitación inicial', 'Documentación clara'],
            },
            {
                id: 'pro',
                label: 'Pro',
                priceText: 'Cotización mensual',
                highlights: ['Reportes y filtros', 'Automatizaciones', 'Soporte prioritario'],
            },
            {
                id: 'enterprise',
                label: 'Enterprise',
                priceText: 'Cotización con implementación',
                highlights: ['Integraciones', 'Gobernanza y roles', 'SLA documentado'],
            },
        ],
    },
    {
        slug: 'sistema-matriculas',
        categorySlug: 'matriculas',
        name: 'Sistema de Matrículas',
        shortDescription: 'Matriculación con control de pagos y reglas.',
        description:
            'Para academias y programas: matrículas, pagos, historial y operación trazable.',
        badges: ['SaaS', 'Operación por reglas'],
        modules: [
            { name: 'Registro de matrículas' },
            { name: 'Pagos y cuotas' },
            { name: 'Calendario operativo' },
            { name: 'Historial académico' },
            { name: 'Reportes por período' },
        ],
        pricingPlans: [
            {
                id: 'starter',
                label: 'Starter',
                priceText: 'Cotización mensual',
                highlights: ['Setup base', 'Documentación', 'Soporte estándar'],
            },
            {
                id: 'pro',
                label: 'Pro',
                priceText: 'Cotización mensual',
                highlights: ['Reglas de matrícula', 'Reportes', 'Capacitación'],
            },
            {
                id: 'enterprise',
                label: 'Enterprise',
                priceText: 'Cotización con implementación',
                highlights: ['Integraciones', 'Roles avanzados', 'SLA documentado'],
            },
        ],
    },
    {
        slug: 'sistema-contratos',
        categorySlug: 'contratos',
        name: 'Sistema de Contratos',
        shortDescription: 'Plantillas, vigencias y renovaciones sin perder control.',
        description:
            'Centraliza contratos y reglas: plantillas, vigencias, renovaciones y trazabilidad para toda la operación.',
        badges: ['SaaS', 'Gestión documental'],
        modules: [
            { name: 'Plantillas y generación' },
            { name: 'Vigencias y alertas' },
            { name: 'Renovaciones' },
            { name: 'Aprobaciones' },
            { name: 'Historial y auditoría' },
        ],
        pricingPlans: [
            {
                id: 'starter',
                label: 'Starter',
                priceText: 'Cotización mensual',
                highlights: ['Configuración base', 'Documentación clara', 'Soporte estándar'],
            },
            {
                id: 'pro',
                label: 'Pro',
                priceText: 'Cotización mensual',
                highlights: ['Flujos de aprobación', 'Alertas', 'Soporte prioritario'],
            },
            {
                id: 'enterprise',
                label: 'Enterprise',
                priceText: 'Cotización con implementación',
                highlights: ['Gobernanza', 'Integraciones', 'SLA documentado'],
            },
        ],
    },
    {
        slug: 'sistema-inventario',
        categorySlug: 'inventario',
        name: 'Sistema de Inventario',
        shortDescription: 'Movimientos, kardex y control operativo.',
        description:
            'Inventario para operar: control, trazabilidad y reportes para que el almacén no sea una caja negra.',
        badges: ['SaaS', 'Trazabilidad'],
        modules: [
            { name: 'Movimientos y kardex' },
            { name: 'Ajustes e inventario físico' },
            { name: 'Almacenes y ubicaciones' },
            { name: 'Entradas y salidas' },
            { name: 'Reportes de stock' },
        ],
        pricingPlans: [
            {
                id: 'starter',
                label: 'Starter',
                priceText: 'Cotización mensual',
                highlights: ['Flujo base', 'Documentación', 'Soporte estándar'],
            },
            {
                id: 'pro',
                label: 'Pro',
                priceText: 'Cotización mensual',
                highlights: ['Ubicaciones', 'Reportes avanzados', 'Automatizaciones'],
            },
            {
                id: 'enterprise',
                label: 'Enterprise',
                priceText: 'Cotización con implementación',
                highlights: ['Roles y seguridad', 'Integraciones', 'SLA documentado'],
            },
        ],
    },
    {
        slug: 'sistema-reportes',
        categorySlug: 'reportes',
        name: 'Sistema de Reportes',
        shortDescription: 'Reportes y mensajes para tomar decisiones.',
        description:
            'Un sistema para centralizar reportes y comunicaciones operativas: tableros, alertas y exportación.',
        badges: ['SaaS', 'Tableros'],
        modules: [
            { name: 'Tableros por área' },
            { name: 'Alertas y mensajes' },
            { name: 'Exportación' },
            { name: 'Filtros y métricas' },
            { name: 'Historial de reportes' },
        ],
        pricingPlans: [
            {
                id: 'starter',
                label: 'Starter',
                priceText: 'Cotización mensual',
                highlights: ['Tableros base', 'Documentación', 'Soporte estándar'],
            },
            {
                id: 'pro',
                label: 'Pro',
                priceText: 'Cotización mensual',
                highlights: ['Métricas avanzadas', 'Automatizaciones', 'Soporte prioritario'],
            },
            {
                id: 'enterprise',
                label: 'Enterprise',
                priceText: 'Cotización con implementación',
                highlights: ['Integraciones', 'Gobernanza', 'SLA documentado'],
            },
        ],
    },
    {
        slug: 'sistema-veterinaria',
        categorySlug: 'veterinaria',
        name: 'Sistema Veterinaria',
        shortDescription: 'Agenda y historial clínico con control operativo.',
        description:
            'Para clínicas y negocios veterinarios: agenda, historial y operación ordenada con trazabilidad.',
        badges: ['SaaS', 'Operación clínica'],
        modules: [
            { name: 'Agenda de atención' },
            { name: 'Historias clínicas' },
            { name: 'Tratamientos y notas' },
            { name: 'Inventario de insumos' },
            { name: 'Facturación y reportes' },
        ],
        pricingPlans: [
            {
                id: 'starter',
                label: 'Starter',
                priceText: 'Cotización mensual',
                highlights: ['Setup base', 'Documentación', 'Soporte estándar'],
            },
            {
                id: 'pro',
                label: 'Pro',
                priceText: 'Cotización mensual',
                highlights: ['Flujos clínicos', 'Reportes', 'Capacitación'],
            },
            {
                id: 'enterprise',
                label: 'Enterprise',
                priceText: 'Cotización con implementación',
                highlights: ['Roles', 'Integraciones', 'SLA documentado'],
            },
        ],
    },
    {
        slug: 'sistema-transporte',
        categorySlug: 'transporte',
        name: 'Sistema de Transporte',
        shortDescription: 'Tipo Uber: solicitudes, viajes y cobros.',
        description:
            'Operación para transporte bajo demanda: solicitudes, viajes, estados, cobros y control de negocio.',
        badges: ['SaaS', 'Mapas y operación'],
        modules: [
            { name: 'Solicitudes y estados' },
            { name: 'Viajes y rutas' },
            { name: 'Conductores y equipos' },
            { name: 'Cobros y costos' },
            { name: 'Reportes operativos' },
        ],
        pricingPlans: [
            {
                id: 'starter',
                label: 'Starter',
                priceText: 'Cotización mensual',
                highlights: ['Flujos base', 'Documentación', 'Soporte estándar'],
            },
            {
                id: 'pro',
                label: 'Pro',
                priceText: 'Cotización mensual',
                highlights: ['Automatizaciones', 'Reportes', 'Soporte prioritario'],
            },
            {
                id: 'enterprise',
                label: 'Enterprise',
                priceText: 'Cotización con implementación',
                highlights: ['Integraciones', 'Gobernanza', 'SLA documentado'],
            },
        ],
    },
    {
        slug: 'sistema-mensajeria',
        categorySlug: 'mensajeria',
        name: 'Sistema de Mensajería',
        shortDescription: 'Envíos, seguimiento y control operativo.',
        description:
            'Gestión de envíos y operaciones: seguimiento, rutas y reportes para entregas confiables.',
        badges: ['SaaS', 'Operación por rutas'],
        modules: [
            { name: 'Recepción y despacho' },
            { name: 'Seguimiento de envíos' },
            { name: 'Rutas y estados' },
            { name: 'Notificaciones' },
            { name: 'Reportes de desempeño' },
        ],
        pricingPlans: [
            {
                id: 'starter',
                label: 'Starter',
                priceText: 'Cotización mensual',
                highlights: ['Setup base', 'Documentación', 'Soporte estándar'],
            },
            {
                id: 'pro',
                label: 'Pro',
                priceText: 'Cotización mensual',
                highlights: ['Automatizaciones', 'Reportes', 'Soporte prioritario'],
            },
            {
                id: 'enterprise',
                label: 'Enterprise',
                priceText: 'Cotización con implementación',
                highlights: ['Integraciones', 'Gobernanza', 'SLA documentado'],
            },
        ],
    },
];

export function getSoftwareSystemBySlug(slug: string) {
    return softwareSystems.find((s) => s.slug === slug) ?? null;
}

export function getSoftwareCategoryBySlug(slug: string) {
    return softwareCategories.find((c) => c.slug === slug) ?? null;
}

export function getSystemsByCategory(categorySlug: string) {
    return softwareSystems.filter((s) => s.categorySlug === categorySlug);
}

