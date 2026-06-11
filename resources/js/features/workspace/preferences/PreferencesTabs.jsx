export default function PreferencesTabs({
    tabs = [],
    activeTabId,
    onSelectTab,
    className = '',
    tabClassName = '',
    activeTabClassName = '',
    inactiveTabClassName = '',
}) {
    return (
        <div
            className={`overflow-x-auto overflow-y-hidden border-b border-[#d5d9e1] bg-[#f4f4f5] px-2 pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-2.5 ${className}`.trim()}
        >
            <div className="flex w-max min-w-full items-end gap-[5px]">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab(tab.id)}
                        className={`relative -mb-px -mr-px inline-flex h-8.5 shrink-0 items-center rounded-t-[5px] border border-b-0 px-3 text-[13px] transition sm:h-9 sm:px-4 sm:text-[14px] md:h-9.5 md:text-[15px] ${
                            activeTabId === tab.id
                                ? 'z-10 border-[#bcc4d0] border-t-[3px] border-t-[#ED3969] bg-white font-semibold text-[#475569]'
                                : 'border-[#bcc4d0] bg-[#e2e8f0] font-normal text-[#475569] hover:bg-[#cbd5e1]'
                        } ${activeTabId === tab.id ? activeTabClassName : inactiveTabClassName} ${tabClassName}`.trim()}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
