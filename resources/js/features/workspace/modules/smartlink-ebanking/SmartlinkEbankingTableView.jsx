import { useState, useMemo } from 'react';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function SmartlinkEbankingTableView({
    table,
    onCreate,
    onOpenDetail,
    onRefresh,
}) {
    const [serviceFilter, setServiceFilter] = useState('all');

    const filteredRows = useMemo(() => {
        const rows = table.rows || [];
        if (serviceFilter === 'all') return rows;
        return rows.filter((row) =>
            row.serviceType?.toLowerCase().includes(serviceFilter.toLowerCase())
        );
    }, [table.rows, serviceFilter]);

    const resolvedTable = useMemo(() => ({
        ...table,
        rows: filteredRows,
        onRefresh,
    }), [table, filteredRows, onRefresh]);

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            {/* Top filter dropdown: Jenis Internet Banking */}
            <div className="mb-2 shrink-0">
                <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="h-[30px] rounded-[4px] border border-ui-border bg-white px-2.5 text-xs text-slate-700 shadow-xs focus:border-brand-blue focus:outline-none cursor-pointer"
                >
                    <option value="all">Jenis Internet Banking: Semua</option>
                    <option value="brimo">BRI Mobile (BRIMO)</option>
                </select>
            </div>

            {/* Standard Accurate Module Table */}
            <div className="flex-1 min-h-0">
                <ModuleTableTemplate
                    table={resolvedTable}
                    resourceName="smartlink-bank"
                    exportFilename="daftar-akun-smartlink-ebanking"
                    exportTitle="Daftar Akun SmartLink e-Banking"
                    onCreate={onCreate}
                    onOpenDetail={onOpenDetail}
                    disableImport
                    disableExport
                    disablePrint
                />
            </div>
        </div>
    );
}
