import { useState } from 'react';
import { MapPin, MessageSquare, Megaphone, Lightbulb } from 'lucide-react';
import { getMetric, WidgetSection, getProductImageUrl } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { IntegratedMatrixChart } from '@/features/workspace/dashboard/analytics/AnalyticsCharts';



function HighlightProductText({ text, itemA, itemB }) {
    if (!text) return null;
    if (!itemA && !itemB) return <span>{text}</span>;

    const escapeRegex = (str) => (str ? str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '');
    const patterns = [itemA, itemB].filter(Boolean).map(escapeRegex);
    if (!patterns.length) return <span>{text}</span>;

    const regex = new RegExp(`(${patterns.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, index) => {
                const lowerPart = part.toLowerCase();
                const isItemA = itemA && lowerPart === itemA.toLowerCase();
                const isItemB = itemB && lowerPart === itemB.toLowerCase();

                if (isItemA) {
                    return (
                        <span
                            key={index}
                            className="inline-flex items-center rounded px-1.5 py-0.5 font-bold text-xs bg-blue-100 text-blue-950 border border-blue-300 shadow-sm mx-0.5"
                        >
                            {part}
                        </span>
                    );
                }

                if (isItemB) {
                    return (
                        <span
                            key={index}
                            className="inline-flex items-center rounded px-1.5 py-0.5 font-bold text-xs bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-sm mx-0.5"
                        >
                            {part}
                        </span>
                    );
                }

                return <span key={index}>{part}</span>;
            })}
        </span>
    );
}

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
            helper: totalMetric?.helper ?? 'Total penjualan.',
        },
    ];

    const getStoreLocationRecommendation = (itemA = '', itemB = '') => {
        const text = (itemA + ' ' + itemB).toLowerCase();
        
        if (/semen|pasir|besi|batu|bata|cor|beton|material|pondasi|mortar/i.test(text)) {
            return `📍 Area Pelataran Utama / Loading Dock Depan: Posisikan tumpukan ${itemA} di atas palet lantai area depan, bersebelahan dengan ${itemB} agar armada truk & kuli toko langsung sekali muat saat bongkar-pasang kargo.`;
        }
        if (/pipa|kayu|seng|baja|plumbing|atap|triplek|hollow|alumunium/i.test(text)) {
            return `📍 Lorong Rak Horizontal Panjang: Taruh ${itemA} pada rak besi bertingkat horizontal khusus barang panjang, dan pasang keranjang gantung aksesoris ${itemB} persis di seberang/ujung lorong rak tersebut.`;
        }
        if (/cat|kuas|thinner|amplas|lakban|rol|compound/i.test(text)) {
            return `🎨 Zone Cat & Mix Colour / Display Eye-Level Kasir: Tempatkan kaleng ${itemA} di rak display Zone Cat, dan gantungkan ${itemB} pada hook pegboard setinggi pandangan mata (eye-level) tepat di samping kaleng cat.`;
        }
        if (/kran|lem|fitting|stop|seal/i.test(text)) {
            return `🚰 Etalase Fast-Moving Plumbing (Depan Kasir): Taruh ${itemA} di etalase berpetak plumbing, dan sandingkan wadah display aksesoris ${itemB} di rak bawah kasir untuk memicu pembelian otomatis.`;
        }
        if (/sekop|cangkul|kawat|paku|engsel|tang|palu|gergaji/i.test(text)) {
            return `🛠️ Rak Gantung Perkakas Pertukangan (Pegboard): Gantungkan ${itemA} pada wall-display pegboard pertukangan, dan posisikan keranjang ${itemB} di bawahnya agar pembeli alat langsung mengambil pelengkapnya.`;
        }
        if (/listrik|kabel|saklar|isolatip|stop kontak/i.test(text)) {
            return `⚡ Etalase Kaca Depan Kasir (Hardware & Kelistrikan): Pajang ${itemA} di dalam etalase kaca kasir, dan posisikan ${itemB} di rak display gantung impulsif tepat di atas etalase.`;
        }
        
        return `📦 Rak Display Utama Toko (Eye-Level): Posisikan ${itemA} dan ${itemB} bersebelahan pada ketinggian pandangan mata (eye-level) di rak display utama toko.`;
    };

    const getStrategyTactic = (antecedentAbc, consequentAbc, antecedentName = '', consequentName = '') => {
        const customLocation = getStoreLocationRecommendation(antecedentName, consequentName);

        if (antecedentAbc === 'A' && consequentAbc === 'C') {
            return {
                title: 'Taktik Jual Silang (Utama → Tambahan)',
                desc: 'Tempatkan aksesoris di dekat produk inti atau tawarkan langsung sebagai pelengkap saat transaksi untuk memicu pembelian impulsif.',
                actionDisplay: customLocation,
                actionCashier: `Latih kasir untuk menawarkan ${consequentName} ini sebagai pelengkap opsional saat pelanggan membayar ${antecedentName}.`,
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
                actionCashier: `Berikan penawaran diskon potongan langsung jika ${antecedentName} dan ${consequentName} dibeli secara bersamaan.`,
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
                actionCashier: `Ingatkan pelanggan mengenai ketersediaan paket belanja hemat untuk ${antecedentName} dan ${consequentName}.`,
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
            actionCashier: `Gunakan gantungan promosi (shelf talker) bertuliskan "Sering Dibeli Bersama" di bawah label harga rak ${antecedentName}.`,
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
                    <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/20 p-3 shadow-widget-tiny select-none">
                        <h5 className="text-sm font-semibold text-blue-900 mb-2">Petunjuk Kategori Prioritas Barang (Analisis ABC):</h5>
                        <div className="grid gap-2 sm:grid-cols-3">
                            <div className="rounded-md border border-tab-active-border-x bg-white p-2.5 shadow-widget-small">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0 bg-badge-group-a">
                                        Kat. A
                                    </span>
                                    <span className="text-xs font-semibold text-brand-darker">(Utama)</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">80% omzet</span> toko. Prioritas utama, stok wajib dijaga ketat.</p>
                            </div>
                            <div className="rounded-md border border-emerald-100 bg-white p-2.5 shadow-widget-small">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0 bg-green-410">
                                        Kat. B
                                    </span>
                                    <span className="text-xs font-semibold text-brand-darker">(Stabil)</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">15% omzet</span> toko. Penjualan stabil untuk kebutuhan rutin.</p>
                            </div>
                            <div className="rounded-md border border-amber-100 bg-white p-2.5 shadow-widget-small">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0 bg-warning">
                                        Kat. C
                                    </span>
                                    <span className="text-xs font-semibold text-brand-darker">(Tambahan)</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">5% omzet</span> toko. Produk pelengkap/aksesoris penunjang.</p>
                            </div>
                        </div>
                    </div>

                    {widget.rules && widget.rules.length > 0 ? (
                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                            {(widget.rules ?? []).map((rule, idx) => {
                                const tactic = getStrategyTactic(rule.antecedentAbc, rule.consequentAbc, rule.antecedent, rule.consequent);
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
                                                <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-100 px-1.5 py-1">
                                                    <img
                                                        src={getProductImageUrl(rule.antecedent)}
                                                        alt=""
                                                        className="h-6 w-6 rounded-[3px] border border-slate-200 object-cover shrink-0"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-[380px] lg:max-w-[480px]" title={rule.antecedent}>
                                                        {rule.antecedent}
                                                    </span>
                                                    {rule.antecedentAbc && (
                                                        <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: rule.antecedentColor }} title={rule.antecedentAbc === 'A' ? 'Omzet Utama' : rule.antecedentAbc === 'B' ? 'Omzet Stabil' : 'Omzet Tambahan'}>
                                                            Kat. {rule.antecedentAbc}
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="text-blue-500 font-semibold text-base px-1">+</span>

                                                <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-100 px-1.5 py-1">
                                                    <img
                                                        src={getProductImageUrl(rule.consequent)}
                                                        alt=""
                                                        className="h-6 w-6 rounded-[3px] border border-slate-200 object-cover shrink-0"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-[380px] lg:max-w-[480px]" title={rule.consequent}>
                                                        {rule.consequent}
                                                    </span>
                                                    {rule.consequentAbc && (
                                                        <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: rule.consequentColor }} title={rule.consequentAbc === 'A' ? 'Omzet Utama' : rule.consequentAbc === 'B' ? 'Omzet Stabil' : 'Omzet Tambahan'}>
                                                            Kat. {rule.consequentAbc}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold border shrink-0 ${tactic.bg}`}>
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tactic.badgeBg }}></span>
                                                    {tactic.title}
                                                </span>

                                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-800 shrink-0" title="Tingkat Kepastian Hubungan Pasangan Produk">
                                                    Tingkat Kepastian: {rule.confidence}
                                                </span>

                                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-800 shrink-0" title="Daya Dorong Penjualan (Lift Ratio)">
                                                    Daya Dorong: {rule.lift}x ({strengthText})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-2.5 border-t border-slate-100 pt-2.5 flex flex-col gap-2.5 text-sm text-slate-700 bg-emerald-50/15 rounded-md p-2.5 border border-emerald-100/50">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold text-emerald-950">Penataan di Rak:</span>{" "}
                                                    <span className="leading-relaxed block sm:inline">
                                                        <HighlightProductText text={tactic.actionDisplay} itemA={rule.antecedent} itemB={rule.consequent} />
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 border-t border-emerald-100/40 pt-2">
                                                <MessageSquare className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold text-emerald-950">Tawaran di Kasir:</span>{" "}
                                                    <span className="leading-relaxed block sm:inline">
                                                        <HighlightProductText text={tactic.actionCashier} itemA={rule.antecedent} itemB={rule.consequent} />
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
