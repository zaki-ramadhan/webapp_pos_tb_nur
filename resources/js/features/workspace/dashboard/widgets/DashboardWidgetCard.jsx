import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import Panel from '@/components/ui/Panel';
import { KebabIcon, PencilIcon, RefreshIcon } from '@/features/workspace/shared/Icons';

function WidgetHeaderAction({ label, onClick, disabled = false, buttonRef = null, children }) {
    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-tab-active-text transition hover:bg-workspace-hover-bg disabled:cursor-not-allowed disabled:opacity-45 ${disabled ? '' : 'cursor-pointer'}`.trim()}
            aria-label={label}
        >
            {children}
        </button>
    );
}

export default function DashboardWidgetCard({
    widget,
    children,
    onRefresh,
    onRename,
    onRemove,
    isRefreshing = false,
    refreshError = null,
    showRefresh = false,
    canRemove = true,
}) {
    const [actionsOpen, setActionsOpen] = useState(false);
    const actionsButtonRef = useRef(null);

    return (
        <Panel className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-chart-border bg-white/98 ${widget.heightClass}`.trim()}>
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-table-row-border px-3 py-3 sm:flex-nowrap sm:items-center sm:px-4">
                <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-medium text-tab-active-text">{widget.title}</h3>
                    {widget.subtitle ? (
                        <p className="mt-1 break-words text-sm text-text-light">{widget.subtitle}</p>
                    ) : null}
                    {refreshError ? <p className="mt-1 text-sm text-orange-880">{refreshError}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                    {showRefresh && (
                        <WidgetHeaderAction
                            label={isRefreshing ? `Memuat ulang widget ${widget.title}` : `Refresh widget ${widget.title}`}
                            onClick={() => onRefresh?.(widget)}
                            disabled={isRefreshing}
                        >
                            <RefreshIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-brand-blue' : ''}`} />
                        </WidgetHeaderAction>
                    )}
                    <div className="relative">
                        <WidgetHeaderAction
                            label={`Opsi widget ${widget.title}`}
                            onClick={() => setActionsOpen((currentValue) => !currentValue)}
                            buttonRef={actionsButtonRef}
                        >
                            <KebabIcon />
                        </WidgetHeaderAction>
                        <DropdownMenu
                            open={actionsOpen}
                            onClose={() => setActionsOpen(false)}
                            anchorRef={actionsButtonRef}
                            widthClassName="w-[180px]"
                            className="z-[60]"
                        >
                            <DropdownMenuItem
                                onClick={() => {
                                    setActionsOpen(false);
                                    onRename?.(widget);
                                }}
                                icon={<PencilIcon />}
                                className="text-sm font-medium text-brand-darker"
                            >
                                Ubah judul widget
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setActionsOpen(false);
                                    onRemove?.(widget);
                                }}
                                disabled={!canRemove}
                                title={!canRemove ? 'Minimal harus tersisa 1 widget' : undefined}
                                icon={
                                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                    </svg>
                                }
                                className={`text-sm font-medium text-red-350 animate-fade-in ${!canRemove ? 'opacity-40' : ''}`}
                            >
                                Hapus widget
                            </DropdownMenuItem>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">{children}</div>
        </Panel>
    );
}
