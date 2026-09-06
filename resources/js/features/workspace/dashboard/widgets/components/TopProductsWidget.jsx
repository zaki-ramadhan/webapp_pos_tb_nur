import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';

function parseShareNumber(shareStr) {
    if (typeof shareStr === 'number') return shareStr;
    if (!shareStr) return 0;
    const clean = String(shareStr).replace('%', '').replace(',', '.').trim();
    return Math.min(100, Math.max(0, parseFloat(clean) || 0));
}

function handleOpenProduct(item) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent('workspace:open-page', {
                detail: {
                    pageId: 'items-services',
                    recordId: item.id ?? item.productId ?? undefined,
                    label: item.name,
                    tabLabel: item.name,
                    openForm: Boolean(item.id ?? item.productId),
                },
            })
        );
    }
}

function LinearStyleItem({ item, index }) {
    const [imgError, setImgError] = useState(false);
    const shareNum = parseShareNumber(item.share);
    const imageUrl = item.imageUrl || item.image || null;

    return (
        <div
            onClick={() => handleOpenProduct(item)}
            className="group flex items-center gap-2.5 py-2 px-1 transition-colors cursor-pointer hover:bg-slate-50/80 rounded-[4px]"
        >
            <span className="font-mono text-xs font-semibold text-slate-400 w-4 text-center shrink-0 group-hover:text-slate-700">
                {String(index + 1).padStart(2, '0')}
            </span>

            <div className="relative h-8 w-8 shrink-0 rounded-[4px] border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                {imageUrl && !imgError ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                )}
            </div>

            <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
                <p className="truncate text-xs sm:text-sm font-medium text-slate-800 group-hover:text-[#16499A] transition-colors" title={item.name}>
                    {item.name}
                </p>
                <div className="h-[3px] w-full bg-slate-100 rounded-[2px] overflow-hidden">
                    <div
                        className="h-full bg-[#16499A] rounded-[2px] transition-all duration-300"
                        style={{ width: `${Math.max(shareNum, 4)}%` }}
                    />
                </div>
            </div>

            <div className="shrink-0 text-right flex flex-col items-end gap-0.5 min-w-[70px]">
                <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#16499A]">
                    {item.revenue}
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                    {item.units}
                </span>
            </div>
        </div>
    );
}

