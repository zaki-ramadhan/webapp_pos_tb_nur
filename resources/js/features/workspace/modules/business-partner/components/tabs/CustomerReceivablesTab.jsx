import { useEffect, useState } from 'react';
import { listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { buildFirstDayOfMonthDisplayDate, buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import PartnerLedgerTable from '@/features/workspace/modules/shared/PartnerLedgerTable';

export function CustomerReceivablesTab({ recordId }) {
    const [startDate, setStartDate] = useState(() => buildFirstDayOfMonthDisplayDate());
    const [endDate, setEndDate] = useState(() => buildTodayDisplayDate());
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = async () => {
        if (!recordId) {
            setRows([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const minDelay = new Promise((resolve) => setTimeout(resolve, 300));
        try {
            const [res] = await Promise.all([
                listBackendResource('customer-receivables', {
                    customer_id: recordId,
                    start_date: startDate,
                    end_date: endDate,
                    per_page: 200,
                }),
                minDelay,
            ]);
            setRows(Array.isArray(res?.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to load customer receivables history', error);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();

        const handleAutoRefresh = () => {
            loadHistory();
        };

        window.addEventListener('workspace:resource-updated', handleAutoRefresh);
        window.addEventListener('workspace:page-activated', handleAutoRefresh);

        return () => {
            window.removeEventListener('workspace:resource-updated', handleAutoRefresh);
            window.removeEventListener('workspace:page-activated', handleAutoRefresh);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordId, startDate, endDate]);

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-[160px]">
                    <TransactionDateInput
                        value={startDate}
                        onChange={(val) => setStartDate(val)}
                        className="w-full"
                    />
                </div>
                <span className="text-xs text-slate-500 font-normal">s/d</span>
                <div className="w-[160px]">
                    <TransactionDateInput
                        value={endDate}
                        onChange={(val) => setEndDate(val)}
                        className="w-full"
                    />
                </div>
                <RefreshButton
                    onClick={loadHistory}
                    loading={loading}
                    label="Muat Ulang"
                />
            </div>

            <PartnerLedgerTable
                rows={rows}
                loading={loading}
                emptyLabel="Tidak ada data."
            />
        </div>
    );
}

export default CustomerReceivablesTab;
