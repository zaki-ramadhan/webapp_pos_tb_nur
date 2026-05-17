import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import BankTransferFormView from './BankTransferFormView';
import BankTransferTableView from './BankTransferTableView';
import { buildBankTransferFilters, buildBankTransferRow } from './bankTransferShared';

export default function BankTransferView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'bank-transfers',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });
    const config = useMemo(() => {
        const mappedRows = rows.map((record) => buildBankTransferRow(record));

        return {
            ...page.bankTransfer,
            rowMap: mappedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                ...page.bankTransfer.table,
                rows: mappedRows,
                filters: buildBankTransferFilters(page.bankTransfer.table?.filters ?? [], mappedRows),
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : page.bankTransfer.table?.refreshLabel,
                emptyLabel: error || page.bankTransfer.table?.emptyLabel || 'Belum ada data',
                onRefresh: reload,
            },
        };
    }, [error, loading, page.bankTransfer, reload, rows, total]);

    return mode === 'table' ? (
        <BankTransferTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <BankTransferFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
