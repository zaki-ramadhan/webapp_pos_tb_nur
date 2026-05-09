import TableListView from '@/features/workspace/modules/TableListView';
import { TransactionToolbarSplitButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    CogIcon,
    DownloadIcon,
    ExternalLinkIcon,
    PlusIcon,
    PrintIcon,
} from '@/features/workspace/shared/Icons';

export default function ItemsServicesTableView({ config, onOpenContent, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onOpenContent,
                icon: <PlusIcon className="h-6 w-6" />,
            }}
            rightControls={
                <>
                    <TransactionToolbarSplitButton
                        label="Unduh"
                        icon={<DownloadIcon className="h-4.5 w-4.5" />}
                        items={config.table.downloadItems}
                    />
                    <TransactionToolbarSplitButton
                        label="Ekspor"
                        icon={<ExternalLinkIcon className="h-4.5 w-4.5" />}
                        items={config.table.shareItems}
                    />
                    <TransactionToolbarSplitButton
                        label="Cetak"
                        icon={<PrintIcon className="h-4.5 w-4.5" />}
                        items={config.table.printItems}
                    />
                    <TransactionToolbarSplitButton
                        label="Pengaturan"
                        icon={<CogIcon className="h-4.5 w-4.5" />}
                        items={config.table.settingsItems}
                    />
                </>
            }
            onRowClick={(row) =>
                onOpenDetail?.({
                    recordId: row.id,
                    label: row.name,
                    tabLabel: row.tabLabel ?? row.name,
                })
            }
        />
    );
}
