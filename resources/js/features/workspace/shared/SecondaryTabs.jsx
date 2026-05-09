import { CloseIcon, ViewModeIcon } from '@/features/workspace/shared/Icons';

export function SecondaryTab({ tab, active, onSelect, onClose }) {
    const isViewTab = tab.kind === 'view';
    const spacingClassName = tab.closable
        ? 'gap-1.5 pl-3 pr-1.5 md:gap-2 md:pl-4 md:pr-2'
        : 'gap-2 px-3.5 md:gap-2.5 md:px-4.5';
    const className = isViewTab
        ? active
            ? 'border-x-[1px] border-b-0 border-[#cfd4dc] border-t-[3px] border-t-[#e6e9ee] bg-[#f7f8fa] font-medium text-[#626b80]'
            : 'border-l-[#58bc32] border-r-[#58bc32] border-t-[#90e66a] bg-[#59c62e] font-normal text-white'
        : active
          ? 'border-l-[#bcc3cf] border-r-[#bcc3cf] border-t-[3px] border-t-[#ED3969] bg-[#f7f8fa] font-medium text-[#3c4459]'
          : 'border-l-[#adb4c1] border-r-[#adb4c1] border-t-[#c1c6d0] bg-[#d5d9df] font-normal text-[#5c6478]';
    const closeButtonClassName = active
        ? 'text-current hover:bg-white/20'
        : 'text-[#6e768b] hover:bg-white/70';

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(tab.id);
                }
            }}
            className={`relative -mb-px inline-flex h-8.5 shrink-0 items-center rounded-t-[5px] border-x border-t-2 border-b-0 text-[13px] leading-none whitespace-nowrap transition sm:h-9 sm:text-[14px] md:h-9.75 md:text-[16px] ${spacingClassName} ${className}`.trim()}
            aria-label={tab.ariaLabel ?? tab.label}
            title={tab.title ?? tab.label}
        >
            <span className="inline-flex h-full items-center">
                {isViewTab ? <ViewModeIcon /> : <span>{tab.label}</span>}
            </span>

            {tab.closable ? (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onClose?.(tab.id);
                    }}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-[3px] ${closeButtonClassName}`.trim()}
                    aria-label={`Tutup sub tab ${tab.label}`}
                >
                    <CloseIcon className="h-4 w-4" strokeWidth={2.6} />
                </button>
            ) : null}
        </div>
    );
}

export default function SecondaryTabs({
    tabs,
    activeTabId,
    onSelectTab,
    onCloseTab,
    className = '',
    gapClassName = 'gap-[4px]',
}) {
    if (!tabs.length) {
        return null;
    }

    return (
        <div className={`flex min-w-max items-end ${gapClassName} ${className}`.trim()}>
            {tabs.map((tab) => (
                <SecondaryTab
                    key={tab.id}
                    tab={tab}
                    active={activeTabId === tab.id}
                    onSelect={onSelectTab}
                    onClose={onCloseTab}
                />
            ))}
        </div>
    );
}
