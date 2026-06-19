import { useState } from 'react';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';
import { RefreshIcon } from '@/features/workspace/shared/Icons';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';

function SyncRateButton({ onRefresh, loading }) {
    const [syncing, setSyncing] = useState(false);

    async function handleSync() {
        if (syncing || loading) return;

        setSyncing(true);
        try {
            const response = await window.axios.post('/api/backend/currencies/sync');
            const message = response?.data?.message || 'Berhasil mensinkronisasi kurs mata uang.';
            showSuccessToast({ message });
            await onRefresh?.();
        } catch (syncError) {
            const errorMsg = syncError?.response?.data?.message || 'Gagal mensinkronisasi kurs mata uang.';
            showErrorToast({ message: errorMsg });
        } finally {
            setSyncing(false);
        }
    }

    const busy = syncing || loading;

    return (
        <button
            type="button"
            onClick={handleSync}
            disabled={busy}
            aria-label={busy ? 'Sinkronisasi Kurs...' : 'Sinkronisasi Kurs API'}
            title={busy ? 'Sinkronisasi Kurs...' : 'Sinkronisasi Kurs API'}
            className={`inline-flex h-[34px] shrink-0 items-center justify-center gap-1.5 rounded-[4px] border border-[#7aa2d5] bg-white px-3 text-sm text-[#2353a0] transition hover:bg-[#e8f2ff] ${busy ? 'pointer-events-none opacity-70' : ''}`.trim()}
        >
            <RefreshIcon className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`.trim()} />
            <span className="hidden sm:inline">{busy ? 'Sinkronisasi...' : 'Sinkronisasi Kurs'}</span>
        </button>
    );
}

export default function CurrencyTableView({ page, rows, total, loading, error, onCreate, onOpenDetail, onRefresh }) {
    const table = page.currency.table;

    const resolvedTable = {
        ...table,
        rows,
        emptyLabel: error || (rows.length === 0 ? 'Belum ada data' : undefined),
        onRefresh,
        loading,
    };

    return (
        <ModuleTableTemplate
            table={resolvedTable}
            resourceName="currencies"
            exportFilename="mata-uang"
            exportTitle="Laporan Kurs Mata Uang"
            onCreate={onCreate}
            onOpenDetail={(item) =>
                onOpenDetail?.({
                    recordId: item.recordId,
                    label: item.label,
                    tabLabel: item.tabLabel ?? item.label,
                })
            }
            extraToolbarSlot={<SyncRateButton onRefresh={onRefresh} loading={loading} />}
        />
    );
}
