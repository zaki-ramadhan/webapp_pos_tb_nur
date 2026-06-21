import {
    AbcAnalysisWidget,
    AprioriAnalysisWidget,
    IntegratedAnalysisWidget,
} from '@/features/workspace/dashboard/DashboardAnalyticsWidgets';
import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';
import {
    ExpenseBreakdownMetric,
    LineTrendMetric,
    RingBreakdownMetric,
    SummaryMetric,
} from '@/features/workspace/dashboard/widgets/DashboardWidgetMetrics';
import {
    CashAvailabilityWidget,
    OrderStatusWidget,
    RecentActivityWidget,
    SalesTeamWidget,
    TopProductsWidget,
} from '@/features/workspace/dashboard/widgets/DashboardSupplementaryWidgets';

function WidgetEmptyState({ widget }) {
    const emptyState = widget.emptyState ?? {};

    return (
        <DashboardWidgetEmptyState
            title={emptyState.title ?? 'Belum ada data'}
            description={emptyState.description ?? 'Data widget akan muncul setelah tersedia.'}
        />
    );
}
function WidgetSkeleton({ widget }) {
    if (widget.type === 'line' || widget.type === 'cash-availability') {
        return (
            <div className="flex flex-1 flex-col gap-4 animate-pulse">
                <div className="h-6 w-1/4 rounded bg-slate-300" />
                <div className="flex-1 rounded-[6px] bg-slate-200 min-h-[180px] flex items-center justify-center">
                    <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
        );
    }

    if (widget.type === 'ring-breakdown' || widget.type === 'expense') {
        return (
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-6 animate-pulse">
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-8 border-slate-200 bg-transparent" />
                <div className="flex-1 w-full space-y-3">
                    <div className="h-4 w-3/4 rounded bg-slate-300" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="h-3 w-2/3 rounded bg-slate-200" />
                </div>
            </div>
        );
    }

    if (widget.type === 'sales-team' || widget.type === 'top-products' || widget.type === 'recent-activity') {
        return (
            <div className="flex flex-1 flex-col gap-3 animate-pulse">
                <div className="h-8 rounded bg-slate-200" />
                <div className="h-8 rounded bg-slate-200" />
                <div className="h-8 rounded bg-slate-200" />
                <div className="h-8 rounded bg-slate-200" />
            </div>
        );
    }

    if (widget.type === 'abc-analysis' || widget.type === 'apriori-analysis') {
        return (
            <div className="flex h-full min-h-0 flex-col gap-3 rounded-[8px] p-2 bg-slate-100 border border-slate-200 animate-pulse">
                <div className="grid grid-cols-3 gap-2">
                    <div className="h-16 rounded bg-slate-300" />
                    <div className="h-16 rounded bg-slate-300" />
                    <div className="h-16 rounded bg-slate-300" />
                </div>
                <div className="min-h-0 flex-1 space-y-3 pr-1">
                    <div className="h-14 rounded-lg bg-slate-200" />
                    <div className="h-14 rounded-lg bg-slate-200" />
                </div>
            </div>
        );
    }

    if (widget.type === 'integrated-analysis') {
        return (
            <div className="flex h-full min-h-0 flex-col gap-3 rounded-[8px] p-2 bg-slate-100 border border-slate-200 animate-pulse">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="h-16 rounded bg-slate-300" />
                    <div className="h-16 rounded bg-slate-300" />
                    <div className="h-16 rounded bg-slate-300" />
                    <div className="h-16 rounded bg-slate-300" />
                </div>
                <div className="min-h-0 flex-1 space-y-3 pr-1">
                    <div className="h-14 rounded-lg bg-slate-200" />
                    <div className="h-14 rounded-lg bg-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 animate-pulse">
            <div className="h-4 w-1/2 rounded bg-slate-300" />
            <div className="h-12 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
        </div>
    );
}

export default function DashboardWidgetBody({
    widget,
    analyticsDetailsExpanded,
    onToggleAnalyticsDetails,
    isLoading = false,
}) {
    if (isLoading) {
        return <WidgetSkeleton widget={widget} />;
    }

    if (widget.emptyState?.enabled) {
        return <WidgetEmptyState widget={widget} />;
    }

    if (widget.type === 'note') {
        return (
            <DashboardWidgetEmptyState
                title={widget.noteTitle ?? 'Belum ada data'}
                description={widget.noteDescription ?? widget.note ?? 'Data widget belum tersedia.'}
            />
        );
    }

    if (widget.type === 'blank') {
        return <WidgetEmptyState widget={widget} />;
    }

    if (widget.type === 'line') {
        return <LineTrendMetric widget={widget} />;
    }

    if (widget.type === 'ring-breakdown') {
        return (
            <RingBreakdownMetric
                percentage={widget.percentage}
                compare={widget.compare}
                legend={widget.legend}
                totalLabel={widget.totalLabel}
                totalValue={widget.totalValue}
                trend={widget.trend}
                growth={widget.growth}
            />
        );
    }

    if (widget.type === 'expense') {
        return (
            <ExpenseBreakdownMetric
                percentage={widget.percentage}
                compare={widget.compare}
                legend={widget.legend}
                totalValue={widget.totalValue}
                trend={widget.trend}
                growth={widget.growth}
            />
        );
    }

    if (widget.type === 'summary') {
        return <SummaryMetric sections={widget.sections ?? []} headline={widget.headline ?? {}} />;
    }

    if (widget.type === 'sales-team') {
        return <SalesTeamWidget widget={widget} />;
    }

    if (widget.type === 'top-products') {
        return <TopProductsWidget widget={widget} />;
    }

    if (widget.type === 'cash-availability') {
        return <CashAvailabilityWidget widget={widget} />;
    }

    if (widget.type === 'order-status') {
        return <OrderStatusWidget widget={widget} />;
    }

    if (widget.type === 'recent-activity') {
        return <RecentActivityWidget widget={widget} />;
    }

    if (widget.type === 'abc-analysis') {
        return <AbcAnalysisWidget widget={widget} expanded={analyticsDetailsExpanded} onToggle={onToggleAnalyticsDetails} />;
    }

    if (widget.type === 'apriori-analysis') {
        return <AprioriAnalysisWidget widget={widget} expanded={analyticsDetailsExpanded} onToggle={onToggleAnalyticsDetails} />;
    }

    if (widget.type === 'integrated-analysis') {
        return <IntegratedAnalysisWidget widget={widget} expanded={analyticsDetailsExpanded} onToggle={onToggleAnalyticsDetails} />;
    }

    return null;
}
