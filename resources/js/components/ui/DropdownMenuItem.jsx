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
            className={`inline-flex w-full items-center gap-2.5 rounded-[3px] px-2.5 py-2 text-left text-sm leading-5 text-[#2b3348] transition-colors duration-100 ${
                disabled ? 'cursor-default opacity-65 pointer-events-none' : 'hover:bg-[#f5f7fb]'
            } ${className}`.trim()}
            {...props}
        >
            {icon ? (
                <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#2b3348] ${iconClassName}`.trim()}>
                    {icon}
                </span>
            ) : null}
            <span className={`block flex-1 whitespace-normal ${contentClassName}`.trim()}>{children}</span>
            {badge ? (
                <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#f25759] px-1.5 text-xs font-semibold text-white">
                    {badge}
                </span>
            ) : null}
        </button>
    );
}
