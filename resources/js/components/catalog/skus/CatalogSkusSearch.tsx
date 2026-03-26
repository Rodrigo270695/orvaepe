import * as React from 'react';
import { router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';

type Props = {
    initialQuery: string;
    initialCategoryId: string;
    categoryOptions: { value: string; label: string }[];
    className?: string;
};

export default function CatalogSkusSearch({
    initialQuery,
    initialCategoryId,
    categoryOptions,
    className,
}: Props) {
    const page = usePage();
    const [query, setQuery] = React.useState(initialQuery);
    const [categoryId, setCategoryId] = React.useState(initialCategoryId || '__all__');
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => setQuery(initialQuery), [initialQuery]);
    React.useEffect(() => setCategoryId(initialCategoryId || '__all__'), [initialCategoryId]);

    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            const currentUrl = new URL(page.url, window.location.origin);
            const currentQuery = currentUrl.searchParams.get('q') ?? '';
            const nextCategory = categoryId === '__all__' ? '' : categoryId;
            const currentCategory = currentUrl.searchParams.get('category_id') ?? '';
            if (currentQuery === query && currentCategory === nextCategory) return;

            if (query.trim()) currentUrl.searchParams.set('q', query.trim());
            else currentUrl.searchParams.delete('q');

            if (nextCategory) currentUrl.searchParams.set('category_id', nextCategory);
            else currentUrl.searchParams.delete('category_id');

            currentUrl.searchParams.set('page', '1');

            router.get(currentUrl.pathname + currentUrl.search, {}, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    const input = inputRef.current;
                    if (!input) return;
                    input.focus();
                    const end = input.value.length;
                    input.setSelectionRange(end, end);
                },
            });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page.url, query, categoryId]);

    return (
        <div className={`flex flex-col gap-2 md:flex-row md:items-center ${className ?? ''}`}>
            <div className="relative w-full max-w-sm rounded-xl px-1 neumorph-inset">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    name="q"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por código, nombre, modelo o producto…"
                    className="h-10 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
                />
            </div>
            <div className="w-full max-w-xs">
                <AdminUnderlineSelect
                    id="filter-category"
                    name="filter-category"
                    value={categoryId}
                    onValueChange={setCategoryId}
                    options={categoryOptions}
                    placeholder="Todas las categorías"
                />
            </div>
        </div>
    );
}

