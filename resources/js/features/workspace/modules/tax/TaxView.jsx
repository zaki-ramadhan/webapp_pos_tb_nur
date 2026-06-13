import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import TaxFormView from './TaxFormView';
import TaxTableView from './TaxTableView';
import { mapTaxRow } from './taxShared';

export default function TaxView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const {
        rows: backendRows,
        total,
        loading,
        error,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to
    } = useBackendIndexResource({
        resource: 'taxes',
        initialPerPage: 25,
        enabled: true,
    });
    const mappedRows = useMemo(() => backendRows.map((row) => mapTaxRow(row)), [backendRows]);
    const resolvedPage = useMemo(() => ({
        ...page,
        table: {
            ...page.table,
            rows: mappedRows,
            pageValue: total.toLocaleString('id-ID'),
            pagination: {
                page: currentPage,
                perPage,
                total,
                lastPage,
                from,
                to,
                onPageChange: setPage,
                onPerPageChange: setPerPage,
            },
        },
        form: {
            ...page.form,
            records: mappedRows.map((row) => ({
                id: row.id,
                type: row.typeValue,
                description: row.description,
                percentage: row.percentage,
                salesAccount: row.salesAccount,
                salesAccountId: row.output_account_id ?? row.output_account?.id ?? null,
                purchaseAccount: row.purchaseAccount,
                purchaseAccountId: row.input_account_id ?? row.input_account?.id ?? null,
                __backendRecordId: row.id,
            })),
        },
        onRefresh: reload,
        onOpenDetail,
        onOpenContent,
        onCloseDetail,
    }), [mappedRows, onCloseDetail, onOpenContent, onOpenDetail, page, reload, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    return mode === 'table' ? (
        <TaxTableView
            page={resolvedPage}
            rows={mappedRows}
            loading={loading}
            error={error}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <TaxFormView page={resolvedPage} activeLevel2Tab={activeLevel2Tab} />
    );
}
