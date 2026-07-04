export default function DropdownMenuItem({
    icon = null,
    badge = null,
    children,
    className = '',
    iconClassName = '',
    contentClassName = '',
    disabled = false,
    ...props
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            aria-disabled={disabled}
            className={`inline-flex w-full items-center gap-2.5 rounded-none px-2.5 py-2.5 text-left text-sm leading-5 text-abc-label-dark transition-colors duration-100 ${
                disabled ? 'cursor-default opacity-65 pointer-events-none' : 'hover:bg-brand-blue-lightest'
            } ${className}`.trim()}
            {...props}
        >
            {icon ? (
                <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center text-abc-label-dark ${iconClassName}`.trim()}>
                    {icon}
                </span>
            ) : null}
            <span className={`block flex-1 whitespace-normal ${contentClassName}`.trim()}>{children}</span>
            {badge ? (
                <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-red-350 px-1.5 text-xs font-semibold text-white">
                    {badge}
                </span>
            ) : null}
        </button>
    );
}
