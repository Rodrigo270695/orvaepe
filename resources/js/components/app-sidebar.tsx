import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Barcode,
    Building2,
    CreditCard,
    GitBranch,
    FileSearch,
    KeyRound,
    LayoutGrid,
    LifeBuoy,
    ListChecks,
    Package,
    PlugZap,
    Receipt,
    ReceiptText,
    RefreshCcw,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    Tags,
    Ticket,
    TicketPercent,
    Truck,
    UserCheck,
    Users,
    Zap,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import {
    NavMainCollapsible,
    type NavSidebarSection,
} from '@/components/nav-main-collapsible';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { panelPath } from '@/config/admin-panel';
import { dashboard } from '@/routes';

/**
 * Menú compacto: acordeón (un solo desplegable abierto) sincronizado con la URL.
 */
const adminSections: NavSidebarSection[] = [
    {
        label: 'Inicio',
        topItems: [
            {
                title: 'Resumen',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
        groups: [],
    },
    {
        label: 'Marketing',
        groups: [
            {
                id: 'nav-marketing',
                title: 'Sitio web',
                icon: Sparkles,
                items: [
                    {
                        title: 'Vitrina clientes',
                        href: panelPath('marketing-vitrina'),
                        icon: Sparkles,
                    },
                ],
            },
        ],
    },
    {
        label: 'Catálogo',
        groups: [
            {
                id: 'nav-catalog',
                title: 'Productos',
                icon: Package,
                items: [
                    {
                        title: 'Categorías',
                        href: panelPath('catalogo-categorias'),
                        icon: Tags,
                    },
                    {
                        title: 'Productos',
                        href: panelPath('catalogo-productos'),
                        icon: Package,
                    },
                    { title: 'SKUs', href: panelPath('catalogo-skus'), icon: Barcode },
                    {
                        title: 'Cupones',
                        href: panelPath('catalogo-cupones'),
                        icon: TicketPercent,
                    },
                    {
                        title: 'Releases',
                        href: panelPath('catalogo-releases'),
                        icon: GitBranch,
                    },
                ],
            },
        ],
    },
    {
        label: 'Ventas',
        groups: [
            {
                id: 'nav-sales',
                title: 'Cobros',
                icon: ShoppingCart,
                items: [
                    {
                        title: 'Órdenes',
                        href: panelPath('ventas-ordenes'),
                        icon: ShoppingCart,
                    },
                    {
                        title: 'Pagos',
                        href: panelPath('ventas-pagos'),
                        icon: CreditCard,
                    },
                    {
                        title: 'Facturas',
                        href: panelPath('ventas-facturas'),
                        icon: ReceiptText,
                    },
                    {
                        title: 'Suscripciones',
                        href: panelPath('ventas-suscripciones'),
                        icon: RefreshCcw,
                    },
                ],
            },
        ],
    },
    {
        label: 'Emisión',
        groups: [
            {
                id: 'nav-sunat',
                title: 'SUNAT',
                icon: ReceiptText,
                items: [
                    {
                        title: 'Emisión SUNAT',
                        href: panelPath('sunat-emisor'),
                        icon: Building2,
                    },
                    {
                        title: 'Logs',
                        href: panelPath('sunat-logs'),
                        icon: FileSearch,
                    },
                    {
                        title: 'Resumen boletas',
                        href: panelPath('sunat-boleta-resumen'),
                        icon: Receipt,
                    },
                ],
            },
        ],
    },
    {
        label: 'Acceso',
        groups: [
            {
                id: 'nav-access-users',
                title: 'Usuarios',
                icon: Users,
                items: [
                    {
                        title: 'Clientes',
                        href: panelPath('acceso-clientes'),
                        icon: Users,
                    },
                ],
            },
            {
                id: 'nav-access',
                title: 'Licencias',
                icon: KeyRound,
                items: [
                    {
                        title: 'Entitlements',
                        href: panelPath('acceso-entitlements'),
                        icon: UserCheck,
                    },
                    {
                        title: 'API keys',
                        href: panelPath('acceso-credenciales'),
                        icon: KeyRound,
                    },
                    {
                        title: 'Lic. propias',
                        href: panelPath('acceso-licencias'),
                        icon: Package,
                    },
                    {
                        title: 'Activaciones',
                        href: panelPath('acceso-activaciones'),
                        icon: Zap,
                    },
                    {
                        title: 'OEM',
                        href: panelPath('acceso-entregas-oem'),
                        icon: Truck,
                    },
                ],
            },
        ],
    },
    {
        label: 'Ops',
        groups: [
            {
                id: 'nav-ops',
                title: 'Soporte',
                icon: LifeBuoy,
                items: [
                    { title: 'Tickets', href: panelPath('operacion-tickets'), icon: Ticket },
                    {
                        title: 'Webhooks',
                        href: panelPath('operacion-webhooks'),
                        icon: PlugZap,
                    },
                    {
                        title: 'Auditoría',
                        href: panelPath('operacion-auditoria'),
                        icon: ShieldCheck,
                    },
                ],
            },
        ],
    },
    {
        label: 'Informes',
        groups: [
            {
                id: 'nav-reports',
                title: 'Reportes',
                icon: BarChart3,
                items: [
                    {
                        title: 'Resumen',
                        href: panelPath('informes-resumen'),
                        icon: BarChart3,
                    },
                    {
                        title: 'Por línea',
                        href: panelPath('informes-lineas'),
                        icon: ListChecks,
                    },
                ],
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMainCollapsible sections={adminSections} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
