'use client';

import { useEffect, useId, useState } from 'react';

type Variant =
    | 'floating-shapes'   // Círculos y rectángulos flotantes para hero
    | 'grid-hex'          // Patrón de hexágonos
    | 'grid-dots'         // Puntos tipo mesh
    | 'circles-blur'      // Círculos grandes con blur (secciones)
    | 'diagonal-lines'    // Líneas diagonales
    | 'triangles'         // Triángulos decorativos
    | 'rings';            // Anillos concéntricos

type Props = {
    variant: Variant;
    className?: string;
    /** Opacidad global (0-1) */
    opacity?: number;
};

const amber = 'var(--o-amber)';
const warm = 'var(--o-warm)';
const border = 'var(--o-border2)';

/** Círculos y rectángulos flotantes para hero */
function FloatingShapes({ opacity = 0.12 }: { opacity?: number }) {
    return (
        <>
            <div
                className="pointer-events-none absolute -right-[10%] top-[15%] h-56 w-56 rounded-full border border-[var(--o-amber)] opacity-[var(--geo-opacity,0.1)] sm:h-72 sm:w-72"
                style={{ ['--geo-opacity' as string]: opacity }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute bottom-[20%] left-[-5%] h-36 w-36 rotate-12 rounded-lg border border-[var(--o-amber)] opacity-[var(--geo-opacity,0.08)] sm:h-48 sm:w-48"
                style={{ ['--geo-opacity' as string]: opacity * 0.8 }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute right-[20%] top-[50%] h-24 w-24 rounded-full border-2 border-[var(--o-amber)] opacity-[var(--geo-opacity,0.06)] sm:h-32 sm:w-32"
                style={{ ['--geo-opacity' as string]: opacity * 0.6 }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute left-[15%] top-[60%] h-16 w-16 -rotate-45 rounded-sm border border-[var(--o-warm)] opacity-[var(--geo-opacity,0.05)] sm:h-24 sm:w-24"
                style={{ ['--geo-opacity' as string]: opacity * 0.7 }}
                aria-hidden
            />
        </>
    );
}

/** Patrón de hexágonos (SVG, flat-top) */
function GridHex({
    opacity = 0.06,
    patternId,
    isMobile,
}: {
    opacity?: number;
    patternId: string;
    isMobile: boolean;
}) {
    const r = isMobile ? 22 : 28;
    const w = r * 2;
    const h = r * Math.sqrt(3);
    const path = `M ${r} 0 L ${w} ${h/2} L ${w} ${h + h/2} L ${r} ${h*2} L 0 ${h + h/2} L 0 ${h/2} Z`;
    return (
        <div
            className="pointer-events-none absolute inset-0 opacity-[var(--geo-opacity)]"
            style={{ ['--geo-opacity' as string]: opacity }}
            aria-hidden
        >
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id={patternId} width={w} height={h * 2} patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
                        <path d={path} fill="none" stroke={amber} strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
        </div>
    );
}

/** Puntos tipo mesh */
function GridDots({ opacity = 0.05, isMobile }: { opacity?: number; isMobile: boolean }) {
    return (
        <div
            className="pointer-events-none absolute inset-0 opacity-[var(--geo-opacity)]"
            style={{
                ['--geo-opacity' as string]: opacity,
                backgroundImage: `radial-gradient(circle at 1px 1px, ${amber} 1px, transparent 0)`,
                backgroundSize: isMobile ? '18px 18px' : '24px 24px',
            }}
            aria-hidden
        />
    );
}

/** Círculos grandes con blur para secciones */
function CirclesBlur({ opacity = 0.15 }: { opacity?: number }) {
    return (
        <>
            <div
                className="pointer-events-none absolute -left-24 top-[22%] h-72 w-72 rounded-full opacity-[var(--geo-opacity)] blur-[42px] sm:-left-32 sm:top-1/4 sm:h-96 sm:w-96 sm:blur-[48px]"
                style={{
                    ['--geo-opacity' as string]: opacity,
                    background: `radial-gradient(circle, ${amber} 0%, transparent 70%)`,
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -right-24 bottom-[22%] h-64 w-64 rounded-full opacity-[var(--geo-opacity)] blur-[34px] sm:-right-40 sm:bottom-1/4 sm:h-80 sm:w-80 sm:blur-[40px]"
                style={{
                    ['--geo-opacity' as string]: opacity * 0.8,
                    background: `radial-gradient(circle, ${warm} 0%, transparent 65%)`,
                }}
                aria-hidden
            />
        </>
    );
}

/** Líneas diagonales */
function DiagonalLines({ opacity = 0.04 }: { opacity?: number }) {
    return (
        <div
            className="pointer-events-none absolute inset-0 overflow-hidden opacity-[var(--geo-opacity)]"
            style={{ ['--geo-opacity' as string]: opacity }}
            aria-hidden
        >
            <div
                className="absolute -left-1/2 top-0 h-full w-[200%]"
                style={{
                    background: `repeating-linear-gradient(
                        105deg,
                        transparent,
                        transparent 80px,
                        ${amber} 80px,
                        ${amber} 1px
                    )`,
                }}
            />
            <div
                className="absolute -left-1/2 top-0 h-full w-[200%]"
                style={{
                    background: `repeating-linear-gradient(
                        75deg,
                        transparent,
                        transparent 80px,
                        ${border} 80px,
                        ${border} 1px
                    )`,
                    opacity: 0.6,
                }}
            />
        </div>
    );
}

/** Triángulos decorativos */
function Triangles({ opacity = 0.08 }: { opacity?: number }) {
    return (
        <>
            <div
                className="pointer-events-none absolute right-[5%] top-[18%] h-0 w-0 border-l-[56px] border-r-[56px] border-b-[110px] border-l-transparent border-r-transparent border-b-[var(--o-amber)] opacity-[var(--geo-opacity)] sm:right-[10%] sm:top-[20%] sm:border-l-[80px] sm:border-r-[80px] sm:border-b-[140px]"
                style={{ ['--geo-opacity' as string]: opacity }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute bottom-[28%] left-[2%] h-0 w-0 border-l-[45px] border-r-[45px] border-t-[78px] border-l-transparent border-r-transparent border-t-[var(--o-amber)] opacity-[var(--geo-opacity)] sm:bottom-[25%] sm:left-[5%] sm:border-l-[60px] sm:border-r-[60px] sm:border-t-[100px]"
                style={{ ['--geo-opacity' as string]: opacity * 0.7 }}
                aria-hidden
            />
        </>
    );
}

/** Anillos concéntricos */
function Rings({ opacity = 0.06, isMobile }: { opacity?: number; isMobile: boolean }) {
    const base = isMobile ? 16 : 20;
    const step = isMobile ? 12 : 15;
    const maxSize = isMobile ? 280 : 400;
    return (
        <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[var(--geo-opacity)]"
            style={{ ['--geo-opacity' as string]: opacity }}
            aria-hidden
        >
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="absolute rounded-full border border-[var(--o-amber)]"
                    style={{
                        width: `${base + i * step}vw`,
                        height: `${base + i * step}vw`,
                        maxWidth: `${maxSize}px`,
                        maxHeight: `${maxSize}px`,
                    }}
                />
            ))}
        </div>
    );
}

export default function GeometricBackground({ variant, className = '', opacity }: Props) {
    const id = useId();
    const patternId = `hex-${id.replace(/:/g, '')}`;
    const opacityVal = opacity ?? (variant === 'floating-shapes' ? 0.12 : 0.06);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 640px)');
        const update = () => setIsMobile(mq.matches);
        update();

        if ('addEventListener' in mq) {
            mq.addEventListener('change', update);
            return () => mq.removeEventListener('change', update);
        }

        mq.addListener(update);
        return () => mq.removeListener(update);
    }, []);

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
            {variant === 'floating-shapes' && <FloatingShapes opacity={opacityVal} />}
            {variant === 'grid-hex' && <GridHex opacity={opacityVal} patternId={patternId} isMobile={isMobile} />}
            {variant === 'grid-dots' && <GridDots opacity={opacityVal} isMobile={isMobile} />}
            {variant === 'circles-blur' && <CirclesBlur opacity={opacityVal} />}
            {variant === 'diagonal-lines' && <DiagonalLines opacity={opacityVal} />}
            {variant === 'triangles' && <Triangles opacity={opacityVal} />}
            {variant === 'rings' && <Rings opacity={opacityVal} isMobile={isMobile} />}
        </div>
    );
}
