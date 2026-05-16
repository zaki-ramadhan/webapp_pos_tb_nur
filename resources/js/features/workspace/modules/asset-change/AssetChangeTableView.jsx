import TableListView from '@/features/workspace/modules/TableListView';

export default function AssetChangeTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onCreate,
            }}
            onRowClick={onOpenDetail ? (row) => onOpenDetail({ recordId: row.id, label: row.number ?? row.id }) : null}
        />
    );
}
