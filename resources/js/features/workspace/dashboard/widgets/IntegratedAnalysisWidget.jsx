import { useState, useMemo } from 'react';
import { MapPin, MessageSquare, Megaphone, Package } from 'lucide-react';
import { getMetric, WidgetSection, getProductImageUrl, HighlightProductText, AbcCategoryLegend, getBuildingStoreLayoutRecommendation } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { IntegratedMatrixChart } from '@/features/workspace/dashboard/analytics/AnalyticsCharts';
import { AbcTopItemRow } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetRows';

export default function IntegratedAnalysisWidget({
    widget,
    expanded = false,
    onToggle,
    chartExpanded: propChartExpanded,
    onToggleChart,
}) {
    const [localChartExpanded, setLocalChartExpanded] = useState(false);
    const isChartExpanded = propChartExpanded !== undefined ? propChartExpanded : localChartExpanded;
    const handleToggleChart = onToggleChart ?? (() => setLocalChartExpanded((prev) => !prev));

    const topItemsMap = useMemo(() => {
        const map = new Map();
        (widget.topItems ?? []).forEach((item) => {
            if (item.name) map.set(item.name.toLowerCase().trim(), item);
            if (item.code) map.set(item.code.toLowerCase().trim(), item);
        });
        return map;
    }, [widget.topItems]);

    if (!widget.metrics || widget.metrics.length === 0) {
        return (
            <div className="flex h-full min-h-0 flex-col gap-3 rounded-[8px] p-2 bg-[linear-gradient(180deg,#fcfdfe_0%,#f5f8fc_100%)] border border-slate-200 animate-pulse">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="h-16 rounded bg-slate-300 p-2" />
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
    const validRulesMetric = getMetric(widget.metrics, 'Pasangan Laris Valid') || getMetric(widget.metrics, 'Rule Valid');
    const itemAMetric = getMetric(widget.metrics, 'Fokus Stok (Kat A)') || getMetric(widget.metrics, 'Item A');
    const totalMetric = getMetric(widget.metrics, 'Nilai Analisis');

    const summaryItems = [
        {
            label: 'Transaksi',
            value: transactionMetric?.value ?? '0',
            helper: transactionMetric?.helper ?? 'Total transaksi dianalisis.',
        },
        {
            label: 'Pasangan Laris',
            value: validRulesMetric?.value ?? '0',
            helper: 'Pola pasangan produk kuat.',
        },
        {
            label: 'Fokus Stok (Kat A)',
            value: itemAMetric?.value ?? '0',
            helper: itemAMetric?.helper ?? 'Omzet kontribusi terbesar.',
        },
        {
            label: 'Nilai Omzet Toko',
            value: totalMetric?.value ?? '0',
            helper: totalMetric?.helper || 'Akumulasi 3 bulan terakhir',
        },
    ];

    const getStrategyTactic = (antecedentAbc, consequentAbc, antecedentName = '', consequentName = '') => {
        const customLocation = getBuildingStoreLayoutRecommendation(antecedentName, consequentName);

        if (antecedentAbc === 'A' && consequentAbc === 'C') {
            return {
                title: 'Taktik Jual Silang (Utama → Tambahan)',
                desc: 'Tempatkan aksesoris di dekat produk inti atau tawarkan langsung sebagai pelengkap saat transaksi untuk memicu pembelian impulsif.',
                actionDisplay: customLocation,
                actionCashier: `Tawarkan produk pelengkap ini sebagai opsional hemat saat pelanggan membayar di kasir.`,
                tone: 'blue',
                bg: 'bg-blue-50 border-blue-200 text-blue-800',
                badgeBg: 'var(--color-badge-group-a)',
                strengthText: 'Sangat Kuat'
            };
        }
        if (antecedentAbc === 'A' && consequentAbc === 'A') {
            return {
                title: 'Taktik Paket Bundling (Utama → Utama)',
                desc: 'Tawarkan paket bundling dengan potongan harga tipis untuk meningkatkan kuantitas pembelian dalam jumlah besar.',
                actionDisplay: customLocation,
                actionCashier: `Berikan penawaran diskon potongan langsung jika kedua produk dibeli secara bersamaan.`,
                tone: 'blue',
                bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
                badgeBg: 'var(--color-badge-group-a-65)',
                strengthText: 'Kuat'
            };
        }
        if (antecedentAbc === 'B' && consequentAbc === 'B') {
            return {
                title: 'Taktik Paket Produk (Stabil → Stabil)',
                desc: 'Buat paket bundling harian di area kasir untuk mempercepat perputaran produk pelengkap yang stabil.',
                actionDisplay: customLocation,
                actionCashier: `Ingatkan pelanggan mengenai ketersediaan paket belanja hemat harian untuk kombinasi produk ini.`,
                tone: 'blue',
                bg: 'bg-sky-50 border-sky-200 text-sky-800',
                badgeBg: 'var(--color-badge-group-a-40)',
                strengthText: 'Sedang'
            };
        }
        return {
            title: 'Taktik Penataan Rak Display',
            desc: 'Posisikan kedua barang ini berdekatan di rak display agar pelanggan dapat dengan mudah menemukannya bersama.',
            actionDisplay: customLocation,
            actionCashier: `Gunakan gantungan promo / label harga bertuliskan "Paket Combo" di rak display toko.`,
            tone: 'slate',
            bg: 'bg-slate-50 border-slate-200 text-slate-700',
            badgeBg: 'var(--color-badge-group-a-18)',
            strengthText: 'Pendukung'
        };
    };

    return (
        <div className="flex h-full min-h-0 flex-col gap-2 rounded-[8px] p-2 bg-[linear-gradient(180deg,#fcfdfe_0%,#f5f8fc_100%)]">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {summaryItems.map((item, idx) => (
                    <div key={idx} title="" className="rounded-[6px] border border-ui-border-light bg-white p-2.5 shadow-widget-medium">
                        <p title="" className="text-sm font-semibold text-text-muted">{item.label}</p>
                        <p title="" className="mt-1 text-base sm:text-lg lg:text-xl font-semibold text-text-contrast truncate">{item.value}</p>
                        <p title="" className="mt-0.5 text-sm text-text-muted">{item.helper}</p>
                    </div>
                ))}
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                <WidgetSection
                    title="Peta Hubungan Belanja & Prioritas Stok"
                    caption="Grafik interaktif menunjukkan seberapa kuat kecenderungan produk dibeli bersamaan (Tingkat Kepastian) dikombinasikan dengan prioritas omzet produk tersebut."
                    collapsible={true}
                    expanded={isChartExpanded}
                    onToggle={handleToggleChart}
                >
                    {widget.rules && widget.rules.length > 0 ? (
                        <IntegratedMatrixChart rules={widget.rules ?? []} />
                    ) : (
                        <p className="text-sm text-slate-500 py-6 text-center bg-white border border-slate-100 rounded-md">
                            Tidak ada data pola hubungan belanja yang terbentuk pada periode ini.
                        </p>
                    )}
                </WidgetSection>

                <WidgetSection
                    title="Rekomendasi Taktik Penjualan & Pajangan Toko"
                    caption="Daftar rekomendasi taktis kombinasi produk, rencana display rak, dan panduan penawaran kasir berdasarkan analisis belanja & omzet."
                    collapsible={true}
                    expanded={expanded}
                    onToggle={onToggle}
                >
                    <AbcCategoryLegend />

                    {widget.rules && widget.rules.length > 0 ? (
                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                            {(widget.rules ?? []).map((rule, idx) => {
                                const tactic = getStrategyTactic(rule.antecedentAbc, rule.consequentAbc, rule.antecedent, rule.consequent);
                                const itemAData = topItemsMap.get(rule.antecedent?.toLowerCase().trim());
                                const itemBData = topItemsMap.get(rule.consequent?.toLowerCase().trim());
                                const liftVal = parseFloat(rule.lift ?? '0');
                                let strengthText = 'Sedang';
                                if (liftVal >= 3.0) strengthText = 'Sangat Kuat';
                                else if (liftVal >= 1.8) strengthText = 'Kuat';
                                else if (liftVal >= 1.2) strengthText = 'Sedang';
                                else strengthText = 'Pendukung';

                                return (
                                    <div key={rule.id ?? idx} className="rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-400 hover:shadow-badge-group-a-glow transition-all duration-150">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                                            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-[2]">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined') {
                                                            window.dispatchEvent(
                                                                new CustomEvent('workspace:open-page', {
                                                                    detail: {
                                                                        pageId: 'items-services',
                                                                        recordId: rule.antecedentId ?? undefined,
                                                                        label: rule.antecedent,
                                                                        tabLabel: rule.antecedent,
                                                                        openForm: Boolean(rule.antecedentId),
                                                                    },
                                                                })
                                                            );
                                                        }
                                                    }}
                                                    className="group inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-200/80 px-2 py-1 transition-all duration-150 cursor-pointer hover:bg-blue-50/80 hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 text-left"
                                                >
                                                    <img
                                                        src={getProductImageUrl(rule.antecedent)}
                                                        alt=""
                                                        className="h-6 w-6 rounded-[3px] border border-slate-200 object-cover shrink-0"
                                                    />
                                                    <span className="text-sm font-normal text-slate-800 group-hover:text-blue-900 truncate max-w-[180px] sm:max-w-[320px] lg:max-w-[420px]">
                                                        {rule.antecedent}
                                                    </span>
                                                    {rule.antecedentAbc && (
                                                        <span
                                                            className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0"
                                                            style={{ backgroundColor: rule.antecedentColor }}
                                                            title={`Kategori ${rule.antecedentAbc}${itemAData ? ` — Omzet: ${itemAData.revenue} (${itemAData.share} kontribusi)` : ''}`}
                                                        >
                                                            Kat. {rule.antecedentAbc}{itemAData?.share ? ` • ${itemAData.share}` : ''}
                                                        </span>
                                                    )}
                                                </button>

                                                <span className="text-blue-500 font-semibold text-base px-1">+</span>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined') {
                                                            window.dispatchEvent(
                                                                new CustomEvent('workspace:open-page', {
                                                                    detail: {
                                                                        pageId: 'items-services',
                                                                        recordId: rule.consequentId ?? undefined,
                                                                        label: rule.consequent,
                                                                        tabLabel: rule.consequent,
                                                                        openForm: Boolean(rule.consequentId),
                                                                    },
                                                                })
                                                            );
                                                        }
                                                    }}
                                                    className="group inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-200/80 px-2 py-1 transition-all duration-150 cursor-pointer hover:bg-blue-50/80 hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 text-left"
                                                >
                                                    <img
                                                        src={getProductImageUrl(rule.consequent)}
                                                        alt=""
                                                        className="h-6 w-6 rounded-[3px] border border-slate-200 object-cover shrink-0"
                                                    />
                                                    <span className="text-sm font-normal text-slate-800 group-hover:text-blue-900 truncate max-w-[180px] sm:max-w-[320px] lg:max-w-[420px]">
                                                        {rule.consequent}
                                                    </span>
                                                    {rule.consequentAbc && (
                                                        <span
                                                            className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0"
                                                            style={{ backgroundColor: rule.consequentColor }}
                                                            title={`Kategori ${rule.consequentAbc}${itemBData ? ` — Omzet: ${itemBData.revenue} (${itemBData.share} kontribusi)` : ''}`}
                                                        >
                                                            Kat. {rule.consequentAbc}{itemBData?.share ? ` • ${itemBData.share}` : ''}
                                                        </span>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-800 shrink-0">
                                                    Peluang Dibeli Bersama: {rule.confidence}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-2.5 border-t border-slate-100 pt-2.5 flex flex-col gap-2.5 text-sm text-slate-700 bg-emerald-50/15 rounded-md p-2.5 border border-emerald-100/50">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold text-emerald-950">Penataan di Rak:</span>{" "}
                                                    <span className="leading-relaxed block sm:inline">
                                                        <HighlightProductText
                                                            text={tactic.actionDisplay}
                                                            itemA={rule.antecedent}
                                                            itemAId={rule.antecedentId}
                                                            itemB={rule.consequent}
                                                            itemBId={rule.consequentId}
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 border-t border-emerald-100/40 pt-2">
                                                <Package className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold text-emerald-950">Rekomendasi Bundling:</span>{" "}
                                                    <span className="leading-relaxed block sm:inline">
                                                        <HighlightProductText
                                                            text={tactic.actionCashier}
                                                            itemA={rule.antecedent}
                                                            itemAId={rule.antecedentId}
                                                            itemB={rule.consequent}
                                                            itemBId={rule.consequentId}
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 py-6 text-center bg-white border border-slate-100 rounded-md">
                            Belum ada rekomendasi taktis penjualan pada periode ini.
                        </p>
                    )}
                </WidgetSection>

                {widget.topItems && widget.topItems.length > 0 && (
                    <WidgetSection
                        title="Daftar Barang Penyumbang Omzet Terbesar (Klasifikasi ABC)"
                        caption="Rincian nominal omzet (Rp) dan persentase kontribusi (%) tiap barang berdasarkan hasil analisis Pareto 80/20 (Kategori A, B, C)."
                        collapsible={true}
                        expanded={true}
                    >
                        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                            {widget.topItems.map((item, idx) => (
                                <AbcTopItemRow key={item.code || idx} item={item} />
                            ))}
                        </div>
                    </WidgetSection>
                )}

                {widget.insight && (
                    <div className="rounded-[8px] border border-blue-200 bg-blue-50/40 p-3 text-sm text-blue-800 leading-6 flex items-start gap-2.5">
                        <Megaphone className="h-5 w-5 text-input-brand shrink-0 mt-0.5" />
                        <div>
                            <span className="font-medium text-blue-950">Rangkuman Insight Terintegrasi:</span> {widget.insight}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
