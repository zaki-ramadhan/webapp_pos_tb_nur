import { useMemo } from 'react';

import { buildMaterialAdditionConfig } from './materialAdditionConfig';
import MaterialAdditionFormView from './MaterialAdditionFormView';
import MaterialAdditionTableView from './MaterialAdditionTableView';

export default function MaterialAdditionView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildMaterialAdditionConfig(page.materialAddition), [page.materialAddition]);

    if (mode === 'table') {
        return <MaterialAdditionTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <MaterialAdditionFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />;
}
