import { useMemo } from 'react';
import { LoadingIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { LookupDropdownSurface, LookupEmptyState } from '@/features/workspace/shared/LookupPrimitives';
import { buildAccountLookupLabel, buildAccountLookupMeta, translateAccountType } from '@/features/workspace/shared/hooks/useAccountLookupController';

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
        products: 'barang & jasa',
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
    const resolvedEmptyLabel = emptyLabel ?? `Belum ada data ${entityName}.`;
    const resolvedLoadingLabel = loadingLabel ?? `Memuat ${entityName}...`;

    const selectedLabelSet = useMemo(() => new Set(selectedLabels), [selectedLabels]);
    const emptyMessage = query.trim()
        ? `Tidak ada ${entityName} yang cocok.`
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
                        
                        const rawDate = record.entry_date || record.document_date || record.date;
                        let dateStr = '';
                        if (rawDate) {
                            dateStr = String(rawDate).split('T')[0];
                        }
                        
                        const counterpart = resource === 'sales-deposits' ? '' : (record.customer?.name || record.supplier?.name || '');
                        
                        const subtitleLeft = isDoc
                            ? [dateStr, counterpart].filter(Boolean).join(' • ')
                            : (record.code ?? record.employee_code ?? '-');

                        const subtitleRight = isDoc
                            ? `Rp ${Number(record.outstanding_amount ?? record.total_amount ?? 0).toLocaleString('id-ID')}`
                            : (resource === 'accounts'
                                ? translateAccountType(record.account_type)
                                : null);

                        return (
                            <button
                                key={record.id}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectAccount(record, label);
                                }}
                                className={`flex w-full items-start gap-3 border-t border-slate-200 px-4 py-3 text-left transition first:border-t-0 hover:bg-ui-bg-hover odd:bg-white even:bg-[#fafbfc] ${selected ? '!bg-brand-blue-lightest' : ''}`.trim()}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-normal text-black">{title}</span>
                                    {resource !== 'units' ? (
                                        <span className="mt-1 flex items-center justify-between gap-4 text-xs sm:text-[13px]">
                                            <span className="truncate text-black">
                                                {subtitleLeft}
                                            </span>
                                            <span className="shrink-0 text-black italic">
                                                {subtitleRight}
                                            </span>
                                        </span>
                                    ) : null}
                                </span>
                            </button>
                        );
                    })
                ) : (
                    <LookupEmptyState
                        title={emptyMessage}
                        description={!query.trim()
                            ? `Mulai ketik untuk mencari ${entityName}.`
                            : 'Coba kata kunci lain yang lebih spesifik.'}
                    />
                )}
            </div>
        </LookupDropdownSurface>
    );
}
