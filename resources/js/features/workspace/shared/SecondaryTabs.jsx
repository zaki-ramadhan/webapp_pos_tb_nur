import { CloseIcon, ViewModeIcon } from '@/features/workspace/shared/Icons';
import { renderTabLabel } from '@/features/workspace/dashboard/WorkspaceDraftState';

export function SecondaryTab({ tab, active, onSelect, onClose, tabsCount = 1 }) {
    const isViewTab = tab.kind === 'view';
    const useViewTabStyle = isViewTab && tabsCount > 1;
    const spacingClassName = tab.closable
        ? 'gap-1.5 pl-3 pr-1.5 md:gap-2 md:pl-4 md:pr-2'
        : 'gap-2 px-3.5 md:gap-2.5 md:px-4.5';
    const className = useViewTabStyle
        ? active
            ? 'border-x-[1px] border-t-[3px] border-b-[2px] border-b-tab-active-bg -mb-[2px] border-tab-view-active-border-x border-t-tab-view-active-border-t bg-tab-view-active-bg font-normal text-tab-view-active-text'
            : 'border-l-[1px] border-r-[1px] border-t-[2px] border-b-0 -mb-px border-l-tab-view-inactive-border-l border-r-tab-view-inactive-border-r border-t-tab-view-inactive-border-t bg-tab-view-inactive-bg font-normal text-tab-view-inactive-text'
        : active
          ? 'border-l-[1px] border-r-[1px] border-t-[3px] border-b-[2px] border-b-tab-active-bg -mb-[2px] border-l-tab-active-border-x border-r-tab-active-border-x border-t-tab-active-border-t bg-tab-active-bg font-normal text-tab-active-text'
          : 'border-l-[1px] border-r-[1px] border-t-[2px] border-b-0 -mb-px border-l-tab-inactive-border-l border-r-tab-inactive-border-r border-t-tab-inactive-border-t bg-tab-inactive-bg font-normal text-tab-inactive-text';
    const closeButtonClassName = active
        ? 'text-abc-label-dark hover:text-red-600 transition-colors'
        : 'text-slate-400 hover:text-slate-700 transition-colors';

    const canClick = tabsCount > 1;
    const cursorClass = canClick ? 'cursor-pointer' : 'cursor-default';

    return (
        <div
            role="button"
            tabIndex={canClick ? 0 : -1}
            onClick={() => {
                if (canClick) {
                    onSelect(tab.id);
                }
            }}
            onKeyDown={(event) => {
                if (canClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onSelect(tab.id);
                }
            }}
            className={`relative inline-flex h-7.5 shrink-0 items-center rounded-t-[5px] text-xs leading-normal whitespace-nowrap select-none transition sm:h-8 sm:text-sm md:h-8.75 md:text-base max-w-[150px] sm:max-w-[190px] md:max-w-[230px] ${spacingClassName} ${cursorClass} ${className}`.trim()}
            aria-label={tab.ariaLabel ?? tab.label}
        >
            <span className="inline-flex h-full items-center min-w-0 max-w-[100px] sm:max-w-[130px] md:max-w-[160px]">
                {isViewTab ? <ViewModeIcon /> : <span className="block w-full truncate py-1">{renderTabLabel(tab.label, active, false)}</span>}
            </span>

            {tab.closable ? (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
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
                    tabsCount={tabs.length}
                />
            ))}
        </div>
    );
}
