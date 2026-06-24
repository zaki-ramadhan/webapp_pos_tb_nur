import { ActionList, getMetric, WidgetSection } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { AnalyticsWidgetLayout } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetLayout';
import { AbcTopItemRow } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetRows';
import { AbcContributionChart } from '@/features/workspace/dashboard/analytics/AnalyticsCharts';

export default function AbcAnalysisWidget({ widget, expanded = false, onToggle }) {
    if (!widget.metrics || widget.metrics.length === 0) {
        return (
            <div className="flex h-full min-h-0 flex-col gap-3 rounded-[8px] p-2 bg-[linear-gradient(180deg,#f8fbfe_0%,#f1f5fa_100%)] border border-slate-200 animate-pulse">
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
                    <div className="col-span-full mb-1 rounded-lg border border-blue-100 bg-blue-50/20 p-3 shadow-widget-tiny select-none">
                        <h5 className="text-sm font-semibold text-blue-900 mb-2">Petunjuk Kategori Prioritas Barang (Analisis ABC):</h5>
                        <div className="grid gap-2 sm:grid-cols-3">
                            <div className="rounded-md border border-tab-active-border-x bg-white p-2.5 shadow-widget-small">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: 'var(--color-badge-group-a)' }}>
                                        Kat. A
                                    </span>
                                    <span className="text-xs font-bold text-brand-darker">(Utama)</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">80% omzet</span> toko. Prioritas utama, stok wajib dijaga ketat.</p>
                            </div>
                            <div className="rounded-md border border-emerald-100 bg-white p-2.5 shadow-widget-small">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: 'var(--color-green-410)' }}>
                                        Kat. B
                                    </span>
                                    <span className="text-xs font-bold text-brand-darker">(Stabil)</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">15% omzet</span> toko. Penjualan stabil untuk kebutuhan rutin.</p>
                            </div>
                            <div className="rounded-md border border-amber-100 bg-white p-2.5 shadow-widget-small">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: 'var(--color-warning)' }}>
                                        Kat. C
                                    </span>
                                    <span className="text-xs font-bold text-brand-darker">(Tambahan)</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">5% omzet</span> toko. Produk pelengkap/aksesoris penunjang.</p>
                            </div>
                        </div>
                    </div>

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
