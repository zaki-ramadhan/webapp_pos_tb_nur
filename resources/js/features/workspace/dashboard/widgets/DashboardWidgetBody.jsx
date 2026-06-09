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

function NoteWidget({ widget }) {
    const text = widget.noteDescription ?? widget.note ?? '';
    const isEmptyState = !text || text.toLowerCase().includes('belum ada') || text.toLowerCase().includes('tidak ada');

    if (isEmptyState) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center text-center p-6 bg-[#fbfcfe] rounded-[8px] border border-[#e6ebf4] h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <h4 className="text-sm font-semibold text-[#374151]">{widget.title ?? 'Semua Beres'}</h4>
                <p className="mt-1.5 text-xs text-[#7c839b] max-w-[240px] leading-relaxed">{text || 'Tidak ada kegiatan yang perlu diperhatikan saat ini.'}</p>
            </div>
        );
    }

    // Parse date if it starts with "Date — Message" (e.g. "12 Jun 2026 — Batas Akhir...")
    let datePart = '';
    let msgPart = text;
    if (text.includes(' — ')) {
        const parts = text.split(' — ');
        datePart = parts[0];
        msgPart = parts.slice(1).join(' — ');
    }

    return (
        <div className="flex flex-1 flex-col justify-between h-full gap-4">
            <div className="flex items-start gap-4 rounded-[8px] border border-[#e0e7ff] bg-[#f5f7ff] p-4">
                {datePart ? (
                    <div className="flex flex-col items-center justify-center rounded-[6px] bg-white border border-[#c7d2fe] p-2 text-center min-w-[68px] shadow-sm shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Jadwal</span>
                        <span className="text-[14px] font-extrabold text-[#1f2536] mt-0.5 leading-none">{datePart.split(' ').slice(0, 2).join(' ')}</span>
                        <span className="text-[9px] text-[#7c839b] mt-0.5">{datePart.split(' ').slice(2).join(' ')}</span>
                    </div>
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-indigo-700 leading-tight uppercase tracking-wider">Pengingat Jadwal</p>
                    <p className="mt-1.5 text-xs font-medium text-[#4b5563] leading-relaxed break-words">{msgPart}</p>
                </div>
            </div>
            
            {/* Elegant filler card to balance the uniform height when stretched */}
            <div className="flex-1 flex flex-col justify-center rounded-[8px] border border-dashed border-[#d7ddea] p-4 text-center bg-gray-50/50">
                <p className="text-xs text-[#7c839b] italic">"Selalu periksa daftar kegiatan berkala untuk menjaga kelancaran operasional toko."</p>
            </div>
        </div>
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
        return <NoteWidget widget={widget} />;
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
