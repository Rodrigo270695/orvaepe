import { useState } from 'react';

type Props = {
    name: string;
    src: string;
    className: string;
    eager?: boolean;
};

function initialsOf(name: string): string {
    const words = name
        .replace(/cl[ií]nica|veterinaria|centro|hospital|s\.?a\.?c\.?|e\.?i\.?r\.?l\.?/gi, '')
        .split(/\s+/)
        .filter(Boolean);
    return (words.length > 0 ? words : name.split(/\s+/))
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

export default function ClientLogo({ name, src, className, eager = false }: Props) {
    const [failed, setFailed] = useState(false);

    if (failed || !src) {
        return (
            <span
                role="img"
                aria-label={name}
                className={`${className} font-display flex items-center justify-center font-semibold text-[#006D55]`}
            >
                {initialsOf(name)}
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            width={80}
            height={80}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed(true)}
            className={`${className} object-contain`}
        />
    );
}
