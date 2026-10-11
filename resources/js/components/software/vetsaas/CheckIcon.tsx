type Props = {
    className?: string;
    strokeWidth?: number;
};

export default function CheckIcon({ className = 'size-4', strokeWidth = 2.5 }: Props) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden>
            <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
