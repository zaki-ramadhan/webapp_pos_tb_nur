import { useMemo } from 'react';

import {
    buildWorkCompletionConfig,
} from './inventoryFulfillmentConfig';
import WorkCompletionFormView from './WorkCompletionFormView';
import WorkCompletionTableView from './WorkCompletionTableView';

export default function WorkCompletionView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildWorkCompletionConfig(page.workCompletion), [page.workCompletion]);

    return mode === 'table' ? (
        <WorkCompletionTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <WorkCompletionFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
