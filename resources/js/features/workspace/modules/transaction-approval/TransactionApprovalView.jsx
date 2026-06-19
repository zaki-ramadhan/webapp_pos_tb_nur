import { useMemo } from 'react';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapApprovalRuleRow } from '@/features/workspace/backend/workspaceBackendAdapters';
import TransactionApprovalFormView from './TransactionApprovalFormView';
import TransactionApprovalTableView from './TransactionApprovalTableView';

export default function TransactionApprovalView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const {
        rows,
        total,
        loading,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to,
    } = useBackendIndexResource({ resource: 'transaction-approval-rules', initialPerPage: 25 });

    const resolvedTable = useMemo(() => ({
        ...page.table,
        rows: rows.map(mapApprovalRuleRow),
        pageValue: total.toLocaleString('id-ID'),
        loading,
        refreshLabel: loading ? 'Memuat...' : page.table.refreshLabel,
        onRefresh: reload,
        pagination: { page: currentPage, perPage, total, lastPage, from, to, onPageChange: setPage, onPerPageChange: setPerPage },
    }), [loading, page.table, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage, reload]);

    return mode === 'table' ? (
        <TransactionApprovalTableView
            table={resolvedTable}
            onCreate={onOpenContent}
            onRefresh={reload}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <TransactionApprovalFormView
            pageId={page.id}
            form={page.form}
            activeLevel2Tab={activeLevel2Tab}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            backendRows={rows}
        />
    );
}