function SubtleCardItem({ item, index }) {
    const [imgError, setImgError] = useState(false);
    const shareNum = parseShareNumber(item.share);
    const imageUrl = item.imageUrl || item.image || null;
    const isTop = index === 0;

    return (
        <div
            onClick={() => handleOpenProduct(item)}
            className="group relative overflow-hidden rounded-[4px] border border-slate-200 bg-white transition-all hover:border-blue-300 hover:shadow-xs cursor-pointer px-2.5 py-1.5"
        >
            <div
                className="absolute inset-y-0 left-0 bg-blue-50/70 pointer-events-none transition-all duration-300"
                style={{ width: `${Math.max(shareNum, 3)}%` }}
            />

            <div className="relative z-10 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-[3px] text-[10px] font-bold ${
                        isTop ? 'bg-[#16499A] text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                        {index + 1}
                    </span>

                    <div className="relative h-8 w-8 shrink-0 rounded-[4px] border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {imageUrl && !imgError ? (
                            <img
                                src={imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-medium text-slate-800 group-hover:text-[#16499A] transition-colors" title={item.name}>
                            {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 font-normal truncate">
                            {item.units} <span className="text-slate-400">•</span> <span className="text-slate-600 font-medium">{item.share}</span>
                        </p>
                    </div>
                </div>

                <div className="shrink-0 text-right flex flex-col items-end">
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#16499A]">
                        {item.revenue}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                        Omzet
                    </span>
                </div>
            </div>
        </div>
    );
}

function CompactLedgerTable({ items }) {
    return (
        <div className="w-full overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        <th className="py-1 px-1.5 w-6 text-center">No</th>
                        <th className="py-1 px-1.5">Produk</th>
                        <th className="py-1 px-1.5 text-right">Kuantitas</th>
                        <th className="py-1 px-1.5 text-center w-24">Porsi</th>
                        <th className="py-1 px-1.5 text-right">Omzet</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                    {items.map((item, index) => {
                        const shareNum = parseShareNumber(item.share);
                        return (
                            <tr
                                key={item.name}
                                onClick={() => handleOpenProduct(item)}
                                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                            >
                                <td className="py-1.5 px-1.5 text-center text-slate-400 font-mono text-[11px] group-hover:text-slate-700">
                                    {index + 1}
                                </td>
                                <td className="py-1.5 px-1.5">
                                    <div className="flex items-center gap-1.5 min-w-0 max-w-[150px] sm:max-w-[200px]">
                                        <div className="h-6 w-6 shrink-0 rounded-[3px] border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-3 w-3 text-slate-400" />
                                            )}
                                        </div>
                                        <span className="truncate font-medium text-slate-800 group-hover:text-[#16499A]" title={item.name}>
                                            {item.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-1.5 px-1.5 text-right text-slate-600 font-medium whitespace-nowrap">
                                    {item.units}
                                </td>
                                <td className="py-1.5 px-1.5">
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <div className="h-1.5 w-10 bg-slate-100 rounded-[1px] overflow-hidden shrink-0">
                                            <div
                                                className="h-full bg-[#16499A] rounded-[1px]"
                                                style={{ width: `${Math.max(shareNum, 5)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono w-6 text-right">
                                            {item.share}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-1.5 px-1.5 text-right font-semibold text-slate-800 group-hover:text-[#16499A] whitespace-nowrap">
                                    {item.revenue}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function TopProductsWidget({ widget }) {
    const [selectedStyle, setSelectedStyle] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('pos_tb_nur_top_product_style') || 'linear';
        }
        return 'linear';
    });

    const handleSelectStyle = (styleKey) => {
        setSelectedStyle(styleKey);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('pos_tb_nur_top_product_style', styleKey);
            } catch (e) {}
        }
    };

    const items = widget.items ?? [];
    if (!items.length) {
        return (
            <DashboardWidgetEmptyState
                title="Tidak ada data"
                description="Belum ada peringkat barang terlaris."
            />
        );
    }

    return (
        <div className="flex h-full flex-col gap-2 min-h-0">
            {/* Minimalist Style Switcher Toolbar */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 shrink-0">
                <span className="text-[11px] text-slate-500 font-normal">
                    Pilih Gaya Tampilan:
                </span>
                <div className="inline-flex rounded-[4px] border border-slate-200 bg-slate-100 p-0.5">
                    <button
                        type="button"
                        onClick={() => handleSelectStyle('linear')}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-[3px] transition-all cursor-pointer ${
                            selectedStyle === 'linear'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Gaya 1: Garis meter tipis minimalis"
                    >
                        Gaya 1
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSelectStyle('card')}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-[3px] transition-all cursor-pointer ${
                            selectedStyle === 'card'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Gaya 2: Kartu dengan arsiran volume"
                    >
                        Gaya 2
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSelectStyle('ledger')}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-[3px] transition-all cursor-pointer ${
                            selectedStyle === 'ledger'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Gaya 3: Tabel data mikro finansial"
                    >
                        Gaya 3
                    </button>
                </div>
            </div>

            {/* Widget Content Body */}
            <div className="flex-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                {selectedStyle === 'linear' && (
                    <div className="divide-y divide-slate-100">
                        {items.map((item, index) => (
                            <LinearStyleItem key={item.name} item={item} index={index} />
                        ))}
                    </div>
                )}
                {selectedStyle === 'card' && (
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <SubtleCardItem key={item.name} item={item} index={index} />
                        ))}
                    </div>
                )}
                {selectedStyle === 'ledger' && (
                    <CompactLedgerTable items={items} />
                )}
            </div>
        </div>
    );
}
