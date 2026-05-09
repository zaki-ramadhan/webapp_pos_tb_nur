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
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-[#3f4b66] transition hover:bg-[#eef3fb] disabled:cursor-not-allowed disabled:opacity-45 ${disabled ? '' : 'cursor-pointer'}`.trim()}
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
    isRefreshing = false,
    refreshError = null,
}) {
    const [actionsOpen, setActionsOpen] = useState(false);
    const actionsButtonRef = useRef(null);

    return (
        <Panel className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#d7ddea] bg-white/98 ${widget.heightClass}`.trim()}>
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#edf0f6] px-3 py-3 sm:flex-nowrap sm:items-center sm:px-4">
                <div className="min-w-0 flex-1">
                    <h3 className="break-words text-[13px] font-medium text-[#434a65] sm:text-[14px] md:text-[15px]">{widget.title}</h3>
                    {widget.subtitle ? (
                        <p className="mt-1 break-words text-[12px] text-[#7c839b] md:text-[13px]">{widget.subtitle}</p>
                    ) : null}
                    {refreshError ? <p className="mt-1 text-[11px] text-[#b45309] md:text-[12px]">{refreshError}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                    <WidgetHeaderAction
                        label={isRefreshing ? `Memuat ulang widget ${widget.title}` : `Refresh widget ${widget.title}`}
                        onClick={() => onRefresh?.(widget)}
                        disabled={isRefreshing}
                    >
                        <RefreshIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-[#2353a0]' : ''}`.trim()} />
                    </WidgetHeaderAction>
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
                                className="text-[12px] font-medium text-[#1f2536] md:text-[13px]"
                            >
                                Ubah judul widget
                            </DropdownMenuItem>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">{children}</div>
        </Panel>
    );
}
