import { getMetric, WidgetSection } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { DetailToggleButton } from '@/features/workspace/dashboard/analytics/AnalyticsWidgetLayout';
import { IntegratedMatrixChart } from '@/features/workspace/dashboard/analytics/AnalyticsCharts';

const LightbulbIcon = ({ className = "h-4 w-4" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
    </svg>
);

const PinIcon = ({ className = "h-4 w-4" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const ChatIcon = ({ className = "h-4 w-4" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const MegaphoneIcon = ({ className = "h-4 w-4" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m3 11 18-5v12L3 13v-2Z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
);

export default function IntegratedAnalysisWidget({ widget, expanded = false, onToggle }) {
    if (!widget.metrics || widget.metrics.length === 0) {
        return (
            <div className="flex h-full min-h-[380px] flex-col justify-between rounded-[8px] bg-slate-50 p-5 border border-slate-100 animate-pulse">
                <div className="space-y-4">
                    <div className="flex justify-between gap-4">
                        <div className="h-14 w-1/4 rounded bg-slate-200" />
                        <div className="h-14 w-1/4 rounded bg-slate-200" />
                        <div className="h-14 w-1/4 rounded bg-slate-200" />
                        <div className="h-14 w-1/4 rounded bg-slate-200" />
                    </div>
                    <div className="h-[180px] w-full rounded bg-slate-200" />
                </div>
                <div className="h-8 w-full rounded bg-slate-200 mt-4" />
            </div>
        );
    }

    const transactionMetric = getMetric(widget.metrics, 'Transaksi');
    const validRulesMetric = getMetric(widget.metrics, 'Rule Valid');
    const itemAMetric = getMetric(widget.metrics, 'Item A');
    const totalMetric = getMetric(widget.metrics, 'Nilai Analisis');

    const summaryItems = [
        {
            label: 'Transaksi',
            value: transactionMetric?.value ?? '0',
            helper: transactionMetric?.helper ?? 'Total transaksi dianalisis.',
        },
        {
            label: 'Rule Terintegrasi',
            value: validRulesMetric?.value ?? '0',
            helper: 'Pola asosiasi yang kuat.',
        },
        {
            label: 'Fokus Stok (Kat A)',
            value: itemAMetric?.value ?? '0',
            helper: itemAMetric?.helper ?? 'Omzet kontribusi terbesar.',
        },
        {
            label: 'Nilai Omzet Toko',
            value: totalMetric?.value ?? '0',
            helper: totalMetric?.helper ?? 'Total penjualan.',
        },
    ];

    const getStrategyTactic = (antecedentAbc, consequentAbc) => {
        if (antecedentAbc === 'A' && consequentAbc === 'C') {
            return {
                title: 'Taktik Jual Silang (Utama → Tambahan)',
                desc: 'Tempatkan aksesoris di dekat produk inti atau tawarkan langsung sebagai pelengkap saat transaksi untuk memicu pembelian impulsif.',
                actionDisplay: 'Pajang produk aksesoris (Kategori C) ini di rak khusus tepat di sebelah produk utama (Kategori A).',
                actionCashier: 'Latih kasir untuk menawarkan produk aksesoris ini sebagai pelengkap opsional saat pelanggan membayar produk utama.',
                tone: 'blue',
                bg: 'bg-blue-50 border-blue-200 text-blue-800',
                badgeBg: 'rgba(29, 78, 216, 1.0)',
                strengthText: 'Sangat Kuat'
            };
        }
        if (antecedentAbc === 'A' && consequentAbc === 'A') {
            return {
                title: 'Taktik Paket Bundling (Utama → Utama)',
                desc: 'Tawarkan paket bundling dengan potongan harga tipis untuk meningkatkan kuantitas pembelian dalam jumlah besar.',
                actionDisplay: 'Buat area display khusus paket bundling "Paket Komplit" yang memajang kedua produk utama ini dalam satu kemasan.',
                actionCashier: 'Berikan penawaran diskon potongan langsung Rp 5.000 jika kedua barang ini dibeli secara bersamaan.',
                tone: 'blue',
                bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
                badgeBg: 'rgba(29, 78, 216, 0.65)',
                strengthText: 'Kuat'
            };
        }
        if (antecedentAbc === 'B' && consequentAbc === 'B') {
            return {
                title: 'Taktik Paket Produk (Stabil → Stabil)',
                desc: 'Buat paket bundling harian di area kasir untuk mempercepat perputaran produk pelengkap yang stabil.',
                actionDisplay: 'Kelompokkan produk penunjang ini di rak tengah agar mudah dijangkau pelanggan yang sedang mencari kebutuhan rutin.',
                actionCashier: 'Ingatkan pelanggan mengenai ketersediaan paket belanja hemat untuk kedua produk rutin ini.',
                tone: 'blue',
                bg: 'bg-sky-50 border-sky-200 text-sky-800',
                badgeBg: 'rgba(29, 78, 216, 0.40)',
                strengthText: 'Sedang'
            };
        }
        return {
            title: 'Taktik Penataan Rak Display',
            desc: 'Posisikan kedua barang ini berdekatan di rak display agar pelanggan dapat dengan mudah menemukannya bersama.',
            actionDisplay: 'Posisikan kedua produk ini sejajar pada tinggi pandangan mata (eye-level) di lorong rak yang sama.',
            actionCashier: 'Gunakan gantungan promosi (shelf talker) bertuliskan "Sering Dibeli Bersama" di bawah label harga rak.',
            tone: 'slate',
            bg: 'bg-slate-50 border-slate-200 text-slate-700',
            badgeBg: 'rgba(29, 78, 216, 0.18)',
            strengthText: 'Pendukung'
        };
    };

    return (
        <div className="flex h-full min-h-0 flex-col gap-5 rounded-[8px] p-2 bg-[linear-gradient(180deg,#fcfdfe_0%,#f5f8fc_100%)]">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {summaryItems.map((item, idx) => (
                    <div key={idx} className="rounded-[6px] border border-[#e2e8f0] bg-white p-2.5 shadow-[0_2px_6px_rgba(15,23,42,0.02)]">
                        <p className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">{item.label}</p>
                        <p className="mt-1 text-[16px] font-bold text-[#0f172a]">{item.value}</p>
                        <p className="mt-0.5 text-sm text-[#64748b]">{item.helper}</p>
                    </div>
                ))}
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                <WidgetSection
                    title="Peta Kekuatan Hubungan & Kategori Produk"
                    caption="Grafik interaktif menunjukkan seberapa kuat kecenderungan produk dibeli bersamaan (Confidence) dikombinasikan dengan prioritas omzet produk tersebut."
                >
                    <IntegratedMatrixChart rules={widget.rules ?? []} />
                </WidgetSection>

                <DetailToggleButton 
                    expanded={expanded} 
                    onToggle={onToggle} 
                    summary="Buka daftar rekomendasi taktis kombinasi produk, rencana display rak, dan panduan penawaran kasir." 
                />

                {expanded && (
                    <WidgetSection 
                        title="Rekomendasi Taktik Penjualan & Pajangan Toko" 
                        caption="Strategi kombinasi produk siap pakai berdasarkan kecenderungan pola belanja (Apriori) dan prioritas omzet toko (ABC)."
                    >
                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                            {(widget.rules ?? []).map((rule, idx) => {
                                const tactic = getStrategyTactic(rule.antecedentAbc, rule.consequentAbc);
                                return (
                                    <div key={rule.id ?? idx} className="rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-400 hover:shadow-[0_2px_8px_rgba(29,78,216,0.04)] transition-all duration-150">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                            
                                            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-[2]">
                                                <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-100 px-2 py-1">
                                                    <span className="text-sm font-bold text-slate-800 truncate max-w-[240px] sm:max-w-[440px] lg:max-w-[520px]" title={rule.antecedent}>
                                                        {rule.antecedent}
                                                    </span>
                                                    {rule.antecedentAbc && (
                                                        <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-sm font-extrabold text-white shrink-0" style={{ backgroundColor: rule.antecedentColor }} title={rule.antecedentAbc === 'A' ? 'Omzet Utama' : rule.antecedentAbc === 'B' ? 'Omzet Stabil' : 'Omzet Tambahan'}>
                                                            Kat {rule.antecedentAbc}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <span className="text-blue-500 font-extrabold text-base px-1">+</span>
                                                
                                                <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-100 px-2 py-1">
                                                    <span className="text-sm font-bold text-slate-800 truncate max-w-[240px] sm:max-w-[440px] lg:max-w-[520px]" title={rule.consequent}>
                                                        {rule.consequent}
                                                    </span>
                                                    {rule.consequentAbc && (
                                                        <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-sm font-extrabold text-white shrink-0" style={{ backgroundColor: rule.consequentColor }} title={rule.consequentAbc === 'A' ? 'Omzet Utama' : rule.consequentAbc === 'B' ? 'Omzet Stabil' : 'Omzet Tambahan'}>
                                                            Kat {rule.consequentAbc}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-bold border shrink-0 ${tactic.bg}`}>
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tactic.badgeBg }}></span>
                                                    {tactic.title}
                                                </span>
                                                
                                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50/50 border border-blue-100 px-2 py-1 text-sm font-bold text-blue-700 shrink-0">
                                                    Peluang: {rule.confidence}
                                                </span>
                                                
                                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-100 px-2 py-1 text-sm font-medium text-slate-500 shrink-0" title="Hubungan Pola (Lift Ratio)">
                                                    Kekuatan: {rule.lift}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-2.5 border-t border-slate-100 pt-2.5 flex flex-col gap-2.5 text-sm text-slate-600 bg-emerald-50/10 rounded-md p-2.5 border border-emerald-100/30">
                                            <div className="flex items-start gap-2">
                                                <PinIcon className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold text-emerald-950">Penataan di Rak:</span>{" "}
                                                    <span className="leading-relaxed block sm:inline">{tactic.actionDisplay}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 border-t border-emerald-100/30 pt-2">
                                                <ChatIcon className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold text-emerald-950">Tawaran di Kasir:</span>{" "}
                                                    <span className="leading-relaxed block sm:inline">{tactic.actionCashier}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </WidgetSection>
                )}

                {widget.insight && (
                    <div className="rounded-[8px] border border-blue-200 bg-blue-50/40 p-3 text-sm text-blue-800 leading-6 flex items-start gap-2.5">
                        <MegaphoneIcon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <strong>Rangkuman Insight Terintegrasi:</strong> {widget.insight}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
