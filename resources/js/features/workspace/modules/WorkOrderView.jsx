import { useMemo } from 'react';

import { buildWorkOrderConfig } from '@/features/workspace/modules/workOrderConfig';
import WorkOrderFormView from '@/features/workspace/modules/work-order/WorkOrderFormView';
import WorkOrderTableView from '@/features/workspace/modules/work-order/WorkOrderTableView';

export default function WorkOrderView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildWorkOrderConfig(page.workOrder), [page.workOrder]);

    if (mode === 'table') {
        return <WorkOrderTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <WorkOrderFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
