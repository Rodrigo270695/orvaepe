import * as React from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    contentClassName?: string;
    children: React.ReactNode;
    /**
     * Ancho del modal:
     * - `default`: max-w-md
     * - `wide`: max ancho tipo pantalla (min(90vw, 64rem))
     */
    width?: 'default' | 'wide';
};

export default function AdminModalShell({
    open,
    onOpenChange,
    title,
    description,
    contentClassName,
    children,
    width = 'default',
}: Props) {
    const handleClose = () => onOpenChange(false);

    const style =
        width === 'wide'
            ? { maxWidth: 'min(90vw, 64rem)', width: '90vw' }
            : undefined;

    return (
        <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
            <DialogContent
                className={cn(
                    'gap-0 p-0 max-h-[90vh] flex flex-col max-w-md border-0 shadow-none ring-0',
                    // para permitir que el modal no se “pase” del viewport
                    'w-[calc(100vw-2rem)]',
                    width === 'wide' ? 'max-w-none' : '',
                )}
                style={style}
                onPointerDownOutside={(event) => event.preventDefault()}
            >
                <DialogHeader className="shrink-0 px-6 py-4">
                    <DialogTitle className="text-base font-semibold">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {description ?? 'Contenido del diálogo'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-border shrink-0" />
                <div
                    className={cn(
                        'min-h-0 flex-1 overflow-y-auto px-6 py-4',
                        contentClassName,
                    )}
                >
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}

