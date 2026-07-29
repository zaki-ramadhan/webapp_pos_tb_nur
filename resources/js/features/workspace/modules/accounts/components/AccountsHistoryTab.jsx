import { useEffect, useState, useMemo } from 'react';
import { listBackendResource, getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { buildFirstDayOfMonthDisplayDate, buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import BankLedgerTable from '@/features/workspace/modules/shared/BankLedgerTable';

export function AccountsHistoryTab({ recordId, openingBalanceValue = 0 }) {
    const [startDate, setStartDate] = useState(() => buildFirstDayOfMonthDisplayDate());
    const [endDate, setEndDate] = useState(() => buildTodayDisplayDate());
    const [rows, setRows] = useState([]);
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const initialOpeningBalance = useMemo(() => {
        if (accountInfo && accountInfo.opening_balance !== undefined && accountInfo.opening_balance !== null) {
            return Number(accountInfo.opening_balance ?? 0);
        }
        return Number(openingBalanceValue ?? 0);
    }, [accountInfo, openingBalanceValue]);

    const loadHistory = async () => {
        if (!recordId) return;
        setLoading(true);
        try {
            const [historyRes, accountRes] = await Promise.all([
                listBackendResource('bank-histories', {
                    account_id: recordId,
                    start_date: startDate,
                    end_date: endDate,
                    per_page: 200,
                }),
                getBackendResource('accounts', recordId).catch(() => null),
            ]);

            setRows(Array.isArray(historyRes?.data) ? historyRes.data : []);
            if (accountRes) {
                setAccountInfo(accountRes);
            }
        } catch (error) {
            console.error('Failed to load account history', error);
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
                    label="Perbarui"
                />
            </div>

            <BankLedgerTable
                rows={rows}
                loading={loading}
                startDate={startDate}
                initialOpeningBalance={initialOpeningBalance}
            />
        </div>
    );
}

export default AccountsHistoryTab;
