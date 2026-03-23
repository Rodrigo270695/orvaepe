import { Ban, CircleCheck, Clock3, FileEdit } from 'lucide-react';

import {
    licenseKeyStatusBadgeClass,
    licenseKeyStatusLabel,
} from '@/components/acceso/licencias/licenseKeyDisplay';

type Props = {
    status: string;
};

export default function LicenseKeyStatusBadge({ status }: Props) {
    const Icon =
        status === 'draft'
            ? FileEdit
            : status === 'active'
              ? CircleCheck
              : status === 'expired'
                ? Clock3
                : Ban;

    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-tight',
                licenseKeyStatusBadgeClass(status),
            ].join(' ')}
        >
            <Icon className="size-3.5 shrink-0 opacity-90" aria-hidden />
            {licenseKeyStatusLabel(status)}
        </span>
    );
}
