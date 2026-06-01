import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon, CloseIcon, CogIcon, IdeaIcon, ViewModeIcon } from '@/features/workspace/shared/Icons';
import SecondaryTabs from '@/features/workspace/shared/SecondaryTabs';

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
            className={`relative -mb-px inline-flex h-8.5 items-center rounded-t-[5px] border text-[12px] leading-none transition sm:h-9 sm:text-[13px] md:h-9.75 md:text-[15px] ${spacingClassName} ${
                active
                    ? 'z-10 border-[2px] border-[#ED3969] bg-[#ED3969] font-medium text-white'
                    : 'border-[#bcc3cf] bg-[#d9dcdf] font-normal text-[#596076] hover:bg-[#d1d5da]'
            } shrink-0 whitespace-nowrap`.trim()}
            aria-label={tab.label}
        >
            <span className="inline-flex h-full items-center">
                <span>{tab.label}</span>
            </span>
            {tab.closable ? (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onClose(tab.id);
                    }}
                className={`inline-flex h-5 w-5 items-center justify-center rounded-[3px] sm:h-6 sm:w-6 ${
                        active ? 'text-white/95 hover:bg-white/15' : 'text-[#6e768b] hover:bg-white/70'
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
                className="inline-flex h-8.5 min-w-[40px] items-center justify-center gap-1 border-l border-[#d7dbe4] px-2 text-[12px] text-[#5a6278] transition hover:bg-[#eceef2] sm:h-9 sm:min-w-[44px] sm:px-2.5 sm:text-[13px] md:min-w-[46px] md:px-3 md:text-[14px]"
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
                panelClassName="rounded-none border-[#d3d9e5] p-0 shadow-[0_8px_18px_rgba(15,23,42,0.14)]"
            >
                <div className="py-1">
                    {tabs.map((tab) => (
                        <DropdownMenuItem
                            key={tab.id}
                            onClick={() => handleSelect(tab.id)}
                            className={`rounded-none px-3 py-2 text-[13px] md:text-[14px] ${
                                activePage?.id === tab.id
                                    ? 'bg-[#f4f7fc] font-medium text-[#234b87]'
                                    : 'text-[#1f2436]'
                            }`.trim()}
                            contentClassName="truncate"
                        >
                            {tab.label}
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
            ? 'border-[#f4b038] bg-[#ffab13] text-white'
            : 'border-[#7aa2d5] bg-white text-[#2353a0]';

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
        <div className="border-b border-[#d4d8e1] bg-[#f3f4f6] pt-0.5 sm:pt-1">
            <div className="border-t border-[#d8dde7] bg-[#f2f2f3] px-1 pt-0.5 sm:px-1.5 sm:pt-1">
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
                <div className="border-t border-[#d8dbe2] bg-[#f6f6f7] px-2 pb-0 pt-1.5 sm:px-2.5">
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <div
                            aria-disabled="true"
                            title="Mode daftar tidak dapat diubah pada halaman ini"
                            className="relative -mb-px inline-flex h-9 cursor-not-allowed items-center rounded-t-[5px] border-x border-t-2 border-b-0 border-l-[#58bc32] border-r-[#58bc32] border-t-[#90e66a] bg-[#59c62e] px-3 text-white opacity-60 saturate-[0.85] sm:h-9.5 sm:px-4"
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
                <div className="border-t border-[#d8dbe2] bg-[#f6f6f7] px-2 pb-0 pt-1.5 sm:px-2.5">
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
