import { renderTabLabel } from '@/features/workspace/dashboard/WorkspaceDraftState';

export default function PreferencesTabs({
    tabs = [],
    rightTabs = [],
    activeTabId,
    onSelectTab,
    className = '',
    tabClassName = '',
    activeTabClassName = '',
    inactiveTabClassName = '',
}) {
    if ((!tabs || tabs.length === 0) && (!rightTabs || rightTabs.length === 0)) {
        return null;
    }

    const hasLeftPadding = className.includes('pl-');
    const hasRightPadding = className.includes('pr-');
    const leftPaddingClass = hasLeftPadding ? '' : 'pl-3 sm:pl-4';
    const rightPaddingClass = hasRightPadding ? '' : 'pr-3 sm:pr-4';

    const renderSingleTab = (tab) => {
        const isActive = activeTabId === tab.id;
        return (
            <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`relative -mb-px -mr-px inline-flex h-7.5 shrink-0 items-center rounded-t-[5px] px-3 text-sm cursor-pointer select-none transition sm:h-8 sm:px-4 sm:text-sm md:h-8.5 md:text-base max-w-[120px] sm:max-w-[160px] md:max-w-[200px] ${
                    isActive
                        ? 'z-10 border-x border-t-[3px] border-b border-b-ui-bg-hover border-x-border-tab-secondary-alt border-t-tab-active-border-t bg-ui-bg-hover font-normal text-blue-550'
                        : 'border border-border-tab-secondary-alt bg-tab-primary-inactive-bg font-normal text-tab-primary-inactive-text hover:bg-tab-primary-inactive-hover-bg'
                } ${isActive ? activeTabClassName : inactiveTabClassName} ${tabClassName}`.trim()}
            >
                <span className="block truncate">{renderTabLabel(tab.label, isActive, false)}</span>
            </button>
        );
    };

    return (
        <div className={`border-b border-border-tab-secondary-alt bg-transparent ${className}`.trim()}>
            <div
                className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-0.5 sm:pt-0.5 ${leftPaddingClass} ${rightPaddingClass}`.trim()}
            >
                <div className="flex w-full items-end justify-between min-w-max">
                    <div className="flex items-end gap-[5px]">
                        {tabs.map(renderSingleTab)}
                    </div>
                    {rightTabs && rightTabs.length > 0 ? (
                        <div className="flex items-end gap-[5px] ml-auto">
                            {rightTabs.map(renderSingleTab)}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
