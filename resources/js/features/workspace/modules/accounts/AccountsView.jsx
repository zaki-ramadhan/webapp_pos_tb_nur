import { useEffect, useMemo, useState } from 'react';

import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import { buildAccountsConfig } from './accountsConfig';
import AccountsFormView from './AccountsFormView';
import AccountsTableView from './AccountsTableView';
import { mapAccountRow } from './accountsShared';

export default function AccountsView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail, onCloseTab }) {
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

        const [lastActiveFormTab, setLastActiveFormTab] = useState(null);

    useEffect(() => {
        if (activeLevel2Tab && activeLevel2Tab.kind === 'content') {
            setLastActiveFormTab(activeLevel2Tab);
        } else if (!activeLevel2Tab) {
            setLastActiveFormTab(null);
        }
    }, [activeLevel2Tab]);

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <AccountsTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onReload={reload}
        />
            </div>
            {level2Tabs.map((tab) => {
                if (tab.kind !== 'content') return null;

                const isCurrentForm = mode === 'form' && activeLevel2Tab?.id === tab.id;

                return (
                    <div
                        key={tab.id}
                        className={isCurrentForm ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}
                    >
                        <AccountsFormView
                            key={tab.id}
            pageId={page.id}
            config={config}
            backendRows={backendRows}
            activeLevel2Tab={tab}
            onOpenDetail={onOpenDetail}
            onCloseTab={onCloseTab}
            onReload={reload}
                        />
                    </div>
                );
            })}
        </div>
    );
}

