/**
 * Enlaces alineados con el menú marketing (navbar) para licencias y secciones de /servicios.
 *
 * @see MarketingUnifiedNavbar
 * @see App\Http\Controllers\Marketing\MarketingServicesController::SECTION_SLUG_ORDER
 */
export const marketingPreciosLinks = [
    { label: 'Más vendidos', href: '/licencias#oem-mas-vendidos' },
    { label: 'Antivirus', href: '/licencias#oem-antivirus-principales' },
    { label: 'Otros antivirus', href: '/licencias#oem-antivirus-otros' },
    { label: 'Visio / Project / más', href: '/licencias#oem-otros-productos' },
    { label: 'Office para Mac', href: '/licencias#oem-office-mac' },
    { label: 'Nuevos ingresos', href: '/licencias#oem-nuevos-ingresos' },
] as const;

export const marketingServiciosSectionLinks = [
    { label: 'Correos corporativos', href: '/servicios#svc-correos-corporativos' },
    { label: 'Integraciones', href: '/servicios#svc-integraciones' },
    { label: 'Despliegue y onboarding', href: '/servicios#svc-despliegue-onboarding' },
    { label: 'Capacitación', href: '/servicios#svc-capacitacion' },
] as const;
