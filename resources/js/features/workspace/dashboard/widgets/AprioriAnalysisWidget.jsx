import { ActionList, getMetric, WidgetSection, AbcCategoryLegend } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { AnalyticsWidgetLayout } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetLayout';
import { RuleSummaryRow } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetRows';
import { AprioriRuleChart } from '@/features/workspace/dashboard/analytics/AnalyticsCharts';

export default function AprioriAnalysisWidget({ widget, expanded = false, onToggle }) {
    if (!widget.metrics || widget.metrics.length === 0) {
        return (
            <div className="flex h-full min-h-0 flex-col gap-3 rounded-[8px] p-2 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f4f8_100%)] border border-slate-200 animate-pulse">
                <div className="grid grid-cols-3 gap-2">
                    <div className="h-16 rounded bg-slate-300 p-2" />
                    <div className="h-16 rounded bg-slate-300 p-2" />
                    <div className="h-16 rounded bg-slate-300 p-2" />
                </div>
                <div className="min-h-0 flex-1 space-y-3 pr-1">
                    <div className="h-14 rounded-lg bg-slate-200 px-3 py-3" />
                    <div className="h-14 rounded-lg bg-slate-200 px-3 py-3" />
                </div>
            </div>
        );
    }

    const transactionMetric = getMetric(widget.metrics, 'Transaksi');
    const supportMetric = getMetric(widget.metrics, 'Min. Frekuensi Pembelian') || getMetric(widget.metrics, 'Min Support');
    const confidenceMetric = getMetric(widget.metrics, 'Min. Tingkat Kepastian') || getMetric(widget.metrics, 'Min Confidence');
    const validRulesMetric = getMetric(widget.metrics, 'Pasangan Laris Valid') || getMetric(widget.metrics, 'Rule Valid');
    const actionItems = (widget.rules ?? []).slice(0, 2).map((rule) => ({
        title: `Tawarkan ${rule.consequent} saat pelanggan membeli ${rule.antecedent}`,
        detail: `Tingkat kepastian ${rule.confidence}, frekuensi ${rule.support}, daya dorong ${rule.lift}x. Sangat direkomendasikan untuk penataan rak berdekatan & paket hemat kasir.`,
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
                    label: 'Pasangan Laris',
                    value: validRulesMetric?.value ?? '0',
                    helper: validRulesMetric?.helper ?? 'Kombinasi produk yang memiliki hubungan kuat.',
                },
                {
                    label: 'Ambang Analisis',
                    value: `${supportMetric?.value ?? '0'} / ${confidenceMetric?.value ?? '0'}`,
                    helper: 'Min. Frekuensi / Min. Kepastian dalam analisis.',
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
                    <AbcCategoryLegend />

                    {widget.rules && widget.rules.length > 0 && (
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
                    )}
                </>
            }
            insight={widget.insight}
            insightTone="amber"
        />
    );
}
