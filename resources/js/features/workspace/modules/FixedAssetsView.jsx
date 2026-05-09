import { useMemo } from 'react';

import { buildFixedAssetsConfig } from '@/features/workspace/modules/fixedAssetsConfig';
import FixedAssetsFormView from '@/features/workspace/modules/fixed-assets/FixedAssetsFormView';
import FixedAssetsTableView from '@/features/workspace/modules/fixed-assets/FixedAssetsTableView';

export default function FixedAssetsView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildFixedAssetsConfig(page.fixedAssets), [page.fixedAssets]);

    if (mode === 'table') {
        return <FixedAssetsTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <FixedAssetsFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
