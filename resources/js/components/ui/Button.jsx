import Spinner from '@/components/ui/Spinner';

const variantClasses = {
    primary:
        'border border-transparent bg-[#f2356d] text-white shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:bg-[#e72d65]',
    danger:
        'border border-transparent bg-[#db2347] text-white shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:bg-[#c81f40]',
    secondary:
        'border border-slate-300 bg-white text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:bg-slate-50',
    ghost: 'border border-transparent bg-transparent text-[#4285f4] hover:underline',
};

const sizeClasses = {
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
};

export default function Button({
    as: Component = 'button',
    type = 'button',
    variant = 'primary',
    size = 'lg',
    className = '',
    fullWidth = false,
    disabled = false,
    loading = false,
    loadingLabel = '',
    spinnerClassName = '',
    children,
    ...props
}) {
    const widthClass = fullWidth ? 'w-full' : '';
    const isDisabled = disabled || loading;

    return (
        <Component
            type={Component === 'button' ? type : undefined}
            disabled={Component === 'button' ? isDisabled : undefined}
            aria-disabled={isDisabled}
            aria-busy={loading}
            className={`inline-flex items-center justify-center gap-3 rounded-md font-medium transition disabled:cursor-default disabled:opacity-55 disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim()}
            {...props}
        >
            {loading ? (
                <Spinner
                    className={`${
                        variant === 'secondary' || variant === 'ghost'
                            ? 'text-current'
                            : 'text-white'
                    } ${spinnerClassName}`.trim()}
                />
            ) : null}
            <span>{loading && loadingLabel ? loadingLabel : children}</span>
        </Component>
    );
}
