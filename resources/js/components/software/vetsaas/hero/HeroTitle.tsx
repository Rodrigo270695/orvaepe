const LINES = [
    { words: ['La', 'clínica', 'en', 'orden.'], className: 'vs-title-line-1' },
    { words: ['La', 'IA', 'en', 'el', 'WhatsApp.'], className: 'vs-title-line-2' },
] as const;

const BASE_DELAY = 0.05;
const STEP = 0.04;
const FULL_TITLE = LINES.map((line) => line.words.join(' ')).join(' ');

export default function HeroTitle() {
    let wordIndex = 0;

    return (
        <h1
            aria-label={FULL_TITLE}
            className="font-display mt-6 text-[2.75rem] font-semibold leading-[0.98] tracking-tight sm:text-6xl xl:text-7xl"
        >
            {LINES.map((line) => (
                <span key={line.words.join(' ')} aria-hidden className={`block ${line.className}`}>
                    {line.words.map((word, i) => {
                        const delay = BASE_DELAY + wordIndex++ * STEP;
                        return (
                            <span key={`${word}-${delay}`}>
                                <span className="vs-word inline-block" style={{ animationDelay: `${delay}s` }}>
                                    {word}
                                </span>
                                {i < line.words.length - 1 ? ' ' : null}
                            </span>
                        );
                    })}
                </span>
            ))}
        </h1>
    );
}
