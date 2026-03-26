import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, ShieldAlert } from 'lucide-react';

type Props = {
    statusCode: 403 | 404 | 500;
    title: string;
    description: string;
    hint: string;
};

export default function TechErrorView({
    statusCode,
    title,
    description,
    hint,
}: Props) {
    return (
        <>
            <Head title={`${statusCode} - ${title}`} />

            <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
                <div
                    className="pointer-events-none absolute inset-0 opacity-90"
                    style={{
                        background:
                            'radial-gradient(ellipse 85% 55% at 18% 12%, color-mix(in oklab, var(--state-info) 15%, transparent), transparent 60%), radial-gradient(ellipse 70% 55% at 82% 88%, color-mix(in oklab, var(--state-success) 14%, transparent), transparent 62%)',
                    }}
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, color-mix(in oklab, var(--state-info) 35%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--state-info) 35%, transparent) 1px, transparent 1px)',
                        backgroundSize: '34px 34px',
                    }}
                    aria-hidden
                />

                <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-14 sm:px-6">
                    <section className="w-full max-w-3xl rounded-3xl border border-[color-mix(in_oklab,var(--state-info)_28%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] p-8 shadow-[0_22px_70px_-30px_color-mix(in_oklab,var(--state-info)_35%,transparent)] backdrop-blur-md sm:p-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--state-info)_35%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_12%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--state-info)_76%,var(--foreground))]">
                            <ShieldAlert className="size-3.5" />
                            Sistema ORVAE
                        </div>

                        <div className="mt-6 flex flex-wrap items-end gap-4">
                            <span className="font-[family-name:var(--font-mono)] text-6xl font-bold leading-none text-[color-mix(in_oklab,var(--state-info)_74%,var(--foreground))] sm:text-7xl">
                                {statusCode}
                            </span>
                            <h1 className="pb-1 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl">
                                {title}
                            </h1>
                        </div>

                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
                            {description}
                        </p>

                        <div className="mt-6 rounded-2xl border border-[color-mix(in_oklab,var(--state-success)_24%,var(--border))] bg-[color-mix(in_oklab,var(--state-success)_10%,transparent)] px-4 py-3 text-sm text-[color-mix(in_oklab,var(--state-success)_84%,var(--foreground))]">
                            {hint}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[color-mix(in_oklab,var(--state-info)_40%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_12%,transparent)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--state-info)_18%,transparent)]"
                            >
                                <Home className="size-4" />
                                Ir al inicio
                            </Link>
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[color-mix(in_oklab,var(--foreground)_16%,var(--border))] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]"
                            >
                                <ArrowLeft className="size-4" />
                                Volver
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
