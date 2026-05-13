import InquiryWorkspaceView from '@/features/workspace/modules/shared/InquiryWorkspaceView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    BACKEND_BANK_RESOURCES,
    buildBankFilters,
    mapBankRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';
import { bankInquiryPageConfigs } from '@/features/workspace/modules/bankInquiryConfig';
import { useMemo, useState } from 'react';

export default function BankInquiryView({ page }) {
    const config = bankInquiryPageConfigs[page.id] ?? bankInquiryPageConfigs['bank-statement'];
    const [filters, setFilters] = useState(() => buildBankFilters({}));
    const resource = BACKEND_BANK_RESOURCES[page.id] ?? BACKEND_BANK_RESOURCES['bank-statement'];
    const { rows, loading, error, reload } = useBackendIndexResource({
        resource,
        filters,
    });
    const tableRows = useMemo(() => mapBankRows(page.id, rows), [page.id, rows]);

    return (
        <InquiryWorkspaceView
            key={page.id}
            config={config}
            rows={tableRows}
            loading={loading}
            error={error}
            onRefresh={reload}
            onValuesChange={(values) => setFilters(buildBankFilters(values))}
        />
    );
}
