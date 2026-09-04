import { useEffect, useState } from 'react';
import { RefreshCw, GripVertical } from 'lucide-react';

import Panel from '@/components/ui/Panel';
import WidgetLoadingOverlay from './components/WidgetLoadingOverlay';

function WidgetHeaderAction({ label, onClick, disabled = false, children }) {
    return (
        <button
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
    isRefreshing = false,
    refreshError = null,
    showRefresh = false,
    dragHandleProps = {},
}) {
    const [isInternalLoading, setIsInternalLoading] = useState(false);

    useEffect(() => {
        const handleLoadingState = (e) => {
            const { widgetId, isLoading } = e.detail || {};
            if (widgetId === 'all' || widgetId === widget.id) {
                setIsInternalLoading(Boolean(isLoading));
            }
        };
        window.addEventListener('pos:widget-loading-state', handleLoadingState);
        return () => window.removeEventListener('pos:widget-loading-state', handleLoadingState);
    }, [widget.id]);

    const isWidgetLoading = isRefreshing || isInternalLoading || Boolean(widget?.isDeferredLoading);
    const widgetKey = widget.sourceWidgetId ?? widget.id;

    const isEmptyData =
        (widget.type === 'abc-analysis' && (!widget.topItems || widget.topItems.length === 0)) ||
        (widget.type === 'apriori-analysis' && (!widget.rules || widget.rules.length === 0)) ||
        (widget.id === 'integrated-analysis' && (!widget.rules || widget.rules.length === 0));

    const baseHeightClass = isEmptyData ? 'min-h-0 h-auto' : widget.heightClass;

    const resolvedHeightClass = (widget.type === 'line' || widget.type === 'cash-availability') && baseHeightClass === 'min-h-[310px]'
        ? 'min-h-[260px]'
        : widget.type === 'summary'
            ? 'min-h-[210px]'
            : baseHeightClass;

    const isAbcApriori = widget.id === 'integrated-analysis' || widget.type === 'abc-apriori';
    const headerPaddingClass = isAbcApriori ? 'py-3' : 'py-2';

    return (
        <Panel className={`relative z-[1] hover:z-[5] transition-all duration-150 flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-chart-border bg-white/98 shadow-none ${resolvedHeightClass}`.trim()}>
            <div className={`flex flex-wrap items-start justify-between gap-2 border-b border-table-row-border px-3 ${headerPaddingClass} sm:flex-nowrap sm:items-center sm:px-4`}>
                <div className="min-w-0 flex-1 flex items-center">
                    <div
                        {...dragHandleProps}
                        className="mr-2 flex shrink-0 cursor-grab items-center text-tab-active-text opacity-45 hover:opacity-100 active:cursor-grabbing py-1 px-0.5"
                        aria-label="Seret untuk mengubah urutan widget"
                    >
                        <GripVertical className="h-4 w-4 fill-current text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="break-words text-sm lg:text-base font-medium text-tab-active-text">
                                {widget.title === 'Beban Perusahaan' ? 'Beban Toko' : widget.title}
                            </h3>
                        </div>
                        {widget.subtitle ? (
                            <p className={`mt-1 break-words text-sm ${widgetKey === 'sales-summary' || widgetKey === 'purchase-summary' || widget.type === 'summary' ? 'text-text-light' : 'text-black'}`}>{widget.subtitle}</p>
                        ) : null}
                        {refreshError ? <p className="mt-1 text-sm text-orange-880">{refreshError}</p> : null}
                    </div>
                </div>
                {showRefresh && (
                    <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                        <WidgetHeaderAction
                            label={isRefreshing ? `Memuat ulang widget ${widget.title}` : `Refresh widget ${widget.title}`}
                            onClick={() => onRefresh?.(widget)}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 text-slate-500 ${isRefreshing ? 'animate-spin text-brand-blue' : ''}`} />
                        </WidgetHeaderAction>
                    </div>
                )}
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
                <WidgetLoadingOverlay isVisible={isWidgetLoading} />
                {children}
            </div>
        </Panel>
    );
}
