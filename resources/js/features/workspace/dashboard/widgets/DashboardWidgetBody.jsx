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

export default function DashboardWidgetBody({
    widget,
    analyticsDetailsExpanded,
    onToggleAnalyticsDetails,
}) {
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
