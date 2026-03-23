import * as React from 'react';

import { cn } from '@/lib/utils';

type NeuButtonRaisedProps = React.ComponentProps<'button'>;

const NeuButtonRaised = React.forwardRef<HTMLButtonElement, NeuButtonRaisedProps>(
    ({ className, type = 'button', ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                className={cn(
                    'neumorph inline-flex items-center justify-center gap-2 rounded-xl border-0 px-4 py-2 text-[12px] font-semibold text-foreground transition-[box-shadow,transform,color] duration-200 hover:[box-shadow:var(--neu-raised-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                {...props}
            />
        );
    },
);

NeuButtonRaised.displayName = 'NeuButtonRaised';

export { NeuButtonRaised };
