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
        serverTableProps,
    } = useBackendIndexResource({ resource: 'transaction-approval-rules', initialPerPage: 25 });

    const resolvedTable = useMemo(() => ({
        ...page.table,
        rows: rows.map(mapApprovalRuleRow),
        pageValue: total.toLocaleString('id-ID'),
        loading,
        refreshLabel: page.table?.refreshLabel || 'Muat ulang',
        onRefresh: reload,
        ...serverTableProps,
    }), [loading, page.table, rows, total, reload, serverTableProps]);

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
