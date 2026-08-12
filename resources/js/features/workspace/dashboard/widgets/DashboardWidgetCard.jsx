import { useEffect, useState } from 'react';
import { Info, ExternalLink, RefreshCw, GripVertical } from 'lucide-react';

import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';

function WidgetHeaderAction({ label, onClick, disabled = false, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-tab-active-text transition hover:bg-workspace-hover-bg disabled:cursor-not-allowed disabled:opacity-45 ${disabled ? '' : 'cursor-pointer'}`.trim()}
            aria-label={label}
        >
            {children}
        </button>
    );
}

export default function DashboardWidgetCard({
    widget,
    children,
    onRefresh,
    isRefreshing = false,
    refreshError = null,
    showRefresh = false,
    dragHandleProps = {},
}) {
    const [sourceModalOpen, setSourceModalOpen] = useState(false);
    const [isInternalLoading, setIsInternalLoading] = useState(false);

    useEffect(() => {
        const handleLoadingState = (e) => {
            const { widgetId, isLoading } = e.detail || {};
            if (widgetId === 'all' || widgetId === widget.id) {
                setIsInternalLoading(Boolean(isLoading));
            }
        };
        window.addEventListener('pos:widget-loading-state', handleLoadingState);
        return () => window.removeEventListener('pos:widget-loading-state', handleLoadingState);
    }, [widget.id]);

    const isWidgetLoading = isRefreshing || isInternalLoading;

    const WIDGET_SOURCE_PAGES = {
        'integrated-analysis': {
            title: 'Analisis Kombinasi Apriori & ABC',
            description: 'Widget ini menggunakan algoritma asosiasi penjualan (Apriori) dan klasifikasi omzet produk (ABC). Datanya diinput melalui:',
            sources: [
                { pageId: 'sales-invoice', label: 'Faktur Penjualan' },
                { pageId: 'items-services', label: 'Barang & Jasa' },
            ]
        },
        'recent-activity': { pageId: 'activity-log', label: 'Log Aktivitas' },
        'sales-trend': { pageId: 'sales-invoice', label: 'Faktur Penjualan' },
        'profit-loss': {
            title: 'Laba/Rugi Tahun Ini',
            description: 'Widget ini menghitung estimasi laba bersih dari total penjualan dikurangi HPP (kuantitas terjual × Harga Beli Barang) dan pengeluaran operasional:',
            sources: [
                { pageId: 'sales-invoice', label: 'Faktur Penjualan (Sumber Pendapatan)' },
                { pageId: 'items-services', label: 'Barang & Jasa (Sumber Harga Beli / HPP)' },
                { pageId: 'expense-entry', label: 'Pencatatan Beban (Beban Operasional)' },
                { pageId: 'payroll-entry', label: 'Pencatatan Gaji (Beban Gaji Karyawan)' },
            ]
        },
        'cash-flow': {
            title: 'Arus Kas',
            description: 'Widget ini membandingkan kas masuk dan kas keluar harian dari modul berikut:',
            sources: [
                { pageId: 'sales-invoice', label: 'Faktur Penjualan (Kas Masuk)' },
                { pageId: 'expense-entry', label: 'Pencatatan Beban (Kas Keluar)' },
                { pageId: 'payroll-entry', label: 'Pencatatan Gaji (Kas Keluar)' },
            ]
        },
        'company-expense': {
            title: 'Beban Toko',
            description: 'Widget ini membagi pengeluaran toko ke dalam dua kategori beban:',
            sources: [
                { pageId: 'expense-entry', label: 'Pencatatan Beban (Beban Operasional)' },
                { pageId: 'payroll-entry', label: 'Pencatatan Gaji (Gaji Karyawan)' },
            ]
        },
        'sales-summary': { pageId: 'sales-invoice', label: 'Faktur Penjualan' },
        'purchase-summary': { pageId: 'purchase-invoice', label: 'Faktur Pembelian' },
        'top-products': {
            title: 'Barang Paling Laku',
            description: 'Widget ini menghitung akumulasi kuantitas barang terlaris dari rincian transaksi penjualan:',
            sources: [
                { pageId: 'sales-invoice', label: 'Faktur Penjualan (Sumber Transaksi Penjualan)' },
                { pageId: 'items-services', label: 'Barang & Jasa (Master Data Barang)' },
            ]
        },
        'cash-availability': {
            title: 'Ketersediaan Kas',
            description: 'Widget ini menghitung estimasi saldo kas berjalan dari mutasi transaksi:',
            sources: [
                { pageId: 'sales-invoice', label: 'Faktur Penjualan (Kas Masuk)' },
                { pageId: 'expense-entry', label: 'Pencatatan Beban (Kas Keluar)' },
                { pageId: 'payroll-entry', label: 'Pencatatan Gaji (Kas Keluar)' },
            ]
        },
    };

    const WIDGET_TOOLTIPS = {
        'integrated-analysis': 'Rekomendasi pasangan barang yang paling sering dibeli bersamaan oleh pelanggan (Apriori 3 bulan terakhir) beserta kelompok omzetnya (ABC) untuk panduan membuat promo bundling dan menata letak rak toko.',
        'sales-trend': 'Grafik pergerakan total uang penjualan toko dari hari ke hari selama 7 hari terakhir.',
        'profit-loss': 'Perhitungan total omzet penjualan dikurangi harga modal barang (HPP) dan biaya operasional toko untuk melihat estimasi keuntungan bersih.',
        'cash-flow': 'Perbandingan total uang kas masuk dari penjualan dengan uang kas keluar untuk operasional toko.',
        'company-expense': 'Pembagian total pengeluaran toko ke dalam beban operasional rutin dan gaji karyawan.',
        'top-products': 'Daftar barang yang paling banyak dibeli oleh pelanggan berdasarkan akumulasi jumlah unit yang terjual.',
        'cash-availability': 'Estimasi jumlah saldo kas berjalan toko yang tersisa dari mutasi transaksi.',
        'abc-analysis': 'Pengelompokan barang berdasarkan kontribusi omzet: Kategori A (Penyumbang 80% omzet utama), B (Omzet sedang 15%), dan C (Omzet kecil 5%).',
        'apriori-analysis': 'Pola kombinasi produk yang paling sering dibeli secara bersamaan oleh pelanggan.',
        'recent-activity': 'Catatan riwayat transaksi dan penginputan data terbaru yang dilakukan oleh kasir dan pengelola toko.',
    };

    const widgetKey = widget.sourceWidgetId ?? widget.id;
    const sourcePage = WIDGET_SOURCE_PAGES[widgetKey] ?? WIDGET_SOURCE_PAGES[widget.type];
    const tooltipText = WIDGET_TOOLTIPS[widgetKey] ?? WIDGET_TOOLTIPS[widget.id] ?? WIDGET_TOOLTIPS[widget.type];

    const isEmptyData =
        (widget.type === 'abc-analysis' && (!widget.topItems || widget.topItems.length === 0)) ||
        (widget.type === 'apriori-analysis' && (!widget.rules || widget.rules.length === 0)) ||
        (widget.id === 'integrated-analysis' && (!widget.rules || widget.rules.length === 0));

    const baseHeightClass = isEmptyData ? 'min-h-0 h-auto' : widget.heightClass;

    const resolvedHeightClass = (widget.type === 'line' || widget.type === 'cash-availability') && baseHeightClass === 'min-h-[310px]'
        ? 'min-h-[260px]'
        : widget.type === 'summary'
            ? 'min-h-[210px]'
            : baseHeightClass;

    const isAbcApriori = widget.id === 'integrated-analysis' || widget.type === 'abc-apriori';
    const headerPaddingClass = isAbcApriori ? 'py-3' : 'py-2';

    return (
        <>
            <Panel className={`relative z-[1] hover:z-[5] transition-all duration-150 flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-chart-border bg-white/98 ${resolvedHeightClass}`.trim()}>
                <div className={`flex flex-wrap items-start justify-between gap-2 border-b border-table-row-border px-3 ${headerPaddingClass} sm:flex-nowrap sm:items-center sm:px-4`}>
                    <div className="min-w-0 flex-1 flex items-center">
                        <div
                            {...dragHandleProps}
                            className="mr-2 flex shrink-0 cursor-grab items-center text-tab-active-text opacity-45 hover:opacity-100 active:cursor-grabbing py-1 px-0.5"
                            title="Seret untuk mengubah urutan widget"
                        >
                            <GripVertical className="h-4 w-4 fill-current text-slate-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <h3 className="break-words text-sm lg:text-base font-medium text-tab-active-text">
                                    {widget.title === 'Beban Perusahaan' ? 'Beban Toko' : widget.title}
                                </h3>
                                {tooltipText && (
                                    <span
                                        className="group relative inline-flex shrink-0 cursor-pointer items-center text-slate-400 hover:text-brand-blue"
                                        aria-label="Informasi widget"
                                    >
                                        <Info className="h-4 w-4 text-slate-400 hover:text-brand-blue" />
                                        <span className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-64 rounded-md border border-slate-700 bg-slate-900 p-2.5 text-xs text-white shadow-xl group-hover:block sm:w-72 leading-relaxed font-normal">
                                            {tooltipText}
                                        </span>
                                    </span>
                                )}
                            </div>
                            {widget.subtitle ? (
                                <p className={`mt-1 break-words text-sm ${widgetKey === 'sales-summary' || widgetKey === 'purchase-summary' || widget.type === 'summary' ? 'text-text-light' : 'text-black'}`}>{widget.subtitle}</p>
                            ) : null}
                            {refreshError ? <p className="mt-1 text-sm text-orange-880">{refreshError}</p> : null}
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                        {showRefresh && (
                            <WidgetHeaderAction
                                label={isRefreshing ? `Memuat ulang widget ${widget.title}` : `Refresh widget ${widget.title}`}
                                onClick={() => onRefresh?.(widget)}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-4 w-4 text-slate-500 ${isRefreshing ? 'animate-spin text-brand-blue' : ''}`} />
                            </WidgetHeaderAction>
                        )}
                        {sourcePage && (
                            <WidgetHeaderAction
                                label={`Lihat asal data ${widget.title}`}
                                onClick={() => {
                                    if (sourcePage.sources) {
                                        setSourceModalOpen(true);
                                    } else if (sourcePage.pageId) {
                                        window.dispatchEvent(
                                            new CustomEvent('workspace:open-page', {
                                                detail: { 
                                                    pageId: sourcePage.pageId,
                                                    targetTabId: `${sourcePage.pageId}-view`
                                                },
                                            })
                                        );
                                    }
                                }}
                            >
                                <ExternalLink className="h-4 w-4 text-slate-500 hover:text-brand-blue" />
                            </WidgetHeaderAction>
                        )}
                    </div>
                </div>
                <div className="relative flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
                    {isWidgetLoading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-[2px] transition-all duration-200">
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm text-xs font-semibold text-slate-700">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-blue" />
                                <span>Memuat data...</span>
                            </div>
                        </div>
                    )}
                    {children}
                </div>
            </Panel>

            {sourcePage?.sources && (
                <WorkspaceDialog
                    open={sourceModalOpen}
                    onClose={() => setSourceModalOpen(false)}
                    title={`Sumber Data: ${sourcePage.title}`}
                    closeLabel="Tutup modal sumber data"
                    maxWidthClassName="max-w-[480px]"
                    footer={(
                        <div className="flex justify-end">
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={() => setSourceModalOpen(false)}
                                className="rounded-[4px] border-brand-blue-border-light text-brand-blue-dark shadow-none"
                            >
                                Tutup
                            </Button>
                        </div>
                    )}
                >
                    <div className="space-y-4">
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{sourcePage.description}</p>
                        <div className="flex flex-col gap-2">
                            {sourcePage.sources.map((src) => (
                                <button
                                    key={src.pageId}
                                    type="button"
                                    onClick={() => {
                                        setSourceModalOpen(false);
                                        window.dispatchEvent(
                                            new CustomEvent('workspace:open-page', {
                                                detail: { 
                                                    pageId: src.pageId,
                                                    targetTabId: `${src.pageId}-view`
                                                },
                                            })
                                        );
                                    }}
                                    className="flex w-full items-center justify-between rounded-[6px] border border-ui-border-medium bg-tab-active-bg px-4 py-3 text-left text-sm font-medium text-tab-active-text transition hover:bg-workspace-hover-bg hover:border-brand-blue"
                                >
                                    <span>{src.label}</span>
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </WorkspaceDialog>
            )}
        </>
    );
}
