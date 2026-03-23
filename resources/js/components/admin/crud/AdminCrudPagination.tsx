import * as React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatorLike = {
    links?: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
    per_page?: number;
    current_page?: number;
    last_page?: number;
};

type Props = {
    paginator: PaginatorLike | null | undefined;
};

function isEllipsisLabel(label: string) {
    const trimmed = label.trim();
    return trimmed === '...' || trimmed === '…';
}

export default function AdminCrudPagination({
    paginator,
}: Props) {
    const page = usePage();

    const links = paginator?.links ?? [];

    const prevLink = links.find((l) => isPrevLabel(l.label));
    const nextLink = links.find((l) => isNextLabel(l.label));

    const visibleLinks = links.filter((l) => l.url && !isEllipsisLabel(l.label));

    if (!links.length || visibleLinks.length === 0) return null;

    const currentPage =
        paginator?.current_page ??
        getActivePageFromLinks(links) ??
        1;

    const pageNumbersFromLinks = visibleLinks
        .filter((l) => !isPrevLabel(l.label) && !isNextLabel(l.label))
        .map((l) => Number(l.label.trim()))
        .filter((n) => Number.isFinite(n));

    const lastPage =
        paginator?.last_page ?? (pageNumbersFromLinks.length > 0 ? Math.max(...pageNumbersFromLinks) : undefined);

    const perPage = paginator?.per_page ?? 25;

    const from =
        paginator?.from ??
        (paginator?.total != null
            ? (currentPage - 1) * perPage + 1
            : undefined);
    const to =
        paginator?.to ??
        (paginator?.total != null
            ? Math.min(paginator.total, currentPage * perPage)
            : undefined);

    const total = paginator?.total;

    const perPageOptions = [10, 15, 20, 25, 30, 40, 50];

    const perPageForSelect = perPageOptions.includes(perPage)
        ? perPage
        : 25;

    const handlePerPageChange = (value: string) => {
        const next = Number(value);
        if (!Number.isFinite(next) || next <= 0) return;

        const u = new URL(
            page.url,
            window.location.origin,
        );
        u.searchParams.set('per_page', String(next));
        u.searchParams.set('page', '1');

        router.get(u.pathname + u.search);
    };

    return (
        <div className="pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center justify-center gap-3 whitespace-nowrap text-xs text-muted-foreground sm:w-auto sm:justify-start sm:text-left">
                {from != null && to != null && total != null ? (
                    <span className="leading-tight">
                        <span className="sm:hidden">
                            <span className="text-foreground">{from}-{to}</span> de{' '}
                            <span className="text-foreground">{total}</span> registros
                        </span>
                        <span className="hidden sm:inline">
                            Mostrando <span className="text-foreground">{from}-{to}</span> de{' '}
                            <span className="text-foreground">{total}</span> registros
                        </span>
                    </span>
                ) : null}

                {lastPage != null ? (
                    <span className="leading-tight">
                        <span className="sm:hidden">
                            Pág <span className="text-foreground">{currentPage}</span>/{' '}
                            <span className="text-foreground">{lastPage}</span>
                        </span>
                        <span className="hidden sm:inline">
                            Página <span className="text-foreground">{currentPage}</span> de{' '}
                            <span className="text-foreground">{lastPage}</span>
                        </span>
                    </span>
                ) : null}

                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                        Mostrar
                    </span>
                    <Select
                        value={String(perPageForSelect)}
                        onValueChange={handlePerPageChange}
                    >
                        <SelectTrigger
                            size="sm"
                            className="w-[78px] cursor-pointer border-border/60 bg-background text-xs"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start" side="top">
                            {perPageOptions.map((v) => (
                                <SelectItem key={v} value={String(v)}>
                                    {v}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                </div>

                <div className="flex w-full items-center justify-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
                    {prevLink?.url ? (
                        <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                            <Link href={prevLink.url} prefetch>
                                <ChevronLeft className="size-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="cursor-not-allowed opacity-60"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                    )}

                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border/60 bg-muted/20 px-2 text-xs font-semibold text-foreground">
                        {lastPage && lastPage > 1
                            ? `${currentPage}/${lastPage}`
                            : currentPage}
                    </span>

                    {nextLink?.url ? (
                        <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                            <Link href={nextLink.url} prefetch>
                                <ChevronRight className="size-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="cursor-not-allowed opacity-60"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function isPrevLabel(label: string) {
    const t = label.toLowerCase();
    return t.includes('anterior') || t.includes('previous');
}

function isNextLabel(label: string) {
    const t = label.toLowerCase();
    return t.includes('siguiente') || t.includes('next');
}

function getActivePageFromLinks(
    links: PaginationLink[],
): number | null {
    const active = links.find((l) => l.active && /^\d+$/.test(l.label.trim()));
    if (!active) return null;
    const n = Number(active.label.trim());
    return Number.isFinite(n) ? n : null;
}

