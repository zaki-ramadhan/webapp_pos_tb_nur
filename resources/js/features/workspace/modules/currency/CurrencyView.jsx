import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import CurrencyFormView from './CurrencyFormView';
import CurrencyTableView from './CurrencyTableView';
import { mapCurrencyRow } from './currencyShared';

export default function CurrencyView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
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
        resource: 'currencies',
        initialPerPage: 25,
        enabled: true,
    });
    const mappedRows = useMemo(() => backendRows.map((row) => mapCurrencyRow(row)), [backendRows]);

    const resolvedPage = useMemo(() => ({
        ...page,
        currency: {
            ...page.currency,
            table: {
                ...page.currency?.table,
                rows: mappedRows,
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
        },
    }), [page, mappedRows, currentPage, perPage, total, lastPage, from, to, setPage, setPerPage]);

    return mode === 'table' ? (
        <CurrencyTableView
            page={resolvedPage}
            rows={mappedRows}
            total={total}
            loading={loading}
            error={error}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <CurrencyFormView
            page={resolvedPage}
            activeLevel2Tab={activeLevel2Tab}
            tableRows={mappedRows}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
