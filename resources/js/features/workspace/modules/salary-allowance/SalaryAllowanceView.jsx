import { useEffect, useMemo, useState } from 'react';

import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import SalaryAllowanceFormView from './SalaryAllowanceFormView';
import SalaryAllowanceTableView from './SalaryAllowanceTableView';
import { buildSalaryAllowanceEntry, buildSalaryAllowanceRow } from './salaryAllowanceShared';

export default function SalaryAllowanceView({
    page,
    mode,
    activeLevel2Tab,
    level2Tabs = [],
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const config = page.salaryAllowance;
    const {
        loading,
        error,
        reload,
        mappedRows: mappedBackendRows,
        tableProps,
    } = useWorkspaceResource({
        resource: 'salary-allowances',
        initialPerPage: 25,
        mapRow: (row) => {
            const mapped = buildSalaryAllowanceRow(row);
            return {
                ...mapped,
                inactiveValue: mapped.inactive ? 'yes' : 'no',
            };
        },
    });

    const [optimisticRows, setOptimisticRows] = useState({});
    const resolvedRows = useMemo(() => {
        const mergedMap = {};

        mappedBackendRows.forEach((row) => {
            mergedMap[row.id] = row;
        });
        Object.values(optimisticRows).forEach((row) => {
            mergedMap[row.id] = row;
        });

        return Object.values(mergedMap);
    }, [mappedBackendRows, optimisticRows]);

    const rowMap = useMemo(
        () =>
            resolvedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        [resolvedRows],
    );

    const resolvedConfig = useMemo(
        () => ({
            ...config,
            rows: resolvedRows,
            table: {
                ...config.table,
                ...tableProps,
                rows: resolvedRows,
                pageValue: tableProps.total.toLocaleString('id-ID'),
                emptyLabel: loading ? 'Memuat data...' : (error || 'Tidak ada data'),
            },
        }),
        [config, error, tableProps, resolvedRows],
    );

    const [lastActiveFormTab, setLastActiveFormTab] = useState(null);

    useEffect(() => {
        if (activeLevel2Tab && activeLevel2Tab.kind === 'content') {
            setLastActiveFormTab(activeLevel2Tab);
        } else if (!activeLevel2Tab) {
            setLastActiveFormTab(null);
        }
    }, [activeLevel2Tab]);

    const isCreateTab = lastActiveFormTab?.id === `${page.id}-create`;
    const recordId = lastActiveFormTab ? (lastActiveFormTab.recordId ?? lastActiveFormTab.id) : null;
    const activeEntry = useMemo(() => {
        if (!lastActiveFormTab || isCreateTab) {
            return buildSalaryAllowanceEntry(null, config.newEntry);
        }
        return buildSalaryAllowanceEntry(rowMap[recordId] ?? null, config.newEntry);
    }, [lastActiveFormTab, isCreateTab, recordId, rowMap, config.newEntry]);

    function handlePersist(record) {
        const nextRow = buildSalaryAllowanceRow(record);
        setOptimisticRows((current) => ({
            ...current,
            [nextRow.id]: nextRow,
        }));
        reload();
    }

    function handleDelete(id) {
        setOptimisticRows((current) => {
            const nextState = { ...current };
            delete nextState[String(id)];
            return nextState;
        });
        onCloseDetail?.(id);
        reload();
    }

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <SalaryAllowanceTableView
                    config={resolvedConfig}
                    rows={resolvedRows}
                    onCreate={onOpenContent}
                    onOpenDetail={onOpenDetail}
                    loading={loading}
                    error={error}
                    onRefresh={reload}
                />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <SalaryAllowanceFormView
                        key={lastActiveFormTab.id}
                        pageId={page.id}
                        activeLevel2Tab={lastActiveFormTab}
                        config={resolvedConfig}
                        entry={activeEntry}
                        actions={isCreateTab ? config.formActions : config.editActions}
                        onPersist={handlePersist}
                        onDelete={handleDelete}
                        onRefresh={reload}
                    />
                </div>
            )}
        </div>
    );
}
