import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useLayoutEffect, useMemo, useState } from 'react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavCollapsibleGroup, NavItem } from '@/types';

function findGroupIdForActiveUrl(
    sections: NavSidebarSection[],
    isMatch: (href: NavItem['href']) => boolean,
): string | null {
    for (const section of sections) {
        for (const group of section.groups) {
            if (group.items.some((item) => isMatch(item.href))) {
                return group.id;
            }
        }
    }

    return null;
}

type CollapsibleNavGroupProps = {
    group: NavCollapsibleGroup;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function CollapsibleNavGroup({
    group,
    open,
    onOpenChange,
}: CollapsibleNavGroupProps) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <Collapsible
            open={open}
            onOpenChange={onOpenChange}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        className="cursor-pointer font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
                        tooltip={{ children: group.title }}
                    >
                        <group.icon />
                        <span>{group.title}</span>
                        <ChevronRight
                            className={cn(
                                'ml-auto shrink-0 transition-transform duration-200',
                                open && 'rotate-90',
                            )}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={isCurrentOrParentUrl(item.href)}
                                    className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

export type NavSidebarSection = {
    /** Etiqueta del bloque (ej. General, Comercial) */
    label: string;
    /** Enlaces fijos sin desplegable */
    topItems?: NavItem[];
    /** Menús desplegables con jerarquía */
    groups: NavCollapsibleGroup[];
};

type NavMainCollapsibleProps = {
    sections: NavSidebarSection[];
};

export function NavMainCollapsible({ sections }: NavMainCollapsibleProps) {
    const { isCurrentUrl, isCurrentOrParentUrl, currentUrl } = useCurrentUrl();

    const activeGroupId = useMemo(
        () =>
            findGroupIdForActiveUrl(sections, (href) =>
                isCurrentOrParentUrl(href),
            ),
        [sections, currentUrl, isCurrentOrParentUrl],
    );

    /** Un solo desplegable abierto: el de la ruta activa; al navegar se cierra el resto */
    const [openGroupId, setOpenGroupId] = useState<string | null>(null);

    useLayoutEffect(() => {
        setOpenGroupId(activeGroupId);
    }, [activeGroupId]);

    const handleGroupOpenChange = (groupId: string, next: boolean) => {
        if (next) {
            setOpenGroupId(groupId);
            return;
        }

        setOpenGroupId((prev) => (prev === groupId ? null : prev));
    };

    return (
        <>
            {sections.map((section) => (
                <SidebarGroup key={section.label} className="px-2 py-0">
                    <SidebarGroupLabel className="font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-foreground/65">
                        {section.label}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {(section.topItems ?? []).map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                    className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        {section.groups.map((group) => (
                            <CollapsibleNavGroup
                                key={group.id}
                                group={group}
                                open={openGroupId === group.id}
                                onOpenChange={(next) =>
                                    handleGroupOpenChange(group.id, next)
                                }
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
