import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import { InsightCallout, SummaryStrip, WidgetSection } from '@/features/workspace/dashboard/analytics/AnalyticsShared';

export function DetailToggleButton({ expanded, onToggle, summary }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between rounded-[7px] border border-[#dce3ed] bg-white px-3 py-2.5 text-left shadow-[0_6px_14px_rgba(15,23,42,0.04)] transition hover:bg-[#fbfcfe]"
            aria-expanded={expanded}
        >
            <div className="min-w-0">
                <p className="text-sm font-medium text-[#1f2536]">
                    {expanded ? 'Sembunyikan detail tambahan' : 'Tampilkan detail tambahan'}
                </p>
                <p className="mt-1 text-sm leading-5 text-[#68728c]">{summary}</p>
            </div>
            <ChevronDownIcon
                className={`ml-3 h-4 w-4 shrink-0 text-[#61718f] transition ${expanded ? 'rotate-180' : ''}`.trim()}
            />
        </button>
    );
}

export function AnalyticsWidgetLayout({
    backgroundClassName,
    summaryItems,
    chartTitle,
    chartCaption,
    chartContent,
    expanded,
    onToggle,
    toggleSummary,
    details,
    insight = null,
    insightTone = 'blue',
}) {
    return (
        <div className={`flex h-full min-h-0 flex-col gap-3 rounded-[8px] p-2 ${backgroundClassName}`.trim()}>
            <SummaryStrip items={summaryItems} />

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                <WidgetSection title={chartTitle} caption={chartCaption}>
                    {chartContent}
                </WidgetSection>

                <DetailToggleButton expanded={expanded} onToggle={onToggle} summary={toggleSummary} />

                {expanded ? (
                    <>
                        <div className="grid gap-3 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">{details}</div>

                        {insight ? <InsightCallout tone={insightTone}>{insight}</InsightCallout> : null}
                    </>
                ) : null}
            </div>
        </div>
    );
}
