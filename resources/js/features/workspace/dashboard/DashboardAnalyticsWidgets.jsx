import {
    ActionList,
    getMetric,
    WidgetSection,
} from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { AnalyticsWidgetLayout } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetLayout';
import {
    AbcTopItemRow,
    RuleSummaryRow,
} from '@/features/workspace/dashboard/analytics/AnalyticsWidgetRows';
import {
    AbcContributionChart,
    AprioriRuleChart,
} from '@/features/workspace/dashboard/analytics/AnalyticsCharts';
export function AbcAnalysisWidget({ widget, expanded = false, onToggle }) {
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
                    value: itemAMetric?.value ?? '-',
                    helper: itemAMetric?.helper ?? 'Kategori dengan kontribusi omzet terbesar.',
                },
                {
                    label: 'Nilai penjualan',
                    value: totalMetric?.value ?? '-',
                    helper: totalMetric?.helper ?? 'Nilai transaksi yang dianalisis pada periode aktif.',
                },
                {
                    label: 'Perlu evaluasi',
                    value: itemCMetric?.value ?? '-',
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

export function AprioriAnalysisWidget({ widget, expanded = false, onToggle }) {
    const transactionMetric = getMetric(widget.metrics, 'Transaksi');
    const supportMetric = getMetric(widget.metrics, 'Min Support');
    const confidenceMetric = getMetric(widget.metrics, 'Min Confidence');
    const validRulesMetric = getMetric(widget.metrics, 'Rule Valid');
    const actionItems = (widget.rules ?? []).slice(0, 3).map((rule) => ({
        title: `Pasangkan ${rule.consequent} saat pelanggan membeli ${rule.antecedent}`,
        detail: `Confidence ${rule.confidence}, support ${rule.support}, lift ${rule.lift}. Cocok untuk bundling atau penempatan rak yang berdekatan.`,
    }));

    return (
        <AnalyticsWidgetLayout
            backgroundClassName="bg-[linear-gradient(180deg,#f8fafc_0%,#f1f4f8_100%)]"
            summaryItems={[
                {
                    label: 'Transaksi',
                    value: transactionMetric?.value ?? '-',
                    helper: transactionMetric?.helper ?? 'Jumlah transaksi yang dianalisis.',
                },
                {
                    label: 'Rule siap pakai',
                    value: validRulesMetric?.value ?? '-',
                    helper: validRulesMetric?.helper ?? 'Rule yang sudah cukup kuat untuk dipakai sebagai insight.',
                },
                {
                    label: 'Ambang analisis',
                    value: `${supportMetric?.value ?? '-'} / ${confidenceMetric?.value ?? '-'}`,
                    helper: 'Support / confidence minimum yang dipakai dalam analisis.',
                },
            ]}
            chartTitle="Pola belanja pelanggan"
            chartCaption="Chart ini menunjukkan rule yang paling kuat untuk pairing atau cross-sell."
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
