import {
    BellOff,
    FileSearch,
    FolderOpen,
    Inbox,
    PackageSearch,
    SearchX,
} from 'lucide-react';

const emptyStateIconMap = {
    default: Inbox,
    inbox: Inbox,
    reports: FolderOpen,
    search: SearchX,
    notification: BellOff,
    document: FileSearch,
    inventory: PackageSearch,
};

export default function EmptyState({
    title = 'Belum ada data',
    description = 'Data akan muncul setelah tersedia.',
    action = null,
    icon = null,
    iconName = 'default',
    size = 'md',
    tone = 'default',
    align = 'center',
    bordered = false,
    fill = false,
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    contentClassName = '',
}) {
    const sizeClasses = {
        sm: {
            wrapper: 'gap-3 px-4 py-6',
            icon: 'mb-1',
            title: 'text-base',
            description: 'mt-1 max-w-sm text-sm leading-5',
            action: 'mt-4',
        },
        md: {
            wrapper: 'gap-4 px-6 py-10',
            icon: 'mb-2',
            title: 'text-lg',
            description: 'mt-2 max-w-md text-sm leading-6',
            action: 'mt-5',
        },
        lg: {
            wrapper: 'gap-5 px-8 py-14',
            icon: 'mb-3',
            title: 'text-xl',
            description: 'mt-3 max-w-lg text-base leading-7',
            action: 'mt-6',
        },
    };

    const toneClasses = {
        default: {
            wrapper: 'bg-white/90',
            title: 'text-layout-text',
            description: 'text-text-muted',
        },
        subtle: {
            wrapper: 'bg-transparent',
            title: 'text-text-muted',
            description: 'text-text-light',
        },
    };

    const alignClasses = {
        center: 'items-center text-center',
        left: 'items-start text-left',
    };

    const currentSize = sizeClasses[size] ?? sizeClasses.md;
    const currentTone = toneClasses[tone] ?? toneClasses.default;
    const ResolvedIcon = typeof icon === 'string' ? (emptyStateIconMap[icon] ?? emptyStateIconMap.default) : (emptyStateIconMap[iconName] ?? emptyStateIconMap.default);
    const iconNode =
        icon && typeof icon !== 'string' ? (
            icon
        ) : (
            <ResolvedIcon className={size === 'sm' ? 'h-12 w-12' : size === 'lg' ? 'h-16 w-16' : 'h-14 w-14'} strokeWidth={1.7} />
        );

    return (
        <div
            className={`flex flex-col justify-center rounded-[10px] ${alignClasses[align] ?? alignClasses.center} ${currentSize.wrapper} ${currentTone.wrapper} ${bordered ? 'border border-dashed border-slate-300' : ''} ${fill ? 'h-full min-h-full w-full' : ''} ${className}`.trim()}
        >
            <div className={`${currentSize.icon} text-slate-400 ${contentClassName}`.trim()}>{iconNode}</div>
            <div className={contentClassName}>
                <h3 className={`${currentSize.title} font-medium ${currentTone.title} ${titleClassName}`.trim()}>
                    {title}
                </h3>
                {description ? (
                    <p
                        className={`${currentSize.description} ${currentTone.description} ${descriptionClassName}`.trim()}
                    >
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className={currentSize.action}>{action}</div> : null}
        </div>
    );
}
