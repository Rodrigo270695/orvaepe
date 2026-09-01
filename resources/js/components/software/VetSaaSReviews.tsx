import { Quote, Star } from 'lucide-react';
import { useState } from 'react';

export type VetSaaSPublicReview = {
    author_name: string;
    role_label: string;
    clinic_name: string;
    role_line: string;
    rating: number;
    comment: string;
    submitted_at?: string | null;
    logo_url?: string | null;
};

function initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function Stars({ rating }: { rating: number }) {
    const n = Math.min(5, Math.max(1, Math.round(rating)));
    return (
        <div className="flex gap-0.5" aria-label={`${n} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`size-3.5 ${
                        i <= n
                            ? 'fill-[#C9A227] text-[#C9A227]'
                            : 'fill-transparent text-[var(--vs-border)]'
                    }`}
                    strokeWidth={1.5}
                />
            ))}
        </div>
    );
}

function ClinicMark({ review }: { review: VetSaaSPublicReview }) {
    const [failed, setFailed] = useState(false);
    const logo = (review.logo_url ?? '').trim();
    const initials = initialsFromName(review.clinic_name || review.author_name);

    if (logo !== '' && !failed) {
        return (
            <img
                src={logo}
                alt={review.clinic_name}
                className="size-12 shrink-0 rounded-2xl border border-[var(--vs-border)] bg-white object-contain p-1"
                loading="lazy"
                decoding="async"
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <div
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#006D55,#33A07B)] font-display text-sm font-semibold text-white"
            aria-hidden
        >
            {initials}
        </div>
    );
}

export default function VetSaaSReviews({ reviews }: { reviews: VetSaaSPublicReview[] }) {
    if (reviews.length === 0) {
        return null;
    }

    return (
        <section className="bg-[var(--vs-card)] py-16" id="reseñas">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <p className="vs-body text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--vs-500)]">
                    Clínicas reales
                </p>
                <h2 className="vs-display mt-2 text-3xl font-bold sm:text-4xl">
                    Lo que dice el equipo que opera VetSaaS
                </h2>
                <p className="vs-body vs-muted mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
                    Valoraciones de recepcionistas, veterinarios y administración de cada
                    clínica. Se publican con el cargo y el nombre de la veterinaria.
                </p>

                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {reviews.map((review, idx) => (
                        <blockquote
                            key={`${review.author_name}-${review.clinic_name}-${idx}`}
                            className="relative flex flex-col overflow-hidden rounded-[1.5rem] border border-[var(--vs-border)] bg-[var(--vs-bg)] p-6 shadow-[0_20px_50px_-32px_rgba(0,109,85,0.45)]"
                        >
                            <Quote className="absolute right-5 top-5 size-8 text-[var(--vs-200)] opacity-70" />
                            <div className="flex items-start gap-3">
                                <ClinicMark review={review} />
                                <div className="min-w-0">
                                    <Stars rating={review.rating} />
                                    <p className="vs-display mt-2 text-sm font-semibold leading-snug">
                                        {review.author_name}
                                    </p>
                                    <p className="vs-body vs-muted mt-0.5 text-xs leading-snug">
                                        {review.role_line}
                                    </p>
                                </div>
                            </div>
                            <p className="vs-body mt-4 text-[15px] leading-relaxed text-[var(--vs-ink)]">
                                &ldquo;{review.comment}&rdquo;
                            </p>
                        </blockquote>
                    ))}
                </div>
            </div>
        </section>
    );
}
