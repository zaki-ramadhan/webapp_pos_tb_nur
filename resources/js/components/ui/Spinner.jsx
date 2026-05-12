export default function Spinner({ className = '' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`inline-flex h-4 w-4 animate-spin ${className}`.trim()}
        >
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.22" />
            <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
