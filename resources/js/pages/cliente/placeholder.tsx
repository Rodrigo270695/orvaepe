import ClientPortalLayout from '@/layouts/client-portal-layout';
import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';

type Props = {
    title: string;
    description: string;
};

export default function ClientePlaceholder({ title, description }: Props) {
    return (
        <ClientPortalLayout
            title={title}
            headTitle={title}
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: title },
            ]}
        >
            <div className="mx-auto max-w-2xl space-y-5">
                <ClientPageTitleCard title={title} />
                <div className="rounded-xl border border-dashed border-[color-mix(in_oklab,var(--state-alert)_30%,var(--border))] bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] p-10 text-center shadow-sm">
                    <p className="text-[15px] leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                    <p className="mt-4 text-sm text-[color-mix(in_oklab,var(--state-alert)_62%,var(--foreground))]">Próximamente</p>
                </div>
            </div>
        </ClientPortalLayout>
    );
}
