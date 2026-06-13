import { ActionList, getMetric, WidgetSection } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { AnalyticsWidgetLayout } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetLayout';
import { RuleSummaryRow } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetRows';
import { AprioriRuleChart } from '@/features/workspace/dashboard/analytics/AnalyticsCharts';

export default function AprioriAnalysisWidget({ widget, expanded = false, onToggle }) {
    if (!widget.metrics || widget.metrics.length === 0) {
        return (
            <div className="flex h-full min-h-[380px] flex-col justify-between rounded-[8px] bg-slate-50 p-5 border border-slate-100 animate-pulse">
                <div className="space-y-3">
                    <div className="flex justify-between gap-4">
                        <div className="h-14 w-1/3 rounded bg-slate-200" />
                        <div className="h-14 w-1/3 rounded bg-slate-200" />
                        <div className="h-14 w-1/3 rounded bg-slate-200" />
                    </div>
                    <div className="h-[180px] w-full rounded bg-slate-200" />
                </div>
                <div className="h-8 w-full rounded bg-slate-200 mt-4" />
            </div>
        );
    }

    const transactionMetric = getMetric(widget.metrics, 'Transaksi');
    const supportMetric = getMetric(widget.metrics, 'Min Support');
    const confidenceMetric = getMetric(widget.metrics, 'Min Confidence');
    const validRulesMetric = getMetric(widget.metrics, 'Rule Valid');
    const actionItems = (widget.rules ?? []).slice(0, 2).map((rule) => ({
        title: `Pasangkan ${rule.consequent} saat pelanggan membeli ${rule.antecedent}`,
        detail: `Confidence ${rule.confidence}, support ${rule.support}, lift ${rule.lift}. Cocok untuk bundling atau penempatan rak yang berdekatan.`,
    }));

    return (
        <AnalyticsWidgetLayout
            backgroundClassName="bg-[linear-gradient(180deg,#f8fafc_0%,#f1f4f8_100%)]"
            summaryItems={[
                {
                    label: 'Transaksi',
                    value: transactionMetric?.value ?? '0',
                    helper: transactionMetric?.helper ?? 'Jumlah transaksi yang dianalisis.',
                },
                {
                    label: 'Rule siap pakai',
                    value: validRulesMetric?.value ?? '0',
                    helper: validRulesMetric?.helper ?? 'Rule yang sudah cukup kuat untuk dipakai sebagai insight.',
                },
                {
                    label: 'Ambang analisis',
                    value: `${supportMetric?.value ?? '0'} / ${confidenceMetric?.value ?? '0'}`,
                    helper: 'Support / confidence minimum yang dipakai dalam analisis.',
                },
            ]}
            chartTitle="Pola belanja pelanggan"
            chartCaption="Chart ini menunjukkan rule yang paling kuat untuk pemasangan produk atau penjualan silang."
            chartContent={<AprioriRuleChart rules={widget.rules ?? []} />}
            expanded={expanded}
            onToggle={onToggle}
            toggleSummary="Buka rekomendasi penjualan silang, daftar rule teratas, dan catatan tambahan bila diperlukan."
            details={
                <>
                    <WidgetSection title="Rekomendasi cepat" caption="Tindakan promosi atau penataan rak yang bisa langsung dicoba.">
                        <ActionList items={actionItems} />
                    </WidgetSection>

                    <WidgetSection title="Rule teratas" caption="Ringkasan rule yang paling mudah dipahami untuk operasional harian.">
                        <div className="space-y-3">
                            {(widget.rules ?? []).map((rule) => (
                                <RuleSummaryRow key={rule.id} rule={rule} />
                            ))}
                        </div>
                    </WidgetSection>
                </>
            }
            insight={widget.insight}
            insightTone="amber"
        />
    );
}
