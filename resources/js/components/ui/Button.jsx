import Spinner from '@/components/ui/Spinner';

const variantClasses = {
    primary:
        'border border-transparent bg-brand-blue text-white shadow-button-primary',
    danger:
        'border border-transparent bg-danger text-white shadow-button-primary',
    secondary:
        'border border-slate-300 bg-white text-slate-600 shadow-button-secondary',
    ghost: 'border border-transparent bg-transparent text-info',
    'brand-blue':
        'border border-transparent bg-brand-blue text-white shadow-button-primary',
    'brand-pink':
        'border border-transparent bg-brand-primary text-white shadow-button-primary',
    success:
        'border border-transparent bg-green-600 text-white shadow-button-primary',
};

const activeVariantClasses = {
    primary: 'hover:bg-brand-blue-hover active:scale-[0.98] cursor-pointer',
    danger: 'hover:bg-danger-hover active:scale-[0.98] cursor-pointer',
    secondary: 'hover:bg-slate-50 active:scale-[0.98] cursor-pointer',
    ghost: 'hover:underline cursor-pointer',
    'brand-blue':
        'hover:bg-brand-blue-hover active:scale-[0.98] cursor-pointer',
    'brand-pink':
        'hover:bg-brand-primary-hover active:scale-[0.98] cursor-pointer',
    success:
        'hover:bg-green-700 active:scale-[0.98] cursor-pointer',
};

const disabledClasses = 'cursor-default opacity-55 shadow-none pointer-events-none';

const sizeClasses = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-10 px-5 text-sm sm:text-base',
    lg: 'h-12 px-6 text-base',
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

    const hasFontWeight = className.split(' ').some((c) => c.startsWith('font-'));
    const fontWeightClass = hasFontWeight ? '' : 'font-normal';

    const hasHeight = className.split(' ').some((c) => c.startsWith('h-') || c.startsWith('py-'));
    const sizeClass = sizeClasses[size] || sizeClasses.lg;
    let resolvedSizeClass = hasHeight ? sizeClass.replace(/\bh-\d+\b/g, '') : sizeClass;

    const hasText = className.split(' ').some((c) => c.startsWith('text-') || c.includes(':text-'));
    if (hasText) {
        resolvedSizeClass = resolvedSizeClass
            .replace(/\btext-[a-z]+\b/g, '')
            .replace(/\b[a-z]+:text-[a-z]+\b/g, '');
    }

    return (
        <Component
            type={Component === 'button' ? type : undefined}
            disabled={Component === 'button' ? isDisabled : undefined}
            aria-disabled={isDisabled}
            aria-busy={loading}
            className={`inline-flex items-center justify-center gap-3 rounded-md ${fontWeightClass} transition ${variantClass} ${activeClass} ${resolvedSizeClass} ${widthClass} ${className}`.trim()}
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
