import * as React from 'react';

import { Label } from '@/components/ui/label';

type Props = {
    htmlFor: string;
    required?: boolean;
    children: React.ReactNode;
};

export default function AdminUnderlineLabel({
    htmlFor,
    required,
    children,
}: Props) {
    return (
        <Label
            htmlFor={htmlFor}
            className="font-mono text-[9px] font-normal uppercase tracking-[0.14em] text-(--o-warm)"
        >
            {children}
            {required ? (
                <span className="ml-1 text-[11px] font-semibold leading-none text-[#C05050]">*</span>
            ) : null}
        </Label>
    );
}

