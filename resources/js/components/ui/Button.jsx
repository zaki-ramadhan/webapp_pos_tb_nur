import Spinner from '@/components/ui/Spinner';

const variantClasses = {
    primary:
        'border border-transparent bg-brand-primary text-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]',
    danger:
        'border border-transparent bg-danger text-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]',
    secondary:
        'border border-slate-300 bg-white text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.08)]',
    ghost: 'border border-transparent bg-transparent text-info',
};

const activeVariantClasses = {
    primary: 'hover:bg-brand-primary-hover active:scale-[0.98] cursor-pointer',
    danger: 'hover:bg-danger-hover active:scale-[0.98] cursor-pointer',
    secondary: 'hover:bg-slate-50 active:scale-[0.98] cursor-pointer',
    ghost: 'hover:underline cursor-pointer',
};

const disabledClasses = 'cursor-default opacity-55 shadow-none pointer-events-none';

const sizeClasses = {
    md: 'h-9 px-4 text-xs sm:text-sm',
    lg: 'h-11 px-5 text-xs sm:text-sm',
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

    const variantClass = variantClasses[variant] || variantClasses.primary;
    const activeClass = isDisabled ? disabledClasses : (activeVariantClasses[variant] || activeVariantClasses.primary);

    return (
        <Component
            type={Component === 'button' ? type : undefined}
            disabled={Component === 'button' ? isDisabled : undefined}
            aria-disabled={isDisabled}
            aria-busy={loading}
            className={`inline-flex items-center justify-center gap-3 rounded-md font-medium transition ${variantClass} ${activeClass} ${sizeClasses[size]} ${widthClass} ${className}`.trim()}
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
