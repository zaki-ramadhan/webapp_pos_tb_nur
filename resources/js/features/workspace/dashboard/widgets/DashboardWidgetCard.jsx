import { useRef, useState } from 'react';

import Button from '@/components/ui/Button';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import Panel from '@/components/ui/Panel';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { KebabIcon, PencilIcon, RefreshIcon } from '@/features/workspace/shared/Icons';

function WidgetHeaderAction({ label, onClick, disabled = false, buttonRef = null, children }) {
    return (
        <button
            ref={buttonRef}
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
    onRename,
    onRemove,
    isRefreshing = false,
    refreshError = null,
    showRefresh = false,
    canRemove = true,
}) {
    const [actionsOpen, setActionsOpen] = useState(false);
    const actionsButtonRef = useRef(null);
    const [sourceModalOpen, setSourceModalOpen] = useState(false);

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
        'upcoming-activity': { pageId: 'payroll-entry', label: 'Pencatatan Gaji' },
        'sales-trend': { pageId: 'sales-invoice', label: 'Faktur Penjualan' },
        'profit-loss': {
            title: 'Laba/Rugi Tahun Ini',
            description: 'Widget ini menghitung estimasi laba bersih berdasarkan data transaksi gabungan:',
            sources: [
                { pageId: 'sales-invoice', label: 'Faktur Penjualan (Pendapatan)' },
                { pageId: 'items-services', label: 'Harga Beli Standar Barang (HPP)' },
                { pageId: 'expense-entry', label: 'Pencatatan Beban (Operasional)' },
                { pageId: 'payroll-entry', label: 'Pencatatan Gaji (Gaji Karyawan)' },
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
        'sales-team-performance': { pageId: 'employees', label: 'Karyawan' },
        'top-products': { pageId: 'items-services', label: 'Barang & Jasa' },
        'overdue-activity': {
            title: 'Kegiatan Terlewat',
            description: 'Widget ini memantau faktur penjualan/pembelian yang melewati jatuh tempo:',
            sources: [
                { pageId: 'sales-invoice', label: 'Faktur Penjualan' },
                { pageId: 'purchase-invoice', label: 'Faktur Pembelian' },
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
        'sales-order-status': { pageId: 'sales-invoice', label: 'Faktur Penjualan' },
    };

    const widgetKey = widget.sourceWidgetId ?? widget.id;
    const sourcePage = WIDGET_SOURCE_PAGES[widgetKey] ?? WIDGET_SOURCE_PAGES[widget.type];

    const resolvedHeightClass = (widget.type === 'line' || widget.type === 'cash-availability') && widget.heightClass === 'min-h-[310px]'
        ? 'min-h-[260px]'
        : widget.heightClass;

    return (
        <>
            <Panel className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-chart-border bg-white/98 ${resolvedHeightClass}`.trim()}>
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-table-row-border px-3 py-3 sm:flex-nowrap sm:items-center sm:px-4">
                    <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-medium text-tab-active-text">{widget.title}</h3>
                        {widget.subtitle ? (
                            <p className="mt-1 break-words text-sm text-text-light">{widget.subtitle}</p>
                        ) : null}
                        {refreshError ? <p className="mt-1 text-sm text-orange-880">{refreshError}</p> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                        {showRefresh && (
                            <WidgetHeaderAction
                                label={isRefreshing ? `Memuat ulang widget ${widget.title}` : `Refresh widget ${widget.title}`}
                                onClick={() => onRefresh?.(widget)}
                                disabled={isRefreshing}
                            >
                                <RefreshIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-brand-blue' : ''}`} />
                            </WidgetHeaderAction>
                        )}
                        <div className="relative">
                            <WidgetHeaderAction
                                label={`Opsi widget ${widget.title}`}
                                onClick={() => setActionsOpen((currentValue) => !currentValue)}
                                buttonRef={actionsButtonRef}
                            >
                                <KebabIcon />
                            </WidgetHeaderAction>
                            <DropdownMenu
                                open={actionsOpen}
                                onClose={() => setActionsOpen(false)}
                                anchorRef={actionsButtonRef}
                                widthClassName="w-[180px]"
                                className="z-[60]"
                            >
                                <DropdownMenuItem
                                    onClick={() => {
                                        setActionsOpen(false);
                                        onRename?.(widget);
                                    }}
                                    icon={<PencilIcon />}
                                    className="text-sm font-medium text-brand-darker"
                                >
                                    Ubah judul
                                </DropdownMenuItem>
                                {sourcePage && (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setActionsOpen(false);
                                            if (sourcePage.sources) {
                                                setSourceModalOpen(true);
                                            } else {
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
                                        icon={
                                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                                            </svg>
                                        }
                                        className="text-sm font-medium text-brand-darker"
                                    >
                                        Lihat asal data
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => {
                                        setActionsOpen(false);
                                        onRemove?.(widget);
                                    }}
                                    disabled={!canRemove}
                                    title={!canRemove ? 'Minimal harus tersisa 1 widget' : undefined}
                                    icon={
                                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                        </svg>
                                    }
                                    className={`text-sm font-medium text-red-350 animate-fade-in ${!canRemove ? 'opacity-40' : ''}`}
                                >
                                    Hapus widget
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">{children}</div>
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
