import { Link, router } from '@inertiajs/react';
import { LogOut, Receipt, Shield, User as UserIcon } from 'lucide-react';

import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import type { User } from '@/types';

type Props = {
    user: User;
    onNavigate?: () => void;
};

export function ClientUserMenuContent({ user, onNavigate }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        onNavigate?.();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        href="/cliente/perfil"
                        prefetch
                        className="block w-full cursor-pointer"
                        onClick={() => {
                            cleanup();
                            onNavigate?.();
                        }}
                    >
                        <UserIcon className="mr-2" />
                        Mi perfil
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/cliente/facturacion"
                        prefetch
                        className="block w-full cursor-pointer"
                        onClick={() => {
                            cleanup();
                            onNavigate?.();
                        }}
                    >
                        <Receipt className="mr-2" />
                        Datos de facturación
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/cliente/seguridad"
                        prefetch
                        className="block w-full cursor-pointer"
                        onClick={() => {
                            cleanup();
                            onNavigate?.();
                        }}
                    >
                        <Shield className="mr-2" />
                        Seguridad
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    href={logout()}
                    as="button"
                    className="block w-full cursor-pointer"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Cerrar sesión
                </Link>
            </DropdownMenuItem>
        </>
    );
}
