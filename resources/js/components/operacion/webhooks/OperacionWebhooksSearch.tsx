import { router, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import * as React from 'react';

type Props = {
    initialQuery: string;
    className?: string;
};

export default function OperacionWebhooksSearch({
    initialQuery,
    className,
}: Props) {
    const page = usePage();
    const [query, setQuery] = React.useState(initialQuery);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            const currentUrl = new URL(page.url, window.location.origin);
            const currentQuery = currentUrl.searchParams.get('q') ?? '';
            if (currentQuery === query) return;

            if (query.trim()) {
                currentUrl.searchParams.set('q', query.trim());
            } else {
                currentUrl.searchParams.delete('q');
            }
            currentUrl.searchParams.set('page', '1');

            router.get(
                currentUrl.pathname + currentUrl.search,
                {},
                {
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
                },
            );
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page.url, query]);

    return (
        <div className={className}>
            <div className="relative w-full max-w-sm neumorph-inset rounded-xl px-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    name="q"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Gateway, ID de evento o tipo…"
                    className="h-10 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
                />
            </div>
        </div>
    );
}
