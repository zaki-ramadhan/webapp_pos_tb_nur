import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildAccountsConfig } from './accountsConfig';
import AccountsFormView from './AccountsFormView';
import AccountsTableView from './AccountsTableView';
import { mapAccountRow } from './accountsShared';

export default function AccountsView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const {
        rows: backendRows,
        loading,
        error,
        reload,
        total,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to
    } = useBackendIndexResource({
        resource: 'accounts',
        initialPerPage: 25,
    });
    const config = useMemo(() => {
        const baseConfig = buildAccountsConfig(page.accounts);

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: backendRows.map(mapAccountRow),
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
        };
    }, [backendRows, page.accounts, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    return mode === 'table' ? (
        <AccountsTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onReload={reload}
        />
    ) : (
        <AccountsFormView
            config={config}
            backendRows={backendRows}
            activeLevel2Tab={activeLevel2Tab}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onReload={reload}
        />
    );
}
