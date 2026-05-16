import TableListView from '@/features/workspace/modules/TableListView';
import { TransactionToolbarIconButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { PrintIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

export default function StockOpnameResultTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onCreate,
            }}
            rightControls={
                <TransactionToolbarIconButton label="Cetak daftar">
                    <PrintIcon className="h-4 w-4" />
                </TransactionToolbarIconButton>
            }
            menuButton={{
                label: config.table.settingsLabel,
                icon: <TableActionIcon className="h-4.5 w-4.5" />,
                items: [{ id: 'arrange-columns', label: config.table.settingsLabel }],
                widthClassName: 'w-[180px]',
            }}
            onRowClick={(row) =>
                onOpenDetail?.({
                    recordId: row.id,
                    label: row.number,
                    tabLabel: row.number,
                })
            }
        />
    );
}
