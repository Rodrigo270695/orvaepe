import * as React from 'react';

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

export type AdminToastType = 'success' | 'warning' | 'error';

type Props = {
    type: AdminToastType;
    title: string;
    description?: string;
    className?: string;
};

function ToastIcon({ type }: { type: AdminToastType }) {
    if (type === 'success') {
        return <CheckCircle2 className="admin-toast-icon" />;
    }
    if (type === 'warning') {
        return <AlertTriangle className="admin-toast-icon" />;
    }

    return <XCircle className="admin-toast-icon" />;
}

export const AdminToast = React.forwardRef<HTMLDivElement, Props>(
    ({ type, title, description, className }: Props, ref) => {
        return (
            <div
                ref={ref}
                data-admin-toast
                data-type={type}
                className={cn(
                    // Sin bg-transparent: el fondo viene de .neumorph / .dark .neumorph (--neu-bg)
                    'admin-toast-item neumorph rounded-xl border-0',
                    className,
                )}
            >
                <ToastIcon type={type} />
                <div className="min-w-0">
                    <p className="admin-toast-title">{title}</p>
                    {description ? (
                        <p className="admin-toast-description">
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
        );
    },
);

AdminToast.displayName = 'AdminToast';

