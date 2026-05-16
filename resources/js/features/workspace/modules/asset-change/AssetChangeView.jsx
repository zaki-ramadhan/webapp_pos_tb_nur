import { useMemo } from 'react';

import { buildAssetChangeConfig } from './assetChangeConfig';
import AssetChangeFormView from './AssetChangeFormView';
import AssetChangeTableView from './AssetChangeTableView';

export default function AssetChangeView({
    page,
    mode = 'table',
    activeLevel2Tab = null,
    onOpenContent,
    onOpenDetail,
}) {
    const config = useMemo(() => buildAssetChangeConfig(page.assetChange ?? {}), [page.assetChange]);

    if (mode === 'table') {
        return <AssetChangeTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <AssetChangeFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />;
}
