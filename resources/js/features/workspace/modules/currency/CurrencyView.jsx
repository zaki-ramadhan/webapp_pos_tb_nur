import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import CurrencyFormView from './CurrencyFormView';
import CurrencyTableView from './CurrencyTableView';
import { mapCurrencyRow } from './currencyShared';

export default function CurrencyView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows: backendRows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'currencies',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });
    const mappedRows = useMemo(() => backendRows.map((row) => mapCurrencyRow(row)), [backendRows]);

    return mode === 'table' ? (
        <CurrencyTableView
            page={page}
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
            page={page}
            activeLevel2Tab={activeLevel2Tab}
            tableRows={mappedRows}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
