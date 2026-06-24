import Button from '@/components/ui/Button';

function GoogleMark() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 inline-block mr-2">
            <path
                fill="var(--color-google-blue)"
                d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.7h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.89-1.74 2.97-4.3 2.97-7.29Z"
            />
            <path
                fill="var(--color-google-green)"
                d="M12 22c2.7 0 4.96-.89 6.61-2.41l-3.24-2.52c-.89.6-2.03.96-3.37.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.6A9.98 9.98 0 0 0 12 22Z"
            />
            <path
                fill="var(--color-google-yellow)"
                d="M6.4 13.91A5.98 5.98 0 0 1 6.09 12c0-.66.11-1.3.31-1.91V7.49H3.06a9.98 9.98 0 0 0 0 9.02l3.34-2.6Z"
            />
            <path
                fill="var(--color-google-red)"
                d="M12 5.97c1.47 0 2.78.5 3.81 1.48l2.86-2.86C16.95 2.99 14.69 2 12 2a9.98 9.98 0 0 0-8.94 5.49l3.34 2.6c.79-2.37 3-4.12 5.6-4.12Z"
            />
        </svg>
    );
}

export default function SocialButton({ label, onClick, href = null, disabled = false }) {
    return (
        <Button
            as={href ? 'a' : 'button'}
            type={href ? undefined : 'button'}
            href={href ?? undefined}
            onClick={onClick}
            disabled={disabled}
            variant="secondary"
            size="lg"
            fullWidth
        >
            <GoogleMark />
            <span>{label}</span>
        </Button>
    );
}
