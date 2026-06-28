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
    emptyLabel = 'Belum ada data akun perkiraan.',
    loadingLabel = 'Memuat akun perkiraan...',
    className = '',
    anchorRef = null,
    showType = false,
    resource = 'accounts',
}) {
    const selectedLabelSet = useMemo(() => new Set(selectedLabels), [selectedLabels]);
    const emptyMessage = query.trim()
        ? 'Tidak ada akun perkiraan yang cocok.'
        : emptyLabel;

    if (!open) {
        return null;
    }

    return (
        <LookupDropdownSurface className={className} anchorRef={anchorRef}>
            <div className="max-h-[280px] overflow-y-auto bg-white flex-1 min-h-0">
                {loading ? (
                    <div className="px-4 py-5 text-center text-sm text-text-workspace-muted">{loadingLabel}</div>
                ) : error ? (
                    <div className="px-4 py-5 text-center text-sm text-red-850">{error}</div>
                ) : rows.length ? (
                    rows.map((record) => {
                        const label = buildAccountLookupLabel(record);
                        const selected = selectedLabelSet.has(label);
                        const meta = buildAccountLookupMeta(record);

                        return (
                            <button
                                key={record.id}
                                type="button"
                                onClick={() => onSelectAccount(record, label)}
                                className={`flex w-full items-start gap-3 border-t border-border-ui-border-lightest px-4 py-2.5 text-left transition first:border-t-0 hover:bg-ui-bg-hover ${selected ? 'bg-brand-blue-lightest' : 'bg-white'}`.trim()}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-normal text-brand-dark">{record.name ?? '-'}</span>
                                    <span className="mt-1 flex items-center justify-between gap-4 text-xs sm:text-[13px]">
                                        <span className="truncate text-brand-dark">
                                            {record.code ?? '-'}
                                        </span>
                                        <span className="shrink-0 text-text-workspace-muted italic">
                                            {showType
                                                ? translateAccountType(record.account_type)
                                                : resource === 'accounts'
                                                    ? `Rp ${Number(record.opening_balance ?? 0).toLocaleString('id-ID')}`
                                                    : null}
                                        </span>
                                    </span>
                                </span>
                            </button>
                        );
                    })
                ) : (
                    <LookupEmptyState
                        title={emptyMessage}
                        description={!query.trim()
                            ? 'Mulai ketik kode atau nama akun untuk melihat saran.'
                            : 'Coba kata kunci lain yang lebih spesifik.'}
                    />
                )}
            </div>
        </LookupDropdownSurface>
    );
}
