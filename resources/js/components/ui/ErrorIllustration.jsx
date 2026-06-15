export default function ErrorIllustration({ className = '' }) {
    return (
        <svg viewBox="0 0 72 72" className={`h-16 w-16 shrink-0 ${className}`.trim()} aria-hidden="true">
            <path
                d="M36 8 61 54.5A4.6 4.6 0 0 1 56.95 61H15.05A4.6 4.6 0 0 1 11 54.5L36 8Z"
                fill="#ff4b40"
                stroke="#143a70"
                strokeWidth="3"
                strokeLinejoin="round"
            />
            <path
                d="M30 29.5 42 41.5M42 29.5 30 41.5"
                fill="none"
                stroke="#fff"
                strokeWidth="4.5"
                strokeLinecap="round"
            />
            <circle cx="36" cy="56.5" r="2.2" fill="#143a70" />
        </svg>
    );
}
