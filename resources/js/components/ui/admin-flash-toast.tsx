import { Transition } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import * as React from 'react';

import { AdminToast, type AdminToastType } from '@/components/ui/admin-toast';

type FlashToast = {
    id?: string;
    type?: AdminToastType;
    title?: string;
    description?: string;
};

export default function AdminFlashToast() {
    const page = usePage();
    const flash = (page.props as Record<string, unknown>).flash as
        | { toast?: FlashToast }
        | undefined;
    const toast = flash?.toast;

    const [open, setOpen] = React.useState(Boolean(toast?.title));

    React.useEffect(() => {
        setOpen(Boolean(toast?.title));
    }, [toast?.id, toast?.type, toast?.title, toast?.description]);

    React.useEffect(() => {
        if (!open) return;
        const timer = window.setTimeout(() => setOpen(false), 2400);
        return () => window.clearTimeout(timer);
    }, [open]);

    if (!toast?.title) return null;

    return (
        <div className="admin-panel-shell">
            <div className="admin-toast-stack">
                <Transition
                    show={open}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-[-6px]"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-[-6px]"
                >
                    <AdminToast
                        key={toast.id ?? `${toast.type}-${toast.title}-${toast.description ?? ''}`}
                        type={toast.type ?? 'success'}
                        title={toast.title}
                        description={toast.description}
                    />
                </Transition>
            </div>
        </div>
    );
}
