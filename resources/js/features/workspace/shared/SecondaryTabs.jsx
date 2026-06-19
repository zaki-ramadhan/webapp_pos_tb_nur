import { CloseIcon, ViewModeIcon } from '@/features/workspace/shared/Icons';
import { renderTabLabel } from '@/features/workspace/dashboard/WorkspaceDraftState';

export function SecondaryTab({ tab, active, onSelect, onClose }) {
    const isViewTab = tab.kind === 'view';
    const spacingClassName = tab.closable
        ? 'gap-1.5 pl-3 pr-1.5 md:gap-2 md:pl-4 md:pr-2'
        : 'gap-2 px-3.5 md:gap-2.5 md:px-4.5';
    const className = isViewTab
        ? active
            ? 'border-x-[1px] border-t-[3px] border-b-[2px] border-b-[#f2f2f2] -mb-[2px] border-tab-view-active-border-x border-t-tab-view-active-border-t bg-tab-view-active-bg font-normal text-tab-view-active-text'
            : 'border-l-[1px] border-r-[1px] border-t-[2px] border-b-0 -mb-px border-l-tab-view-inactive-border-l border-r-tab-view-inactive-border-r border-t-tab-view-inactive-border-t bg-tab-view-inactive-bg font-normal text-tab-view-inactive-text'
        : active
          ? 'border-l-[1px] border-r-[1px] border-t-[3px] border-b-[2px] border-b-[#f2f2f2] -mb-[2px] border-l-tab-active-border-x border-r-tab-active-border-x border-t-tab-active-border-t bg-tab-active-bg font-normal text-tab-active-text'
          : 'border-l-[1px] border-r-[1px] border-t-[2px] border-b-0 -mb-px border-l-tab-inactive-border-l border-r-tab-inactive-border-r border-t-tab-inactive-border-t bg-tab-inactive-bg font-normal text-tab-inactive-text';
    const closeButtonClassName = active
        ? 'text-current hover:bg-white/20'
        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70';

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
            className={`relative inline-flex h-7.5 shrink-0 items-center rounded-t-[5px] text-xs leading-normal whitespace-nowrap transition sm:h-8 sm:text-sm md:h-8.75 md:text-base max-w-[150px] sm:max-w-[190px] md:max-w-[230px] ${spacingClassName} ${className}`.trim()}
            aria-label={tab.ariaLabel ?? tab.label}
        >
            <span className="inline-flex h-full items-center min-w-0 max-w-[100px] sm:max-w-[130px] md:max-w-[160px]">
                {isViewTab ? <ViewModeIcon /> : <span className="block truncate py-1">{renderTabLabel(tab.label, active, false)}</span>}
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
                />
            ))}
        </div>
    );
}
