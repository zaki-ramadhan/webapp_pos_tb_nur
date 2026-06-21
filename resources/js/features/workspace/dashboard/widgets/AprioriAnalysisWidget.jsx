import { ActionList, getMetric, WidgetSection } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
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
                    <div className="col-span-full mb-1 rounded-lg border border-blue-100 bg-blue-50/20 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)] select-none">
                        <h5 className="text-sm font-semibold text-blue-900 mb-2">Petunjuk Kategori Prioritas Barang (Analisis ABC):</h5>
                        <div className="grid gap-2 sm:grid-cols-3">
                            <div className="rounded-md border border-blue-100 bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: '#2d77d1' }}>
                                        Kat. A
                                    </span>
                                    <span className="text-xs font-bold text-[#1f2536]">(Utama)</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">80% omzet</span> toko. Prioritas utama, stok wajib dijaga ketat.</p>
                            </div>
                            <div className="rounded-md border border-emerald-100 bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: '#4caf50' }}>
                                        Kat. B
                                    </span>
                                    <span className="text-xs font-bold text-[#1f2536]">(Stabil)</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">15% omzet</span> toko. Penjualan stabil untuk kebutuhan rutin.</p>
                            </div>
                            <div className="rounded-md border border-amber-100 bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: '#f4a62a' }}>
                                        Kat. C
                                    </span>
                                    <span className="text-xs font-bold text-[#1f2536]">(Tambahan)</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">5% omzet</span> toko. Produk pelengkap/aksesoris penunjang.</p>
                            </div>
                        </div>
                    </div>

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
