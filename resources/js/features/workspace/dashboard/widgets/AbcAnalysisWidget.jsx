import { ActionList, getMetric, WidgetSection } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { AnalyticsWidgetLayout } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetLayout';
import { AbcTopItemRow } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetRows';
import { AbcContributionChart } from '@/features/workspace/dashboard/analytics/AnalyticsCharts';

export default function AbcAnalysisWidget({ widget, expanded = false, onToggle }) {
    if (!widget.metrics || widget.metrics.length === 0) {
        return (
            <div className="flex h-full min-h-[380px] flex-col justify-between rounded-[8px] bg-slate-50 p-5 border border-slate-100 animate-pulse">
                <div className="space-y-4">
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

    const itemAMetric = getMetric(widget.metrics, 'Item A');
    const itemCMetric = getMetric(widget.metrics, 'Item C');
    const totalMetric = getMetric(widget.metrics, 'Nilai Analisis');
    const topItem = widget.topItems?.[0] ?? null;
    const categoryCDistribution = (widget.distribution ?? []).find((item) => item.label === 'C') ?? null;
    const actionItems = [
        {
            title: 'Utamakan restock kategori A',
            detail: itemAMetric?.helper ?? 'Kategori A memberi kontribusi terbesar terhadap omzet.',
        },
        {
            title: topItem ? `Pantau ${topItem.name}` : 'Pantau barang kategori A teratas',
            detail: topItem
                ? `${topItem.revenue} dari ${topItem.unitsSold}. Barang ini paling layak diprioritaskan untuk ketersediaan stok.`
                : 'Barang kategori A perlu dipantau lebih ketat untuk menjaga ketersediaan stok.',
        },
        {
            title: 'Evaluasi kategori C secara berkala',
            detail:
                itemCMetric && categoryCDistribution
                    ? `${itemCMetric.value} item hanya menyumbang ${categoryCDistribution.share}, jadi lebih cocok dipantau periodik.`
                    : 'Kategori C cocok untuk evaluasi berkala agar stok lambat gerak tidak menumpuk.',
        },
    ];

    return (
        <AnalyticsWidgetLayout
            backgroundClassName="bg-[linear-gradient(180deg,#f8fbfe_0%,#f1f5fa_100%)]"
            summaryItems={[
                {
                    label: 'Fokus utama',
                    value: itemAMetric?.value ?? '0',
                    helper: itemAMetric?.helper ?? 'Kategori dengan kontribusi omzet terbesar.',
                },
                {
                    label: 'Nilai penjualan',
                    value: totalMetric?.value ?? '0',
                    helper: totalMetric?.helper ?? 'Nilai transaksi yang dianalisis pada periode aktif.',
                },
                {
                    label: 'Perlu evaluasi',
                    value: itemCMetric?.value ?? '0',
                    helper: itemCMetric?.helper ?? 'Item lambat gerak yang cukup dipantau berkala.',
                },
            ]}
            chartTitle="Prioritas stok"
            chartCaption="Lihat kategori mana yang paling menentukan omzet dan perlu diprioritaskan."
            chartContent={<AbcContributionChart items={widget.distribution ?? []} />}
            expanded={expanded}
            onToggle={onToggle}
            toggleSummary="Buka tindakan stok prioritas, barang kategori A, dan catatan tambahan bila diperlukan."
            details={
                <>
                    <WidgetSection title="Apa yang perlu dilakukan" caption="Tindakan cepat yang paling relevan dari hasil analisis saat ini.">
                        <ActionList items={actionItems} />
                    </WidgetSection>

                    <WidgetSection title="Barang prioritas" caption="Barang kategori A yang paling layak dijaga ketersediaannya.">
                        <div className="space-y-3">
                            {(widget.topItems ?? []).map((item) => (
                                <AbcTopItemRow key={item.code} item={item} />
                            ))}
                        </div>
                    </WidgetSection>
                </>
            }
            insight={widget.insight}
        />
    );
}
