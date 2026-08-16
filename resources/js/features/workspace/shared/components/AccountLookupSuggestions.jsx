import { useMemo } from 'react';
import { LoadingIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { HighlightText, LookupDropdownSurface, LookupEmptyState } from '@/features/workspace/shared/LookupPrimitives';
import { buildAccountLookupLabel, buildAccountLookupMeta, translateAccountType } from '@/features/workspace/shared/hooks/useAccountLookupController';
import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

function resolveDocumentTypeLabel(record, resource) {
    if (record.numbering_type) return record.numbering_type;
    const docType = record.document_type || record.type;
    const typeMap = {
        sales_invoice: 'Faktur Penjualan',
        purchase_invoice: 'Faktur Pembelian',
        sales_delivery: 'Pengiriman Penjualan',
        delivery_order: 'Pengiriman Penjualan',
        goods_receipt: 'Penerimaan Barang',
        sales_order: 'Pesanan Penjualan',
        purchase_order: 'Pesanan Pembelian',
        sales_quote: 'Penawaran Penjualan',
        sales_return: 'Retur Penjualan',
        purchase_return: 'Retur Pembelian',
        item_request: 'Permintaan Barang',
        sales_deposit: 'Uang Muka Penjualan',
    };
    if (typeMap[docType]) return typeMap[docType];

    const resourceMap = {
        'sales-invoices': 'Faktur Penjualan',
        'purchase-invoices': 'Faktur Pembelian',
        'sales-deliveries': 'Pengiriman Penjualan',
        'goods-receipts': 'Penerimaan Barang',
        'sales-orders': 'Pesanan Penjualan',
        'purchase-orders': 'Pesanan Pembelian',
        'sales-quotes': 'Penawaran Penjualan',
        'sales-returns': 'Retur Penjualan',
        'purchase-returns': 'Retur Pembelian',
        'item-requests': 'Permintaan Barang',
        'sales-deposits': 'Uang Muka Penjualan',
    };
    return resourceMap[resource] ?? 'Faktur';
}

export default function AccountLookupSuggestions({
    open,
    query,
    loading,
    error,
    rows,
    selectedLabels,
    onSelectAccount,
    emptyLabel,
    loadingLabel,
    className = '',
    anchorRef = null,
    showType = false,
    resource = 'accounts',
}) {
    const entityLabels = {
        accounts: 'akun perkiraan',
        products: 'barang',
        'shipping-methods': 'metode pengiriman',
        'fob-terms': 'syarat FOB',
        employees: 'kontak/karyawan',
        customers: 'pelanggan',
        vendors: 'pemasok',
        suppliers: 'pemasok',
        warehouses: 'gudang',
        departments: 'departemen',
        branches: 'cabang',
        users: 'pengguna',
    };

    const entityName = entityLabels[resource] ?? 'data';
    const resolvedEmptyLabel = emptyLabel ?? 'Tidak ada data.';
    const resolvedLoadingLabel = loadingLabel ?? `Memuat ${entityName}...`;

    const selectedLabelSet = useMemo(() => new Set(selectedLabels), [selectedLabels]);
    const emptyMessage = query.trim()
        ? 'Tidak ada data.'
        : resolvedEmptyLabel;

    if (!open) {
        return null;
    }

    return (
        <LookupDropdownSurface className={className} anchorRef={anchorRef}>
            <div className="max-h-[280px] overflow-y-auto bg-white flex-1 min-h-0">
                {loading ? (
                    <div className="px-4 py-5 text-center text-sm font-normal text-text-workspace-muted">{resolvedLoadingLabel}</div>
                ) : error ? (
                    <div className="px-4 py-5 text-center text-sm text-red-850">{error}</div>
                ) : rows.length ? (
                    rows.map((record) => {
                        const label = buildAccountLookupLabel(record, resource);
                        const selected = selectedLabelSet.has(label);

                        const isDoc = Boolean(record.document_number);
                        const title = isDoc ? record.document_number : (record.name ?? record.full_name ?? record.label ?? '-');
                        const code = isDoc ? '' : (record.code ?? record.employee_code ?? '');

                        const rawDate = record.entry_date || record.document_date || record.date || record.created_at || record.transaction_date;
                        let dateStr = '';
                        if (rawDate) {
                            dateStr = formatIsoDate(rawDate);
                        }

                        let subtitleLeft = code;
                        let subtitleRight = null;

                        if (resource === 'sales-deposits') {
                            subtitleLeft = dateStr;
                            const totalAmt = parseFloat(String(record.total_amount ?? 0).replace(/[^0-9.-]+/g, '')) || 0;
                            const paidAmt = parseFloat(String(record.paid_amount ?? 0).replace(/[^0-9.-]+/g, '')) || 0;
                            const rawOutstanding = record.outstanding_amount;
                            const parsedOutstanding = rawOutstanding !== undefined && rawOutstanding !== null && rawOutstanding !== ''
                                ? parseFloat(String(rawOutstanding).replace(/[^0-9.-]+/g, ''))
                                : NaN;
                            
                            const sisaSaldo = !isNaN(parsedOutstanding) && (parsedOutstanding > 0 || paidAmt > 0)
                                ? parsedOutstanding
                                : Math.max(0, totalAmt - paidAmt);

                            subtitleRight = `Rp ${formatCurrencyValue(sisaSaldo)}`;
                        } else if (isDoc) {
                            subtitleLeft = dateStr;
                            subtitleRight = resolveDocumentTypeLabel(record, resource);
                        } else if (['suppliers', 'vendors', 'customers', 'employees'].includes(resource)) {
                            const hp = String(record.mobile_phone ?? record.mobilePhone ?? '').trim();
                            const telp = String(record.business_phone ?? record.office_phone ?? record.phone ?? '').trim();
                            const contactParts = [];
                            if (code) contactParts.push(code);
                            if (hp) contactParts.push(`HP:${hp}`);
                            if (telp && telp !== hp) contactParts.push(`Telp:${telp}`);
                            subtitleLeft = contactParts.join(' - ');
                        } else if (resource === 'accounts') {
                            subtitleLeft = code;
                            subtitleRight = translateAccountType(record.account_type);
                        }

                        return (
                            <button
                                key={record.id}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectAccount(record, label);
                                }}
                                className={`flex w-full flex-col gap-1.5 border-t border-slate-200 px-4 py-2.5 text-left transition first:border-t-0 hover:bg-ui-bg-hover odd:bg-white even:bg-[#F8F8F8] ${selected ? '!bg-brand-blue-lightest' : ''}`.trim()}
                            >
                                <span className="flex w-full items-center justify-between gap-4">
                                    <span className="truncate text-xs sm:text-sm font-normal text-black">
                                        <HighlightText text={title} search={query} />
                                    </span>
                                </span>
                                {(subtitleLeft || subtitleRight) ? (
                                    <span className="flex w-full items-center justify-between gap-4 text-xs sm:text-[13px]">
                                        <span className="truncate text-black">
                                            <HighlightText text={subtitleLeft} search={query} />
                                        </span>
                                        {subtitleRight ? (
                                            <span className="shrink-0 text-black italic">
                                                {subtitleRight}
                                            </span>
                                        ) : null}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })
                ) : (
                    <LookupEmptyState
                        title={emptyMessage}
                    />
                )}
            </div>
        </LookupDropdownSurface>
    );
}
