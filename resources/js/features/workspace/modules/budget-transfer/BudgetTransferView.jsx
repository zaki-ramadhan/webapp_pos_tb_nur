import { useMemo } from 'react';
import BudgetTransferFormView from './BudgetTransferFormView';
import BudgetTransferTableView from './BudgetTransferTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildOperationDocumentTableRows } from '@/features/workspace/backend/operationDocumentBackend';

export default function BudgetTransferView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'budget-transfers',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });

    const config = useMemo(() => {
        const baseConfig = page.budgetTransfer;
        const mappedRows = buildOperationDocumentTableRows('budget-transfer', rows);

        const transferTableRows = mappedRows.map((row) => {
            const rawRecord = row.__backendRecord;
            let meta = {};
            try {
                if (typeof rawRecord.metadata === 'object' && rawRecord.metadata !== null) {
                    meta = rawRecord.metadata;
                } else if (typeof rawRecord.metadata === 'string' && (rawRecord.metadata.startsWith('{') || rawRecord.metadata.startsWith('['))) {
                    meta = JSON.parse(rawRecord.metadata);
                }
            } catch (e) {}
            return {
                id: row.id,
                __backendRecord: rawRecord,
                number: row.number,
                date: row.date,
                fromAccount: meta.fromBudget ?? '',
                toAccount: meta.toBudget ?? '',
                transferValue: 'Rp ' + Number(meta.transferAmount ?? 0).toLocaleString('id-ID'),
                dateFilterValue: 'all',
            };
        });

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: transferTableRows,
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat...' : baseConfig.table?.refreshLabel,
            },
        };
    }, [loading, page.budgetTransfer, rows, total]);

    return mode === 'table' ? (
        <BudgetTransferTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <BudgetTransferFormView
            pageId={page.id}
            activeLevel2Tab={activeLevel2Tab}
            config={config}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
