import panel from '@/routes/panel';

/**
 * Secciones del panel administrativo (ruta nombrada `panel.section` / Wayfinder).
 * Una sola fuente de verdad para sidebar y página placeholder.
 */
export function panelPath(section: string): string {
    return panel.section.url(section);
}

/** Etiquetas para breadcrumb / título de página */
export const panelSectionLabels: Record<string, string> = {
    // Catálogo
    'catalogo-categorias': 'Categorías',
    'catalogo-productos': 'Productos',
    'catalogo-skus': 'SKUs y precios',
    'catalogo-cupones': 'Cupones',
    'catalogo-releases': 'Versiones y releases',
    // Ventas
    'ventas-ordenes': 'Órdenes',
    'ventas-pagos': 'Pagos',
    'ventas-facturas': 'Facturas',
    'ventas-suscripciones': 'Suscripciones',
    // Emisión (SUNAT)
    'sunat-emisor': 'Emisión SUNAT',
    'sunat-cert': 'Certificados',
    'sunat-setup': 'Setup SUNAT/OSE',
    'sunat-secuencias': 'Secuencias',
    'sunat-logs': 'Logs',
    'sunat-boleta-resumen': 'Resumen boletas',
    // Marketing — sitio público
    'marketing-vitrina': 'Vitrina de clientes',
    // Acceso — usuarios
    'acceso-clientes': 'Usuarios cliente',
    // Derechos
    'acceso-entitlements': 'Derechos de uso',
    'acceso-credenciales': 'Credenciales y API keys',
    'acceso-licencias': 'Licencias',
    'acceso-activaciones': 'Activaciones',
    'acceso-entregas-oem': 'Entregas OEM',
    // Operación
    'operacion-tickets': 'Tickets de soporte',
    'operacion-webhooks': 'Webhooks de pasarelas',
    'operacion-auditoria': 'Auditoría',
    // Informes
    'informes-resumen': 'Resumen comercial',
    'informes-lineas': 'Ingresos por línea de negocio',
};

export function panelSectionTitle(section: string): string {
    return panelSectionLabels[section] ?? 'Panel';
}
