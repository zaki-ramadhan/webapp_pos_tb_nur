import { useMemo } from 'react';

import TableListView from '@/features/workspace/modules/TableListView';
import { buildAssetDisposalConfig } from './assetDisposalConfig';

export default function AssetDisposalTableView({ page, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => buildAssetDisposalConfig(page.assetDisposal ?? {}),
        [page.assetDisposal],
    );

    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onOpenContent,
            }}
            onRowClick={onOpenDetail ? (row) => onOpenDetail({ recordId: row.id, label: row.number ?? row.id }) : null}
        />
    );
}
