import TableListView from '@/features/workspace/modules/TableListView';
import {
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    CogIcon,
    DownloadIcon,
    ExternalLinkIcon,
    PrintIcon,
} from '@/features/workspace/shared/Icons';

export default function FixedAssetsTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onCreate,
            }}
            rightControls={
                <>
                    <TransactionToolbarSplitButton
                        label="Unduh daftar"
                        icon={<DownloadIcon className="h-4 w-4" />}
                        items={[{ id: 'download-excel', label: 'Unduh Excel' }]}
                    />
                    <TransactionToolbarSplitButton
                        label="Bagikan daftar"
                        icon={<ExternalLinkIcon className="h-4 w-4" />}
                        items={[{ id: 'share-link', label: 'Salin tautan daftar' }]}
                    />
                    <TransactionToolbarIconButton label="Cetak daftar">
                        <PrintIcon className="h-4 w-4" />
                    </TransactionToolbarIconButton>
                    <TransactionToolbarSplitButton
                        label="Pengaturan tabel"
                        icon={<CogIcon className="h-4 w-4" />}
                        items={[{ id: 'arrange-columns', label: 'Atur kolom' }]}
                    />
                </>
            }
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
