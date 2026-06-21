import { useState } from 'react';
import { InsightCallout, SummaryStrip, WidgetSection } from '@/features/workspace/dashboard/analytics/AnalyticsShared';

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
    const [chartExpanded, setChartExpanded] = useState(false);

    return (
        <div className={`flex h-full min-h-0 flex-col gap-3 rounded-[8px] p-2 ${backgroundClassName}`.trim()}>
            <SummaryStrip items={summaryItems} />

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                <WidgetSection 
                    title={chartTitle} 
                    caption={chartCaption}
                    collapsible={true}
                    expanded={chartExpanded}
                    onToggle={() => setChartExpanded(!chartExpanded)}
                >
                    {chartContent}
                </WidgetSection>

                <WidgetSection
                    title="Rekomendasi Tindakan & Analisis Detail"
                    caption={toggleSummary}
                    collapsible={true}
                    expanded={expanded}
                    onToggle={onToggle}
                >
                    <div className="grid gap-3 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                        {details}
                    </div>

                    {insight && (
                        <div className="mt-3">
                            <InsightCallout tone={insightTone}>{insight}</InsightCallout>
                        </div>
                    )}
                </WidgetSection>
            </div>
        </div>
    );
}
