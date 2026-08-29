import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';
import {
    ExpenseBreakdownMetric,
    LineTrendMetric,
    RingBreakdownMetric,
    SummaryMetric,
} from '@/features/workspace/dashboard/widgets/DashboardWidgetMetrics';
import {
    CashAvailabilityWidget,
    RecentActivityWidget,
    TopProductsWidget,
} from '@/features/workspace/dashboard/widgets/DashboardSupplementaryWidgets';

function WidgetEmptyState({ widget }) {
    const emptyState = widget.emptyState ?? {};

    return (
        <DashboardWidgetEmptyState
            title={emptyState.title ?? 'Tidak ada data'}
            description={emptyState.description ?? 'Data widget akan muncul setelah tersedia.'}
        />
    );
}

function WidgetSkeleton({ widget }) {
    if (widget.type === 'line' || widget.type === 'cash-availability') {
        return (
            <div className="flex flex-1 flex-col gap-4 animate-pulse">
                <div className="h-6 w-1/4 rounded bg-slate-300" />
                <div className="flex-1 rounded-[6px] bg-slate-200 min-h-[180px]" />
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
                title={widget.noteTitle ?? 'Tidak ada data'}
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
        return <RingBreakdownMetric widget={widget} />;
    }

    if (widget.type === 'expense') {
        return <ExpenseBreakdownMetric widget={widget} />;
    }

    if (widget.type === 'summary') {
        return <SummaryMetric widget={widget} />;
    }

    if (widget.type === 'top-products') {
        return <TopProductsWidget widget={widget} />;
    }

    if (widget.type === 'cash-availability') {
        return <CashAvailabilityWidget widget={widget} />;
    }

    if (widget.type === 'recent-activity') {
        return <RecentActivityWidget widget={widget} />;
    }

    return null;
}
