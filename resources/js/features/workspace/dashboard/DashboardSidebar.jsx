import { useRef } from 'react';

import Tooltip from '@/components/ui/Tooltip';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import SidebarFlyout from '@/features/workspace/navigation/SidebarFlyout';

function SidebarButton({ item, active, onClick, buttonRef }) {
    return (
        <Tooltip
            content={item.label}
            side="right"
            portal
            className="flex"
            tooltipClassName="z-[90] rounded-[6px] bg-[#23314c] px-3 py-2 text-[12px] font-medium shadow-[0_8px_18px_rgba(15,23,42,0.18)]"
        >
            <button
                ref={buttonRef}
                type="button"
                onClick={onClick}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] border p-[7px] transition sm:h-[44px] sm:w-[44px] sm:p-2 ${
                    active
                        ? 'border-[#8292b0] bg-[rgba(71,84,108,0.92)] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                        : 'border-transparent bg-transparent text-white/95 hover:bg-white/10'
                }`.trim()}
                aria-label={item.label}
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
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center gap-2.5 rounded-[8px] border px-2.5 py-2 text-left transition ${
                active
                    ? 'border-[#7aa2d5] bg-[#e8f2ff] text-[#1f4f96]'
                    : 'border-[#d7ddea] bg-white text-[#33415c] hover:bg-[#f6f9fe]'
            }`.trim()}
        >
            <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] ${
                    active ? 'bg-[#d7e8ff] text-[#1f5ca9]' : 'bg-[#edf3fb] text-[#5c6782]'
                }`.trim()}
            >
                <NavigationIcon type={item.icon} className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium">{item.label}</span>
            </span>
        </button>
    );
}

function MobilePanelItemButton({ item, onSelect }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(item)}
            className="flex w-full items-start gap-2.5 rounded-[8px] border border-[#d7ddea] bg-white px-2.5 py-2.5 text-left transition hover:bg-[#f8fbff]"
        >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#edf3fb] text-[#4e678f]">
                <NavigationIcon type={item.icon} className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-medium leading-4.5 text-[#22304a]">{item.label}</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-[#7b849c]">
                    {item.implemented === false ? 'Belum diimplementasikan penuh' : 'Buka halaman modul'}
                </span>
            </span>
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
}) {
    const railRef = useRef(null);
    const buttonRefs = useRef({});
    const activeItem = sidebar.items.find((item) => item.id === activePanelId) ?? null;
    const activeButtonElement = activePanelId ? buttonRefs.current[activePanelId] ?? null : null;

    return (
        <div
            className="relative z-30 flex w-full flex-col lg:fixed lg:left-0 lg:w-[58px] lg:flex-row lg:self-stretch"
            style={
                desktopTopOffset
                    ? {
                          top: `${desktopTopOffset}px`,
                          height: `calc(100vh - ${desktopTopOffset}px)`,
                      }
                    : undefined
            }
        >
            {mobileMenuOpen ? (
                <div className="border-b border-[#d7ddea] bg-[rgba(243,246,251,0.96)] px-2 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.08)] lg:hidden">
                    <div className="rounded-[10px] border border-[#d7ddea] bg-white p-2 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                        <div className="flex items-center justify-between gap-3 border-b border-[#edf0f6] pb-2">
                            <div className="min-w-0">
                                <p className="text-[11px] uppercase tracking-[0.08em] text-[#8a93a8]">Menu Workspace</p>
                                <h3 className="truncate text-[14px] font-medium text-[#26324a]">
                                    {activeItem?.label ?? 'Pilih kelompok menu'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={onCloseMobileMenu}
                                className="shrink-0 rounded-[6px] px-2 py-1 text-[11px] font-medium text-[#4569a4] transition hover:bg-[#eef4fd]"
                            >
                                Tutup
                            </button>
                        </div>

                        <div className="mt-2 grid gap-2">
                            {sidebar.items.map((item) => (
                                <MobileModuleButton
                                    key={item.id}
                                    item={item}
                                    active={activePanelId === item.id}
                                    onSelect={onTogglePanel}
                                />
                            ))}
                        </div>
                    </div>

                    {activeItem ? (
                        <div className="mt-2 rounded-[10px] border border-[#d7ddea] bg-white px-2.5 py-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                            <div className="flex items-center justify-between gap-3 border-b border-[#edf0f6] pb-2">
                                <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-[0.08em] text-[#8a93a8]">Submenu</p>
                                    <h3 className="truncate text-[14px] font-medium text-[#26324a]">
                                        {activeItem.panel?.title ?? activeItem.label}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClosePanel}
                                    className="shrink-0 rounded-[6px] px-2 py-1 text-[11px] font-medium text-[#4569a4] transition hover:bg-[#eef4fd]"
                                >
                                    Tutup
                                </button>
                            </div>

                            <div className="mt-2 grid gap-2">
                                {(activeItem.panel?.items ?? []).map((item) => (
                                    <MobilePanelItemButton key={item.id} item={item} onSelect={onSelectPanelItem} />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}

            <div
                ref={railRef}
                className="relative z-30 hidden w-full shrink-0 gap-1.5 overflow-x-auto overflow-y-hidden border-b border-[#18325e] bg-[linear-gradient(90deg,#0d2246_0%,#1a3769_40%,#2d4c88_100%)] px-1.5 py-1.5 lg:flex lg:h-full lg:w-[58px] lg:flex-col lg:items-center lg:justify-start lg:overflow-x-hidden lg:overflow-y-auto lg:border-b-0 lg:border-r lg:pt-3"
            >
                {sidebar.items.map((item) => (
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
                    open={Boolean(activeItem)}
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
