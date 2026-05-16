import { useMemo } from 'react';

import { buildAssetMoveConfig } from './assetMoveConfig';
import AssetMoveFormView from './AssetMoveFormView';
import AssetMoveTableView from './AssetMoveTableView';

export default function AssetMoveView({
    page,
    mode = 'table',
    activeLevel2Tab = null,
    onOpenContent,
    onOpenDetail,
}) {
    const config = useMemo(() => buildAssetMoveConfig(page.assetMove ?? {}), [page.assetMove]);

    if (mode === 'form') {
        return <AssetMoveFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
    }

    return <AssetMoveTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
}
