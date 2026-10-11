const LINES = [
    { words: ['La', 'clínica', 'en', 'orden.'], className: 'text-[#06241C]' },
    { words: ['La', 'IA', 'en', 'el', 'WhatsApp.'], className: 'text-[#008762]' },
] as const;

const BASE_DELAY = 0.15;
const STEP = 0.08;

export default function HeroTitle() {
    let wordIndex = 0;

    return (
        <h1 className="font-display mt-6 text-[2.75rem] font-semibold leading-[0.98] tracking-tight sm:text-6xl xl:text-7xl">
            {LINES.map((line) => (
                <span key={line.words.join(' ')} className={`block ${line.className}`}>
                    {line.words.map((word) => {
                        const delay = BASE_DELAY + wordIndex++ * STEP;
                        return (
                            <span
                                key={`${word}-${delay}`}
                                className="vs-word inline-block pr-[0.22em]"
                                style={{ animationDelay: `${delay}s` }}
                            >
                                {word}
                            </span>
                        );
                    })}
                </span>
            ))}
        </h1>
    );
}
