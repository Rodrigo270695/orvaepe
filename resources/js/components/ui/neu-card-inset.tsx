import * as React from 'react';

import { cn } from '@/lib/utils';

type NeuCardInsetProps = React.ComponentProps<'div'>;

const NeuCardInset = React.forwardRef<HTMLDivElement, NeuCardInsetProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'neumorph-inset rounded-xl border-0 bg-transparent',
                    className,
                )}
                {...props}
            />
        );
    },
);

NeuCardInset.displayName = 'NeuCardInset';

export { NeuCardInset };
