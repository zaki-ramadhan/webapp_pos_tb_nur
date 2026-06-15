import { useMemo } from 'react';
import TextInput from '@/components/ui/TextInput';
import { RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { LookupDropdownSurface, LookupEmptyState } from '@/features/workspace/shared/LookupPrimitives';
import { buildAccountLookupLabel, buildAccountLookupMeta } from '@/features/workspace/shared/hooks/useAccountLookupController';

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
    showInlineSearch = false,
    onQueryChange = null,
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
            {showInlineSearch ? (
                <div className="border-b border-[#e6ebf2] p-3">
                    <TextInput
                        value={query}
                        onChange={(event) => onQueryChange?.(event.target.value)}
                        placeholder="Cari kode atau nama akun..."
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        trailing={
                            loading ? (
                                <RefreshIcon className="h-5 w-5 animate-spin text-[#1f2436]" />
                            ) : (
                                <SearchIcon className="h-5 w-5 text-[#1f2436]" />
                            )
                        }
                        className="h-[38px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        autoFocus
                    />
                </div>
            ) : null}

            <div className="max-h-[280px] overflow-y-auto bg-white flex-1 min-h-0">
                {loading ? (
                    <div className="px-4 py-5 text-center text-sm text-[#5f6779]">{loadingLabel}</div>
                ) : error ? (
                    <div className="px-4 py-5 text-center text-sm text-[#b43b3b]">{error}</div>
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
                                className={`flex w-full items-start justify-between gap-3 border-t border-[#e6ebf2] px-4 py-3 text-left transition first:border-t-0 hover:bg-[#eef3fb] ${selected ? 'bg-[#f5f9ff]' : 'bg-white'}`.trim()}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-[#1f2436]">{record.name ?? '-'}</span>
                                    <span className="mt-1 block truncate text-xs text-[#5f6779]">{record.code ?? '-'}</span>
                                    {meta ? (
                                        <span className="mt-0.5 block truncate text-xs text-[#8a94a8]">
                                            {meta}
                                        </span>
                                    ) : null}
                                </span>
                                <span className="shrink-0 rounded-full bg-[#eef3fb] px-2.5 py-1 text-xs font-medium text-[#355784]">
                                    {record.account_type ?? '-'}
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
