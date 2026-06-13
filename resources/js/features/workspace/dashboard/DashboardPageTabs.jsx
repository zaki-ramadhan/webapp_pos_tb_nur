import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon, CloseIcon, CogIcon, IdeaIcon, ViewModeIcon } from '@/features/workspace/shared/Icons';
import SecondaryTabs from '@/features/workspace/shared/SecondaryTabs';
import { renderTabLabel } from '@/features/workspace/dashboard/WorkspaceDraftState';

function PrimaryTab({ tab, active, onSelect, onClose }) {
    const spacingClassName = tab.closable
        ? 'gap-1 pl-2.5 pr-1.5 sm:gap-1.5 sm:pl-3 sm:pr-1.5 md:gap-2 md:pl-4 md:pr-2'
        : 'gap-1.5 px-3 sm:gap-2 sm:px-3.5 md:gap-2.5 md:px-4.5';

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
            className={`relative -mb-px inline-flex h-7.5 items-center rounded-t-[5px] border text-xs leading-normal transition sm:h-8 sm:text-sm md:h-8.75 md:text-base max-w-[140px] sm:max-w-[180px] md:max-w-[220px] ${spacingClassName} ${
                active
                    ? 'z-10 border-[2px] border-brand-primary bg-brand-primary font-medium text-white'
                    : 'border-tab-active-border-x bg-tab-primary-inactive-bg text-tab-primary-inactive-text hover:bg-tab-primary-inactive-hover-bg font-normal'
            } shrink-0 whitespace-nowrap`.trim()}
            aria-label={tab.label}
        >
            <span className="inline-flex h-full items-center min-w-0 max-w-[90px] sm:max-w-[120px] md:max-w-[150px]">
                <span className="block truncate py-1">{renderTabLabel(tab.label, active, true)}</span>
            </span>
            {tab.closable ? (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onClose(tab.id);
                    }}
                className={`inline-flex h-5 w-5 items-center justify-center rounded-[3px] sm:h-6 sm:w-6 ${
                        active ? 'text-white/95 hover:bg-white/15' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70'
                    }`.trim()}
                    aria-label={`Tutup tab ${tab.label}`}
                >
                    <CloseIcon className="h-4 w-4" strokeWidth={2.6} />
                </button>
            ) : null}
        </div>
    );
}

function PageTabOverflowMenu({ tabs, activePage, onSelectPage }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    function handleSelect(tabId) {
        onSelectPage(tabId);
        setOpen(false);
    }

    return (
        <div className="relative shrink-0 self-start">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((currentValue) => !currentValue)}
                className="inline-flex h-7.5 min-w-[40px] items-center justify-center gap-1 border-l border-tab-overflow-border px-2 text-xs text-text-medium transition hover:bg-ui-bg-hover sm:h-8 sm:min-w-[44px] sm:px-2.5 sm:text-sm md:min-w-[46px] md:px-3 md:text-sm"
                aria-label={`Buka daftar ${tabs.length} tab halaman`}
                aria-expanded={open}
            >
                <span className="font-medium">{tabs.length}</span>
                <ChevronDownIcon className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`.trim()} />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[min(18rem,calc(100vw-1rem))]"
                className="z-[60]"
                panelClassName="rounded-none border-tab-overflow-panel-border p-0 shadow-[0_8px_18px_rgba(15,23,42,0.14)]"
            >
                <div className="py-1">
                    {tabs.map((tab) => (
                        <DropdownMenuItem
                            key={tab.id}
                            onClick={() => handleSelect(tab.id)}
                            className={`rounded-none px-3 py-2 text-sm md:text-sm ${
                                activePage?.id === tab.id
                                    ? 'bg-brand-blue-lightest font-medium text-brand-blue-darker'
                                    : 'text-brand-dark'
                            }`.trim()}
                            contentClassName="truncate"
                        >
                            {renderTabLabel(tab.label, activePage?.id === tab.id, false)}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

function HeaderActionButton({ action }) {
    const icon =
        action.icon === 'idea'
            ? <IdeaIcon className="h-[18px] w-[18px]" />
            : <CogIcon className="h-[18px] w-[18px]" />;
    const toneClassName =
        action.tone === 'warning'
            ? 'border-warning-border bg-warning text-white'
            : 'border-brand-blue-border bg-white text-brand-blue';

    return (
        <button
            type="button"
            aria-label={action.label}
            title={action.label}
            className={`inline-flex h-[34px] w-[42px] items-center justify-center rounded-[4px] border ${toneClassName}`.trim()}
        >
            {icon}
        </button>
    );
}

export default function DashboardPageTabs({
    tabs,
    activePage,
    onSelectPage,
    onClosePage,
    level2Tabs = [],
    level2Actions = [],
    activeLevel2TabId = null,
    onSelectLevel2Tab,
    onCloseLevel2Tab,
}) {
    return (
        <div className="border-b border-ui-border-medium bg-ui-bg-panel pt-0.5 sm:pt-1">
            <div className="border-t border-ui-border-medium bg-ui-bg-panel-light px-1 pt-0.5 sm:px-1.5 sm:pt-1">
                <div className="flex items-stretch justify-between gap-1 sm:gap-2">
                    <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex w-max min-w-full items-end gap-[5px]">
                            {tabs.map((tab) => (
                                <PrimaryTab
                                    key={tab.id}
                                    tab={tab}
                                    active={activePage?.id === tab.id}
                                    onSelect={onSelectPage}
                                    onClose={onClosePage}
                                />
                            ))}
                        </div>
                    </div>

                    <PageTabOverflowMenu tabs={tabs} activePage={activePage} onSelectPage={onSelectPage} />
                </div>
            </div>

            {activePage?.id !== 'dashboard' && activePage?.showViewIndicator && !level2Tabs.length ? (
                <div className="border-t border-ui-border-medium bg-ui-bg-panel-lighter px-2 pb-0 pt-1.5 sm:px-2.5">
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <div
                            aria-disabled="true"
                            title="Mode daftar tidak dapat diubah pada halaman ini"
                            className="relative -mb-px inline-flex h-9 cursor-not-allowed items-center rounded-t-[5px] border-x border-t-2 border-b-0 border-l-disabled-border border-r-disabled-border border-t-disabled-border-t bg-disabled-bg px-3 text-disabled-text sm:h-9.5 sm:px-4"
                        >
                            <ViewModeIcon />
                        </div>

                        {level2Actions.filter(action => action.id !== 'tips' && action.icon !== 'idea' && action.id !== 'settings' && action.icon !== 'settings').length ? (
                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 pt-0.5">
                                {level2Actions.filter(action => action.id !== 'tips' && action.icon !== 'idea' && action.id !== 'settings' && action.icon !== 'settings').map((action) => (
                                    <HeaderActionButton key={action.id} action={action} />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {activePage?.id !== 'dashboard' && level2Tabs.length ? (
                <div className="border-t border-ui-border-medium bg-ui-bg-panel-lighter px-2 pb-0 pt-1.5 sm:px-2.5">
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <SecondaryTabs
                            tabs={level2Tabs}
                            activeTabId={activeLevel2TabId}
                            onSelectTab={onSelectLevel2Tab}
                            onCloseTab={onCloseLevel2Tab}
                            className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        />

                        {level2Actions.filter(action => action.id !== 'tips' && action.icon !== 'idea' && action.id !== 'settings' && action.icon !== 'settings').length ? (
                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 pt-0.5">
                                {level2Actions.filter(action => action.id !== 'tips' && action.icon !== 'idea' && action.id !== 'settings' && action.icon !== 'settings').map((action) => (
                                    <HeaderActionButton key={action.id} action={action} />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
