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

    return (
        <div
            className={`overflow-x-auto overflow-y-hidden border-b border-[#d5d9e1] bg-transparent pl-0 pr-2 pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:pl-0 sm:pr-2.5 ${className}`.trim()}
        >
            <div className="flex w-max min-w-full items-end gap-[5px]">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab(tab.id)}
                        className={`relative -mb-px -mr-px inline-flex h-8.5 shrink-0 items-center rounded-t-[5px] border border-b-0 px-3 text-sm transition sm:h-9 sm:px-4 sm:text-sm md:h-9.5 md:text-base max-w-[120px] sm:max-w-[160px] md:max-w-[200px] ${
                            activeTabId === tab.id
                                ? 'z-10 border-[#bcc4d0] border-t-[3px] border-t-[#ED3969] bg-white font-normal text-[#475569]'
                                : 'border-[#bcc4d0] bg-tab-primary-inactive-bg font-normal text-tab-primary-inactive-text hover:bg-tab-primary-inactive-hover-bg'
                        } ${activeTabId === tab.id ? activeTabClassName : inactiveTabClassName} ${tabClassName}`.trim()}
                    >
                        <span className="block truncate">{renderTabLabel(tab.label, activeTabId === tab.id, false)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
