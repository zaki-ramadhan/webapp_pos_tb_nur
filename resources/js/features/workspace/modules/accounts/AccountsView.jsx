import { useMemo } from 'react';

import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import { buildAccountsConfig } from './accountsConfig';
import AccountsFormView from './AccountsFormView';
import AccountsTableView from './AccountsTableView';
import { mapAccountRow } from './accountsShared';

export default function AccountsView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const {
        mappedRows,
        rows: backendRows,
        tableProps,
        reload,
        loading,
        error,
    } = useWorkspaceResource({
        resource: 'accounts',
        initialPerPage: 25,
        mapRow: mapAccountRow,
    });

    const config = useMemo(() => {
        const baseConfig = buildAccountsConfig(page.accounts);

        const statusOptions = [
            { value: 'all', label: 'Non Aktif: Semua' },
            { value: 'active', label: 'Status: Aktif' },
            { value: 'inactive', label: 'Status: Non Aktif' },
        ];

        const uniqueTypes = [...new Set(mappedRows.map((r) => r.type).filter(Boolean))];
        const typeOptions = [
            { value: 'all', label: 'Tipe Akun: Semua' },
            ...uniqueTypes.map((t) => ({ value: t, label: `Tipe Akun: ${t}` })),
        ];

        const updatedFilters = (baseConfig.table.filters ?? []).map((filter) => {
            if (filter.id === 'inactive') {
                return { ...filter, options: statusOptions };
            }
            if (filter.id === 'type') {
                return { ...filter, options: typeOptions };
            }
            return filter;
        });

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                ...tableProps,
                rows: mappedRows,
                filters: updatedFilters,
                pageValue: tableProps.total.toLocaleString('id-ID'),
            },
        };
    }, [mappedRows, page.accounts, tableProps]);

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

