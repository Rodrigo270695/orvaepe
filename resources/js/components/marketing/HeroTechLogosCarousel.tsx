'use client';

/**
 * Logos desde Simple Icons (https://simpleicons.org/) con colores originales.
 * CDN: https://cdn.simpleicons.org/{slug}
 * CSS3 sustituido por SASS (slug css3 fallaba en CDN).
 */
const TECH_LOGOS: { name: string; slug: string }[] = [
    { name: 'Laravel', slug: 'laravel' },
    { name: 'PHP', slug: 'php' },
    { name: 'React', slug: 'react' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'Vue.js', slug: 'vuedotjs' },
    { name: 'Node.js', slug: 'nodedotjs' },
    { name: 'Tailwind CSS', slug: 'tailwindcss' },
    { name: 'Vite', slug: 'vite' },
    { name: 'Inertia', slug: 'inertia' },
    { name: 'MySQL', slug: 'mysql' },
    { name: 'PostgreSQL', slug: 'postgresql' },
    { name: 'Redis', slug: 'redis' },
    { name: 'Git', slug: 'git' },
    { name: 'Docker', slug: 'docker' },
    { name: 'NPM', slug: 'npm' },
    { name: 'HTML5', slug: 'html5' },
    { name: 'Sass', slug: 'sass' },
    // Móvil
    { name: 'Flutter', slug: 'flutter' },
    { name: 'Dart', slug: 'dart' },
    { name: 'Expo', slug: 'expo' },
    { name: 'Swift', slug: 'swift' },
    { name: 'Kotlin', slug: 'kotlin' },
];

const LOGO_SIZE = 28;
const CDN = 'https://cdn.simpleicons.org';

export default function HeroTechLogosCarousel() {
    const duplicated = [...TECH_LOGOS, ...TECH_LOGOS];

    return (
        <div className="flex w-full min-w-0 flex-col gap-3 pl-2">
            <div className="flex items-center gap-2">
                <span
                    className="h-px w-6 shrink-0 rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--o-amber), transparent)' }}
                    aria-hidden
                />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--o-amber)]/90">
                    Desarrollado con
                </p>
            </div>
            <div
                className="hero-tech-carousel group/carousel relative min-w-0 overflow-hidden rounded-xl px-3 py-3 transition-colors duration-300"
                style={{
                    background: 'linear-gradient(135deg, color-mix(in oklab, var(--o-amber) 4%, var(--background)) 0%, transparent 50%)',
                    boxShadow: '0 0 0 1px color-mix(in oklab, var(--o-amber) 8%, transparent) inset',
                }}
            >
                {/* Fade en los bordes */}
                <div
                    className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-[var(--background)] to-transparent"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-[var(--background)] to-transparent"
                    aria-hidden
                />
                <div className="flex w-max animate-marquee gap-8 py-1 [--duration:40s]">
                    {duplicated.map((tech, i) => (
                        <span
                            key={`${tech.slug}-${i}`}
                            className="flex size-10 shrink-0 cursor-default items-center justify-center rounded-lg transition-transform duration-300 hover:scale-125 group-hover/carousel:scale-110"
                            title={tech.name}
                        >
                            <img
                                src={`${CDN}/${tech.slug}`}
                                alt={tech.name}
                                width={LOGO_SIZE}
                                height={LOGO_SIZE}
                                className="size-8 shrink-0 object-contain opacity-85 transition-opacity duration-300 hover:opacity-100 group-hover/carousel:opacity-95"
                            />
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
