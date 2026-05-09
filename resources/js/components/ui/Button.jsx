const variantClasses = {
    primary:
        'border border-transparent bg-[#f2356d] text-white shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:bg-[#e72d65]',
    secondary:
        'border border-slate-300 bg-white text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:bg-slate-50',
    ghost: 'border border-transparent bg-transparent text-[#4285f4] hover:underline',
};

const sizeClasses = {
    md: 'h-11 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
};

export default function Button({
    as: Component = 'button',
    type = 'button',
    variant = 'primary',
    size = 'lg',
    className = '',
    fullWidth = false,
    children,
    ...props
}) {
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <Component
            type={Component === 'button' ? type : undefined}
            className={`inline-flex items-center justify-center gap-3 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </Component>
    );
}
