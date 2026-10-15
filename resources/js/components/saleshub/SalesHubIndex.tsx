import { Link } from '@inertiajs/react';
import { BookOpen, MessagesSquare, Sparkles } from 'lucide-react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { cn } from '@/lib/utils';

import { SalesHubConversations } from './SalesHubConversations';
import { SalesHubKnowledgePanel } from './SalesHubKnowledgePanel';
import type { SalesHubPageProps, SalesHubTab } from './types';

const TABS: { key: SalesHubTab; label: string; icon: typeof BookOpen }[] = [
    { key: 'conocimiento', label: 'Conocimiento', icon: BookOpen },
    { key: 'conversaciones', label: 'Conversaciones', icon: MessagesSquare },
];

export default function SalesHubIndex({
    tab,
    products,
    knowledge,
    conversations,
    routes,
}: SalesHubPageProps) {
    return (
        <div className="space-y-6">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex items-start gap-3">
                    <Sparkles
                        className="mt-0.5 size-4 shrink-0 text-[#D28C3C]"
                        aria-hidden
                    />
                    <div>
                        <h1 className="text-sm font-bold">Centro de Ventas</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            El bot de ventas responde por las líneas de OpenWA
                            con lo que configures aquí para cada SaaS. Los
                            planes y precios se leen solos de cada sistema; lo
                            demás (resumen, FAQ, objeciones, demo, indicaciones)
                            lo decides en ORVAE.
                        </p>
                    </div>
                </div>

                <nav
                    className="mt-4 flex gap-1.5"
                    aria-label="Secciones del Centro de Ventas"
                >
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <Link
                            key={key}
                            href={routes.index}
                            data={{ tab: key }}
                            preserveScroll
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors',
                                tab === key
                                    ? 'bg-[#D28C3C]/15 text-[#D28C3C]'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                            aria-current={tab === key ? 'page' : undefined}
                        >
                            <Icon className="size-3.5" aria-hidden />
                            {label}
                            {key === 'conversaciones' &&
                            conversations.stats.total > 0 ? (
                                <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                                    {conversations.stats.total}
                                </span>
                            ) : null}
                        </Link>
                    ))}
                </nav>
            </NeuCardRaised>

            {tab === 'conocimiento' ? (
                <SalesHubKnowledgePanel
                    products={products}
                    knowledge={knowledge}
                    indexUrl={routes.index}
                />
            ) : (
                <SalesHubConversations
                    products={products}
                    conversations={conversations}
                    indexUrl={routes.index}
                />
            )}
        </div>
    );
}
