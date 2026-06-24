import { useMemo, useState } from 'react';

import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import PanelActions from '@/features/workspace/shared/PanelActions';
import SecondaryTabs from '@/features/workspace/shared/SecondaryTabs';
import SalaryAllowanceFormView from './SalaryAllowanceFormView';
import SalaryAllowanceTableView from './SalaryAllowanceTableView';
import { buildSalaryAllowanceEntry, buildSalaryAllowanceRow } from './salaryAllowanceShared';

export default function SalaryAllowanceView({ page, activeLevel2Tab }) {
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

    const [isNewTabOpen, setIsNewTabOpen] = useState(true);
    const [activeInnerTabId, setActiveInnerTabId] = useState('new');
    const [openDetailTabIds, setOpenDetailTabIds] = useState([]);
    const [filters, setFilters] = useState(() =>
        config.table.filterOptions.reduce((result, filter) => {
            result[filter.id] = filter.defaultValue;
            return result;
        }, {}),
    );

    const rowMap = useMemo(
        () =>
            resolvedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        [resolvedRows],
    );

    const detailTabs = openDetailTabIds.map((id) => rowMap[id]).filter(Boolean);
    const innerTabs = [
        { id: 'view', kind: 'view', closable: false, label: 'View' },
        ...(isNewTabOpen ? [{ id: 'new', kind: 'content', closable: true, label: config.newTabLabel }] : []),
        ...detailTabs.map((row) => ({
            id: row.id,
            kind: 'content',
            closable: true,
            label: row.name,
        })),
    ];

    function handleOpenNewTab() {
        setIsNewTabOpen(true);
        setActiveInnerTabId('new');
    }

    function handleOpenDetail(item) {
        const tabId = typeof item === 'object' && item !== null ? item.recordId : item;
        setOpenDetailTabIds((current) => (current.includes(tabId) ? current : [...current, tabId]));
        setActiveInnerTabId(tabId);
    }

    function handleCloseInnerTab(tabId) {
        if (tabId === 'new') {
            setIsNewTabOpen(false);
            setActiveInnerTabId('view');
            return;
        }

        setOpenDetailTabIds((current) => current.filter((id) => id !== tabId));

        if (activeInnerTabId === tabId) {
            setActiveInnerTabId(isNewTabOpen ? 'new' : 'view');
        }
    }

    const activeEntry = activeInnerTabId === 'new'
        ? buildSalaryAllowanceEntry(null, config.newEntry)
        : buildSalaryAllowanceEntry(rowMap[activeInnerTabId] ?? null, config.newEntry);
    const isViewMode = activeInnerTabId === 'view';
    const resolvedConfig = useMemo(
        () => ({
            ...config,
            rows: resolvedRows,
            table: {
                ...config.table,
                ...tableProps,
                rows: resolvedRows,
                pageValue: tableProps.total.toLocaleString('id-ID'),
                emptyLabel: error || 'Belum ada data',
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
        setOpenDetailTabIds((current) => (current.includes(nextRow.id) ? current : [...current, nextRow.id]));
        setIsNewTabOpen(false);
        setActiveInnerTabId(nextRow.id);
    }

    function handleDelete(recordId) {
        setOptimisticRows((current) => {
            const nextState = { ...current };
            delete nextState[String(recordId)];

            return nextState;
        });
        setOpenDetailTabIds((current) => current.filter((id) => id !== String(recordId)));
        setActiveInnerTabId('view');
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-tab-inactive-bg bg-transparent pl-0 pr-2 pt-0 sm:pl-0 sm:pr-2.5">
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                    <SecondaryTabs
                        tabs={innerTabs}
                        activeTabId={activeInnerTabId}
                        onSelectTab={setActiveInnerTabId}
                        onCloseTab={handleCloseInnerTab}
                        className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    />

                    <PanelActions actions={config.tipActions} className="pb-1" />
                </div>
            </div>

            <div className="flex-1 min-h-0 pt-0">
                {isViewMode ? (
                    <SalaryAllowanceTableView
                        config={resolvedConfig}
                        rows={resolvedRows}
                        filters={filters}
                        setFilters={setFilters}
                        onCreate={handleOpenNewTab}
                        onOpenDetail={handleOpenDetail}
                        loading={loading}
                        error={error}
                        onRefresh={reload}
                    />
                ) : (
                    <SalaryAllowanceFormView
                        key={activeInnerTabId}
                        pageId={page.id}
                        activeLevel2Tab={activeLevel2Tab}
                        config={resolvedConfig}
                        entry={activeEntry}
                        actions={activeInnerTabId === 'new' ? config.formActions : config.editActions}
                        onPersist={handlePersist}
                        onDelete={handleDelete}
                        onRefresh={reload}
                    />
                )}
            </div>
        </div>
    );
}
