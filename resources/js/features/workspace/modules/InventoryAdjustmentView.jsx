import { useMemo } from 'react';

import {
    buildInventoryAdjustmentConfig,
    buildInventoryAdjustmentRecord,
} from '@/features/workspace/modules/priceAdjustmentConfig';
import {
    InventoryAdjustmentFormView,
    InventoryAdjustmentTableView,
} from '@/features/workspace/modules/shared/InventoryAdjustmentWorkspace';

export default function InventoryAdjustmentView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
}) {
    const pageConfig = page.inventoryAdjustment ?? page.priceAdjustment;
    const config = useMemo(
        () => buildInventoryAdjustmentConfig(pageConfig),
        [pageConfig],
    );

    return mode === 'table' ? (
        <InventoryAdjustmentTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <InventoryAdjustmentFormView
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            buildRecord={buildInventoryAdjustmentRecord}
        />
    );
}
