export default function BrandMark({
    name,
    className = '',
    badgeClassName = '',
    textClassName = '',
    variant = 'default',
}) {
    if (variant === 'decorative') {
        return (
            <div className={`inline-flex items-center justify-center ${className}`.trim()}>
                <span
                    className={`block h-1.5 w-16 rounded-full bg-[linear-gradient(90deg,rgba(47,95,159,0.18)_0%,rgba(47,95,159,0.92)_50%,rgba(47,95,159,0.18)_100%)] shadow-[0_4px_18px_rgba(35,73,123,0.18)] ${badgeClassName}`.trim()}
                    aria-hidden="true"
                />
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
            <img
                src="/logo_full.png"
                alt="TB Nur Logo"
                className="h-[38px] w-auto object-contain rounded-md"
            />
        </div>
    );
}
