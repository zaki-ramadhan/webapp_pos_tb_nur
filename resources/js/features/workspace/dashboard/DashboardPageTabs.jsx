import { forwardRef, useEffect, useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon, CloseIcon, CogIcon, IdeaIcon, ViewModeIcon } from '@/features/workspace/shared/Icons';
import SecondaryTabs from '@/features/workspace/shared/SecondaryTabs';
import { renderTabLabel } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { getPagePath } from '@/features/workspace/dashboard/workspaceUrls';

const PrimaryTab = forwardRef(function PrimaryTab({ tab, active, onSelect, onClose }, ref) {
    const spacingClassName = tab.closable
        ? 'gap-1 pl-2.5 pr-1.5 sm:gap-1.5 sm:pl-3 sm:pr-1.5 md:gap-2 md:pl-4 md:pr-2'
        : 'gap-1.5 px-3 sm:gap-2 sm:px-3.5 md:gap-2.5 md:px-4.5';

    return (
        <div
            ref={ref}
            role="tab"
            aria-selected={active}
            aria-label={tab.label}
            tabIndex={0}
            onClick={() => onSelect(tab.id)}
            className={`relative -mb-[2px] inline-flex h-7.5 items-center rounded-t-[5px] text-xs leading-normal cursor-pointer select-none transition sm:h-8 sm:text-sm md:h-8.75 md:text-base max-w-[140px] sm:max-w-[180px] md:max-w-[220px] ${spacingClassName} ${
                active
                    ? 'z-10 border-[2px] border-brand-primary bg-brand-primary font-normal text-white'
                    : 'border-x border-t border-tab-active-border-x bg-tab-primary-inactive-bg text-tab-primary-inactive-text hover:bg-tab-primary-inactive-hover-bg font-normal'
            } shrink-0 whitespace-nowrap`.trim()}
        >
            <span className="inline-flex h-full items-center min-w-0 max-w-[90px] sm:max-w-[120px] md:max-w-[150px]">
                <span className="block w-full truncate py-1">{renderTabLabel(tab.label, active, true)}</span>
            </span>
            {tab.closable ? (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-[3px] sm:h-6 sm:w-6 transition-colors ${
                        active ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                    }`.trim()}
                    aria-label={`Tutup tab ${tab.label}`}
                >
                    <CloseIcon className="h-4 w-4" strokeWidth={2.6} />
                </button>
            ) : null}
        </div>
    );
});

function OverflowTabList({ tabs, activePage, onSelect, onClose }) {
    const listRef = useRef(null);
    const activeItemRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        let timeoutId;
        const scrollToActive = () => {
            if (cancelled || !activeItemRef.current || !listRef.current) return;
            const container = listRef.current;
            const item = activeItemRef.current;

            const containerRect = container.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();

            if (containerRect.height === 0 || itemRect.height === 0) {
                timeoutId = setTimeout(scrollToActive, 30);
                return;
            }

            const itemTopRelativeToContainer = itemRect.top - containerRect.top;
            const itemBottomRelativeToContainer = itemRect.bottom - containerRect.top;
            const buffer = 8;

            if (itemTopRelativeToContainer < buffer) {
                container.scrollTo({
                    top: Math.max(0, container.scrollTop + itemTopRelativeToContainer - buffer),
                    behavior: 'smooth',
                });
            } else if (itemBottomRelativeToContainer > containerRect.height - buffer) {
                container.scrollTo({
                    top: container.scrollTop + (itemBottomRelativeToContainer - containerRect.height) + buffer,
                    behavior: 'smooth',
                });
            }
        };

        const frameId = requestAnimationFrame(scrollToActive);
        return () => {
            cancelled = true;
            cancelAnimationFrame(frameId);
            clearTimeout(timeoutId);
        };
    }, [activePage?.id, tabs]);

    return (
        <div
            ref={listRef}
            className="max-h-[280px] overflow-y-auto py-1 [scrollbar-width:thin] [scrollbar-color:#c7d0e0_transparent]"
        >
            {tabs.map((tab) => {
                const active = activePage?.id === tab.id;
                return (
                    <div
                        key={tab.id}
                        ref={active ? activeItemRef : null}
                        className={`group flex w-full items-center justify-between text-sm transition ${
                            active
                                ? 'border-y border-[#9dc2ec] bg-[#e8f2fc]'
                                : 'border-y border-transparent hover:bg-brand-blue-lightest'
                        }`.trim()}
                    >
                        <button
                            type="button"
                            onClick={() => onSelect(tab.id)}
                            className={`flex-1 truncate px-3 py-2 text-left text-sm leading-5 font-normal ${
                                active ? 'text-black font-medium' : 'text-abc-label-dark'
                            }`.trim()}
                        >
                            {renderTabLabel(tab.label, active, false)}
                        </button>
                        {tab.closable ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose(tab.id);
                                }}
                                className={`mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] transition-colors ${
                                    active
                                        ? 'text-slate-600 hover:text-red-600'
                                        : 'text-slate-400 hover:text-slate-700'
                                }`}
                                aria-label={`Tutup tab ${tab.label}`}
                            >
                                <CloseIcon className="h-3.5 w-3.5" strokeWidth={2.6} />
                            </button>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

function PageTabOverflowMenu({ tabs, activePage, onSelectPage, onClosePage, onCloseAllPages }) {
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
                className="inline-flex h-7.5 min-w-[40px] items-center justify-center gap-1 border-l border-tab-overflow-border px-2 text-xs font-normal text-text-medium transition hover:bg-ui-bg-hover sm:h-8 sm:min-w-[44px] sm:px-2.5 sm:text-sm md:min-w-[46px] md:px-3 md:text-sm"
                aria-label={`Buka daftar ${tabs.length} tab halaman`}
                aria-expanded={open}
            >
                <span className="font-normal">{tabs.length}</span>
                <ChevronDownIcon className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`.trim()} />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                maxHeightLimit={380}
                widthClassName="w-[min(18rem,calc(100vw-1rem))]"
                className="z-[60]"
                noPadding
            >
                <OverflowTabList
                    tabs={tabs}
                    activePage={activePage}
                    onSelect={handleSelect}
                    onClose={onClosePage}
                />
                {tabs.length > 1 && onCloseAllPages ? (
                    <div className="border-t border-slate-200 bg-slate-50 p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onCloseAllPages();
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-[4px] px-3 py-2 text-xs sm:text-sm text-slate-700 hover:text-red-600 hover:bg-slate-100 font-normal transition cursor-pointer"
                        >
                            <CloseIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                            <span className="font-normal">Tutup Semua Halaman</span>
                        </button>
                    </div>
                ) : null}
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
    onCloseAllPages,
    level2Tabs = [],
    level2Actions = [],
    activeLevel2TabId = null,
    onSelectLevel2Tab,
    onCloseLevel2Tab,
}) {
    const scrollContainerRef = useRef(null);
    const activeTabRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        const scrollToActive = () => {
            if (cancelled || !activeTabRef.current || !scrollContainerRef.current) {
                return;
            }
            const container = scrollContainerRef.current;
            const tab = activeTabRef.current;

            const containerRect = container.getBoundingClientRect();
            const tabRect = tab.getBoundingClientRect();

            if (containerRect.width === 0 || tabRect.width === 0) {
                requestAnimationFrame(scrollToActive);
                return;
            }

            const tabLeftRelativeToContainer = tabRect.left - containerRect.left;
            const tabRightRelativeToContainer = tabRect.right - containerRect.left;
            const buffer = 16;

            if (tabLeftRelativeToContainer < buffer) {
                container.scrollTo({
                    left: Math.max(0, container.scrollLeft + tabLeftRelativeToContainer - buffer),
                    behavior: 'smooth',
                });
            } else if (tabRightRelativeToContainer > containerRect.width - buffer) {
                container.scrollTo({
                    left: container.scrollLeft + (tabRightRelativeToContainer - containerRect.width) + buffer,
                    behavior: 'smooth',
                });
            }
        };

        const frameId = requestAnimationFrame(scrollToActive);
        return () => {
            cancelled = true;
            cancelAnimationFrame(frameId);
        };
    }, [activePage?.id, tabs]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) {
            return;
        }

        const handleWheel = (e) => {
            if (container.scrollWidth > container.clientWidth && e.deltaY !== 0 && !e.shiftKey) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    const hasLevel2 = Boolean(
        (activePage?.id !== 'dashboard' && activePage?.showViewIndicator && !level2Tabs.length) ||
        (activePage?.id !== 'dashboard' && level2Tabs.length)
    );

    return (
        <div className={`bg-ui-bg-panel pt-[3px] ${hasLevel2 ? 'border-b border-ui-border-medium' : ''}`.trim()}>
            <div className="border-b border-brand-primary bg-ui-bg-panel-light px-1 pt-0 sm:px-1.5">
                <div className="flex items-stretch justify-between gap-1 sm:gap-2">
                    <div
                        ref={scrollContainerRef}
                        className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        <div className="flex w-max min-w-full items-end gap-[5px]">
                            {tabs.map((tab) => (
                                <PrimaryTab
                                    key={tab.id}
                                    ref={activePage?.id === tab.id ? activeTabRef : null}
                                    tab={tab}
                                    active={activePage?.id === tab.id}
                                    onSelect={onSelectPage}
                                    onClose={onClosePage}
                                />
                            ))}
                        </div>
                    </div>

                    <PageTabOverflowMenu tabs={tabs} activePage={activePage} onSelectPage={onSelectPage} onClosePage={onClosePage} onCloseAllPages={onCloseAllPages} />
                </div>
            </div>

            {activePage?.id !== 'dashboard' && activePage?.showViewIndicator && !level2Tabs.length ? (
                <div className="bg-ui-bg-panel-lighter px-1 pb-0 pt-0.5 sm:px-1.5">
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <div
                            aria-disabled="true"
                            className="relative -mb-px inline-flex h-9 cursor-default select-none items-center rounded-t-[5px] border-x border-t-2 border-b-0 border-l-disabled-border border-r-disabled-border border-t-disabled-border-t bg-disabled-bg px-3 text-disabled-text sm:h-9.5 sm:px-4"
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
                <div className="bg-ui-bg-panel-lighter px-1 pb-0 pt-0.5 sm:px-1.5">
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
