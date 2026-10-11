import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

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

function ReviewCard({ review }: { review: VetSaaSPublicReview }) {
    return (
        <blockquote className="flex w-[20rem] shrink-0 flex-col rounded-2xl border border-[#99D2BC] bg-white p-5 shadow-[0_12px_30px_-18px_rgba(0,109,85,0.55)] sm:w-[24rem]">
            <div className="flex items-start gap-3">
                <ClinicMark review={review} />
                <div className="min-w-0">
                    <Stars rating={review.rating} />
                    <p className="mt-2 font-display text-sm font-semibold leading-snug text-[#06241C]">
                        {review.author_name}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-[#1F6B52]">
                        {review.role_line}
                    </p>
                </div>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-[#06241C]">
                &ldquo;{review.comment}&rdquo;
            </p>
        </blockquote>
    );
}

export default function VetSaaSReviews({ reviews }: { reviews: VetSaaSPublicReview[] }) {
    const [reduce, setReduce] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const sync = () => setReduce(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    if (reviews.length === 0) {
        return null;
    }

    const loop = reduce ? reviews : [...reviews, ...reviews];

    return (
        <section className="bg-[#F3FBF7] py-16" id="reseñas">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-[#006D55] sm:text-4xl">
                    Lo que dicen quienes operan con nosotros
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1F6B52]">
                    Recepcionistas, veterinarios y administración de cada veterinaria.
                </p>
            </div>

            {reduce ? (
                <div className="mx-auto mt-8 grid max-w-6xl gap-4 px-5 sm:px-8 md:grid-cols-2">
                    {reviews.map((review, idx) => (
                        <ReviewCard
                            key={`${review.author_name}-${review.clinic_name}-${idx}`}
                            review={review}
                        />
                    ))}
                </div>
            ) : (
                <div className="carousel-wrapper relative mt-8 overflow-hidden">
                    <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#F3FBF7] to-transparent md:w-28" />
                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#F3FBF7] to-transparent md:w-28" />
                    <div className="carousel-track flex w-max animate-marquee-reverse gap-4 px-6 py-2 [--duration:48s]">
                        {loop.map((review, idx) => (
                            <ReviewCard
                                key={`${review.author_name}-${review.clinic_name}-${idx}`}
                                review={review}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
