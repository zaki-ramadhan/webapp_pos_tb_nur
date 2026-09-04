import { useEffect, useMemo, useState } from 'react';

import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
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
    const [fetchedDetailRowMap, setFetchedDetailRowMap] = useState({});

    const resolvedRows = useMemo(() => {
        const mergedMap = {};

        mappedBackendRows.forEach((row) => {
            mergedMap[row.id] = row;
        });
        Object.values(optimisticRows).forEach((row) => {
            mergedMap[row.id] = row;
        });
        Object.values(fetchedDetailRowMap).forEach((row) => {
            mergedMap[row.id] = row;
        });

        return Object.values(mergedMap);
    }, [mappedBackendRows, optimisticRows, fetchedDetailRowMap]);

    const rowMap = useMemo(
        () =>
            resolvedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        [resolvedRows],
    );

    useEffect(() => {
        const detailTabs = level2Tabs.filter((tab) => tab.kind === 'content' && tab.tabType === 'detail' && tab.recordId);
        detailTabs.forEach((tab) => {
            const id = String(tab.recordId);
            if (!fetchedDetailRowMap[id] && !rowMap[id]) {
                getBackendResource('salary-allowances', id)
                    .then((res) => {
                        const record = res?.data ?? res;
                        if (record) {
                            setFetchedDetailRowMap((prev) => ({
                                ...prev,
                                [id]: buildSalaryAllowanceRow(record),
                            }));
                        }
                    })
                    .catch(() => {});
            }
        });
    }, [level2Tabs, fetchedDetailRowMap, rowMap]);

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
            {level2Tabs.map((tab) => {
                if (tab.kind !== 'content') return null;

                const isCurrentForm = mode === 'form' && activeLevel2Tab?.id === tab.id;
                const isTabCreate = tab.id === `${page.id}-create`;
                const tabRecordId = isTabCreate ? null : (tab.recordId ?? tab.id);
                const tabEntry = isTabCreate
                    ? buildSalaryAllowanceEntry(null, config.newEntry)
                    : buildSalaryAllowanceEntry(rowMap[tabRecordId] ?? null, config.newEntry);

                return (
                    <div
                        key={tab.id}
                        className={isCurrentForm ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}
                    >
                        <SalaryAllowanceFormView
                            key={tab.id}
                            pageId={page.id}
                            activeLevel2Tab={tab}
                            config={resolvedConfig}
                            entry={tabEntry}
                            actions={isTabCreate ? config.formActions : config.editActions}
                            onOpenDetail={onOpenDetail}
                            onCloseDetail={onCloseDetail}
                            onPersist={handlePersist}
                            onDelete={handleDelete}
                            onRefresh={reload}
                        />
                    </div>
                );
            })}
        </div>
    );
}
