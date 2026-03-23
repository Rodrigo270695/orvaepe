import type { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

type Props = {
    heightPx: number;
    children: ReactNode;
};

/** Recharts necesita altura fija en el padre (flex). */
export function InformesResponsiveChart({ heightPx, children }: Props) {
    return (
        <div
            className="w-full min-w-0 shrink-0"
            style={{ height: heightPx, minHeight: heightPx }}
        >
            <ResponsiveContainer
                width="100%"
                height={heightPx}
                minWidth={0}
            >
                {children}
            </ResponsiveContainer>
        </div>
    );
}
