import { renderTabLabel } from '@/features/workspace/dashboard/WorkspaceDraftState';

export default function PreferencesTabs({
    tabs = [],
    activeTabId,
    onSelectTab,
    className = '',
    tabClassName = '',
    activeTabClassName = '',
    inactiveTabClassName = '',
}) {
    if (!tabs || tabs.length <= 1) {
        return null;
    }

    const hasLeftPadding = className.includes('pl-');
    const hasRightPadding = className.includes('pr-');
    const leftPaddingClass = hasLeftPadding ? '' : 'pl-3 sm:pl-4';
    const rightPaddingClass = hasRightPadding ? '' : 'pr-3 sm:pr-4';

    return (
        <div
            className={`overflow-x-auto overflow-y-hidden bg-transparent pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:pt-1.5 ${leftPaddingClass} ${rightPaddingClass} ${className}`.trim()}
        >
            <div className="flex w-max min-w-full items-end gap-[5px]">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab(tab.id)}
                        className={`relative -mb-px -mr-px inline-flex h-7.5 shrink-0 items-center rounded-t-[5px] border border-b-0 px-3 text-sm cursor-pointer select-none transition sm:h-8 sm:px-4 sm:text-sm md:h-8.5 md:text-base max-w-[120px] sm:max-w-[160px] md:max-w-[200px] ${
                            activeTabId === tab.id
                                ? 'z-10 border-border-tab-secondary-alt border-t-[3px] border-t-tab-active-border-t bg-ui-bg-hover font-normal text-blue-550'
                                : 'border-border-tab-secondary-alt bg-tab-primary-inactive-bg font-normal text-tab-primary-inactive-text hover:bg-tab-primary-inactive-hover-bg'
                        } ${activeTabId === tab.id ? activeTabClassName : inactiveTabClassName} ${tabClassName}`.trim()}
                    >
                        <span className="block truncate">{renderTabLabel(tab.label, activeTabId === tab.id, false)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
