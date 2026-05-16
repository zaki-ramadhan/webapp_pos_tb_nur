import { useMemo } from 'react';

import { buildItemRequestConfig } from './itemRequestConfig';
import ItemRequestFormView from './ItemRequestFormView';
import ItemRequestTableView from './ItemRequestTableView';

export default function ItemRequestView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildItemRequestConfig(page.itemRequest), [page.itemRequest]);

    if (mode === 'table') {
        return <ItemRequestTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <ItemRequestFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />;
}
