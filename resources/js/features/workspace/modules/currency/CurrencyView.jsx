import { useMemo } from 'react';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import CurrencyFormView from './CurrencyFormView';
import CurrencyTableView from './CurrencyTableView';
import { mapCurrencyRow } from './currencyShared';

export default function CurrencyView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const {
        loading,
        error,
        reload,
        mappedRows,
        tableProps,
    } = useWorkspaceResource({
        resource: 'currencies',
        initialPerPage: 25,
        mapRow: (row) => mapCurrencyRow(row),
    });

    const resolvedPage = useMemo(() => ({
        ...page,
        currency: {
            ...page.currency,
            table: {
                ...page.currency?.table,
                ...tableProps,
                rows: mappedRows,
            },
        },
    }), [page, mappedRows, tableProps]);

    return mode === 'table' ? (
        <CurrencyTableView
            page={resolvedPage}
            rows={mappedRows}
            loading={loading}
            error={error}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <CurrencyFormView
            key={activeLevel2Tab?.id ?? 'new'}
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
