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
                    <div className="px-4 py-5 text-center text-sm text-red-b43b3b">{error}</div>
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
                                className={`flex w-full items-start justify-between gap-3 border-t border-border-ui-border-lightest px-4 py-3 text-left transition first:border-t-0 hover:bg-workspace-hover-bg ${selected ? 'bg-brand-blue-lightest' : 'bg-white'}`.trim()}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-brand-dark">{record.name ?? '-'}</span>
                                    <span className="mt-1 block truncate text-xs text-text-workspace-muted">{record.code ?? '-'}</span>
                                    {meta ? (
                                        <span className="mt-0.5 block truncate text-xs text-text-light">
                                            {meta}
                                        </span>
                                    ) : null}
                                </span>
                                <span className="shrink-0 rounded-full bg-workspace-hover-bg px-2.5 py-1 text-xs font-medium text-text-badge-blue-dark">
                                    {translateAccountType(record.account_type) || '-'}
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
