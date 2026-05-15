import { useMemo } from 'react';

import { buildItemsServicesConfig } from '@/features/workspace/modules/items-services/itemsServicesConfig';
import ItemsServicesFormView from '@/features/workspace/modules/items-services/ItemsServicesFormView';
import ItemsServicesTableView from '@/features/workspace/modules/items-services/ItemsServicesTableView';
import {
    PlusIcon,
} from '@/features/workspace/shared/Icons';

export default function ItemsServicesView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildItemsServicesConfig(page.itemsServices), [page.itemsServices]);

    return mode === 'table' ? (
        <ItemsServicesTableView
            config={config}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <ItemsServicesFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
