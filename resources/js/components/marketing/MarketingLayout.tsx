import type { ReactNode } from 'react';

import { Head } from '@inertiajs/react';

import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import MarketingUnifiedNavbar from './MarketingUnifiedNavbar';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';

type Props = {
    title: string;
    children: ReactNode;
};

export default function MarketingLayout({ title, children }: Props) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-background text-foreground">
                <MarketingUnifiedNavbar />
                {/* Espacio para que el contenido no quede bajo el navbar fijo (altura aprox. del navbar) */}
                <div className="h-16 shrink-0" aria-hidden />
                <AppearanceFloatingRailToggle />
                <main>{children}</main>
                <WelcomeFooter />
            </div>
        </>
    );
}

