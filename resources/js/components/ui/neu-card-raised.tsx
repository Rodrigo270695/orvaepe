import * as React from 'react';

import { cn } from '@/lib/utils';

type NeuCardRaisedProps = React.ComponentProps<'div'>;

const NeuCardRaised = React.forwardRef<HTMLDivElement, NeuCardRaisedProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    // Sin bg-transparent: el fondo viene de .neumorph / .dark .neumorph (--neu-bg)
                    'neumorph rounded-xl border-0 transition-[box-shadow,transform] duration-200 hover:[box-shadow:var(--neu-raised-hover)] hover:-translate-y-px active:translate-y-0',
                    className,
                )}
                {...props}
            />
        );
    },
);

NeuCardRaised.displayName = 'NeuCardRaised';

export { NeuCardRaised };
