import * as React from 'react';

type Props = React.ComponentProps<'textarea'>;

export default function AdminUnderlineTextarea({
    className,
    ...props
}: Props) {
    return (
        <textarea
            {...props}
            className={[
                'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-3 pl-3 pr-3 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[var(--o-amber)]/60 transition-colors duration-150 resize-none',
                className ?? '',
            ].join(' ')}
        />
    );
}

