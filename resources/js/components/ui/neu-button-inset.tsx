import * as React from 'react';

import { cn } from '@/lib/utils';

type NeuButtonInsetProps = React.ComponentProps<'button'>;

const NeuButtonInset = React.forwardRef<HTMLButtonElement, NeuButtonInsetProps>(
    ({ className, type = 'button', ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                className={cn(
                    'neumorph-inset rounded-xl border-0 px-4 py-2 text-[12px] font-medium text-muted-foreground transition-all duration-150 hover:text-foreground active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                {...props}
            />
        );
    },
);

NeuButtonInset.displayName = 'NeuButtonInset';

export { NeuButtonInset };
