import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

export default function GroupAccessCategoryList({
    categories,
    activeCategoryId,
    onSelectCategory,
    className = '',
    scrollClassName = '',
}) {
    return (
        <div
            className={`min-h-0 rounded-[8px] border border-ui-border-medium bg-white p-2 shadow-widget-hover ${className}`.trim()}
        >
            <div className={`h-full overflow-y-auto pr-1 ${scrollClassName}`.trim()}>
                <div className="space-y-1">
                    {categories.map((category) => {
                        const isActive = category.id === activeCategoryId;

                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => onSelectCategory(category.id)}
                                className={`flex w-full items-center gap-2.5 rounded-[6px] px-3.5 py-2.5 text-left text-sm transition ${
                                    isActive
                                        ? 'bg-tab-active-border-t text-white shadow-tab-active-pink'
                                        : 'text-tab-inactive-text hover:bg-brand-blue-lightest'
                                    }`.trim()}
                            >
                                <NavigationIcon
                                    type={category.icon}
                                    className={`h-5 w-5 ${isActive ? 'text-white' : 'text-text-light'}`.trim()}
                                />
                                <span className={`${isActive ? 'font-medium' : 'font-normal'}`.trim()}>
                                    {category.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
