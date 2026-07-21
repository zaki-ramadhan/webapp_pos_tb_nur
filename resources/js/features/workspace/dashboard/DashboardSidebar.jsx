import { useRef } from 'react';

import Tooltip from '@/components/ui/Tooltip';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import SidebarFlyout from '@/features/workspace/navigation/SidebarFlyout';
import implementedWorkspacePageIds from '@/features/workspace/shared/implementedWorkspacePageIds';
import UserAvatar from '@/features/workspace/shared/UserAvatar';
import {
    isWorkspacePageInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';
import { toneClasses } from '@/features/workspace/navigation/NavigationTile';

const DISABLED_SIDEBAR_GROUP_IDS = new Set(['fixed-assets', 'tax-center']);

function getVisiblePanelItems(item, preferences) {
    return (item.panel?.items ?? []).filter((panelItem) => {
        const isInactive = isWorkspacePageInactive(panelItem.id, preferences);
        const isImplemented = panelItem.implemented !== false || implementedWorkspacePageIds.has(panelItem.id);
        return !isInactive && isImplemented;
    });
}

function normalizeSidebarItem(item, preferences) {
    const visiblePanelItems = getVisiblePanelItems(item, preferences);
    const isForcedDisabled = DISABLED_SIDEBAR_GROUP_IDS.has(item.id);

    return {
        ...item,
        disabled: isForcedDisabled || visiblePanelItems.length === 0,
        panel: {
            ...item.panel,
            items: visiblePanelItems,
        },
    };
}

function SidebarButton({ item, active, onClick, buttonRef }) {
    return (
        <Tooltip
            content={item.disabled ? `${item.label} · Nonaktif` : item.label}
            side="right"
            portal
            className="flex"
            tooltipClassName="z-[90] rounded-[6px] bg-abc-label-dark px-3 py-2 text-xs font-medium shadow-sidebar-tooltip"
        >
            <button
                ref={buttonRef}
                type="button"
                onClick={onClick}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] border p-[7px] transition sm:h-[44px] sm:w-[44px] sm:p-2 ${
                    item.disabled
                        ? 'cursor-not-allowed border-transparent bg-transparent text-white/18 opacity-45'
                        : active
                        ? 'border-text-light bg-sidebar-item-active-bg text-white shadow-inset-border-white'
                        : 'border-transparent bg-transparent text-white/95 hover:bg-white/10'
                }`.trim()}
                aria-label={item.label}
                aria-disabled={item.disabled}
            >
                <NavigationIcon type={item.icon} className="h-[26px] w-[26px] sm:h-[28px] sm:w-[28px]" />
            </button>
        </Tooltip>
    );
}

function MobileModuleButton({ item, active, onSelect }) {
    return (
        <button
            type="button"
            onClick={() => {
                if (!item.disabled) {
                    onSelect(item.id);
                }
            }}
            className={`flex w-full items-center gap-2.5 rounded-[8px] border px-2.5 py-2 text-left transition ${
                item.disabled
                    ? 'cursor-not-allowed border-chart-grid-light bg-brand-blue-lightest text-tab-inactive-border-l opacity-70'
                    : active
                    ? 'border-brand-blue-border bg-brand-blue-light text-brand-blue-hover font-semibold'
                    : 'border-chart-border bg-white text-tab-active-text hover:bg-ui-bg-hover'
            }`.trim()}
            aria-disabled={item.disabled}
        >
            <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] ${
                    item.disabled
                        ? 'bg-table-row-border text-tab-inactive-border-l'
                        : active
                          ? 'bg-ui-border-light text-brand-blue-dark'
                          : 'bg-info-bg text-tab-view-active-text'
                }`.trim()}
            >
                <NavigationIcon type={item.icon} className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{item.label}</span>
            </span>
            {item.disabled ? (
                <span className="shrink-0 rounded-full bg-tab-view-active-border-t px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-text-light">
                    Nonaktif
                </span>
            ) : (
                <span className={`text-text-light transition-transform duration-200 ${active ? 'rotate-180 text-brand-blue-dark' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
            )}
        </button>
    );
}

function MobilePanelItemButton({ item, onSelect, preferences }) {
    const isInactive = isWorkspacePageInactive(item.id, preferences);
    const isImplemented = item.implemented !== false || implementedWorkspacePageIds.has(item.id);
    const statusLabel = isInactive
        ? WORKSPACE_INACTIVE_HINT
        : !isImplemented
          ? 'Belum diimplementasikan penuh'
          : 'Buka halaman modul';

    const tone = toneClasses[item.tone] ?? toneClasses.blue;
    const iconBgClass = isInactive
        ? 'bg-disabled-bg'
        : isImplemented
          ? tone.iconBg
          : 'bg-table-row-border';
    const iconTextClass = isInactive
        ? 'text-text-light'
        : isImplemented
          ? tone.iconText
          : 'text-text-inactive';

    return (
        <button
            type="button"
            onClick={() => {
                if (!isInactive && isImplemented) {
                    onSelect(item);
                }
            }}
            className={`flex w-full items-start gap-2.5 rounded-[8px] border px-2.5 py-2.5 text-left transition ${
                isInactive
                    ? 'cursor-not-allowed border-disabled-bg bg-ui-bg-hover opacity-80 saturate-0'
                    : isImplemented
                      ? 'border-chart-border bg-white hover:bg-ui-bg-hover'
                      : 'cursor-not-allowed border-chart-grid-light bg-ui-bg-hover opacity-80'
            }`.trim()}
            aria-disabled={isInactive || !isImplemented}
        >
            <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] ${iconBgClass} ${iconTextClass}`.trim()}>
                <NavigationIcon type={item.icon} className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block text-xs font-medium leading-4.5 ${isInactive ? 'text-tab-inactive-text' : isImplemented ? 'text-text-dark' : 'text-text-light'}`}>
                    {item.label}
                </span>
                <span className={`mt-0.5 block text-[11px] leading-4 ${isInactive ? 'text-text-light' : isImplemented ? 'text-text-light' : 'text-tab-inactive-border-l'}`}>
                    {statusLabel}
                </span>
            </span>
            {isInactive ? (
                <span className="shrink-0 rounded-full bg-disabled-bg px-1.5 py-0.5 text-[10px] font-semibold text-tab-inactive-text">
                    {WORKSPACE_INACTIVE_BADGE_LABEL}
                </span>
            ) : null}
        </button>
    );
}

export default function DashboardSidebar({
    sidebar,
    activePanelId,
    onTogglePanel,
    onClosePanel,
    onSelectPanelItem,
    desktopTopOffset = 0,
    mobileMenuOpen = false,
    onCloseMobileMenu,
    preferences = {},
    user = null,
}) {
    const railRef = useRef(null);
    const buttonRefs = useRef({});
    const sidebarItems = sidebar.items.map(item => normalizeSidebarItem(item, preferences)).filter((item) => !item.disabled);
    const activeItem = sidebarItems.find((item) => item.id === activePanelId && !item.disabled) ?? null;
    const activeButtonElement = activePanelId ? buttonRefs.current[activePanelId] ?? null : null;

    const handleCloseMobile = () => {
        onClosePanel();
        onCloseMobileMenu();
    };

    return (
        <div
            className="relative z-30 flex w-full flex-col lg:fixed lg:left-0 lg:w-[58px] lg:flex-row lg:self-stretch"
            style={
                desktopTopOffset && typeof window !== 'undefined' && window.innerWidth >= 1024
                    ? {
                          top: `${desktopTopOffset}px`,
                          height: `calc(100vh - ${desktopTopOffset}px)`,
                      }
                    : undefined
            }
        >
            {mobileMenuOpen ? (
                <>
                    <style>{`
                        @keyframes slideUp {
                            from {
                                opacity: 0;
                                transform: translateY(16px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        .animate-slide-up {
                            animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                        .accordion-content {
                            transition: max-height 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out, visibility 0.2s;
                            max-height: 0;
                            opacity: 0;
                            overflow: hidden;
                            visibility: hidden;
                        }
                        .accordion-content.expanded {
                            max-height: 500px;
                            opacity: 1;
                            visibility: visible;
                        }
                    `}</style>

                    <div
                        className="fixed inset-0 z-[60] bg-white px-5 pb-6 pt-5 lg:hidden flex flex-col animate-slide-up"
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-table-row-border pb-4 mb-4 shrink-0">
                            <h3 className="text-base font-bold text-brand-darker">
                                Pilih Menu
                            </h3>
                            <button
                                type="button"
                                onClick={handleCloseMobile}
                                className="shrink-0 rounded-full p-2 text-text-light hover:bg-ui-bg-panel hover:text-brand-darker transition"
                                aria-label="Tutup Menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-5.5 w-5.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {user && (
                            <div className="flex items-center gap-3 bg-ui-bg-hover rounded-[10px] p-3 mb-4 shrink-0 border border-table-row-border">
                                <UserAvatar
                                    name={user.name}
                                    imageUrl={user.avatarUrl}
                                    className="h-10 w-10 bg-bg-workspace-light text-sm font-semibold text-tab-primary-inactive-text"
                                    showStatusIndicator={false}
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-brand-darker">{user.name}</p>
                                    <p className="truncate text-xs font-medium text-text-light">{user.role || 'Pengguna'}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
                            <div className="flex flex-col gap-2.5 pb-4">
                                {sidebarItems.map((item) => {
                                    const isExpanded = activePanelId === item.id;
                                    return (
                                        <div key={item.id} className="flex flex-col">
                                            <MobileModuleButton
                                                item={item}
                                                active={isExpanded}
                                                onSelect={onTogglePanel}
                                            />
                                            
                                            <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
                                                <div className="mt-1.5 pl-4 border-l-2 border-slate-100 flex flex-col gap-1.5 ml-4 pb-2">
                                                    {(item.panel?.items ?? []).map((panelItem) => (
                                                        <MobilePanelItemButton
                                                            key={panelItem.id}
                                                            item={panelItem}
                                                            onSelect={(selectedItem) => {
                                                                onSelectPanelItem(selectedItem);
                                                                handleCloseMobile();
                                                            }}
                                                            preferences={preferences}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            ) : null}

            <div
                ref={railRef}
                className="relative z-30 hidden w-full shrink-0 gap-1.5 overflow-x-auto overflow-y-hidden border-b border-blue-900 bg-[linear-gradient(90deg,#0d2246_0%,#1a3769_40%,#4E6188_100%)] px-1.5 py-1.5 lg:flex lg:h-full lg:w-[58px] lg:flex-col lg:items-center lg:justify-start lg:overflow-x-hidden lg:overflow-y-auto lg:border-b-0 lg:border-r lg:pt-3"
            >
                {sidebarItems.map((item) => (
                    <SidebarButton
                        key={item.id}
                        item={item}
                        active={activePanelId === item.id}
                        buttonRef={(node) => {
                            if (node) {
                                buttonRefs.current[item.id] = node;
                                return;
                            }

                            delete buttonRefs.current[item.id];
                        }}
                        onClick={() => onTogglePanel(item.id)}
                    />
                ))}
            </div>

            <div className="hidden lg:block">
                <SidebarFlyout
                    open={Boolean(activeItem && activeItem.panel?.items?.length)}
                    onClose={onClosePanel}
                    title={activeItem?.panel?.title ?? ''}
                    items={activeItem?.panel?.items ?? []}
                    anchorRef={railRef}
                    activeAnchorElement={activeButtonElement}
                    onSelectItem={onSelectPanelItem}
                />
            </div>
        </div>
    );
}
