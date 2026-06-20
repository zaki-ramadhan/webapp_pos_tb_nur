import InquiryWorkspaceView from '@/features/workspace/modules/shared/InquiryWorkspaceView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    BACKEND_BANK_RESOURCES,
    buildBankFilters,
    mapBankRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';
import { bankInquiryPageConfigs } from './bankInquiryConfig';
import { useMemo, useState } from 'react';
import BankReconciliationWorkspace from './BankReconciliationWorkspace';

export default function BankInquiryView({ page }) {
    const config = bankInquiryPageConfigs[page.id] ?? bankInquiryPageConfigs['bank-statement'];
    const [filters, setFilters] = useState(() => buildBankFilters({}));
    const resource = BACKEND_BANK_RESOURCES[page.id] ?? BACKEND_BANK_RESOURCES['bank-statement'];
    const {
        rows,
        total,
        loading,
        error,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to
    } = useBackendIndexResource({
        resource,
        filters,
        initialPerPage: 25,
    });
    const tableRows = useMemo(() => mapBankRows(page.id, rows), [page.id, rows]);

    if (page.id === 'bank-reconciliation') {
        return (
            <BankReconciliationWorkspace
                rows={tableRows}
                loading={loading}
                onRefresh={reload}
                filters={filters}
                onFiltersChange={setFilters}
                config={config}
                pagination={{
                    page: currentPage,
                    perPage,
                    total,
                    lastPage,
                    from,
                    to,
                    onPageChange: setPage,
                    onPerPageChange: setPerPage,
                }}
            />
        );
    }

    return (
        <InquiryWorkspaceView
            key={page.id}
            config={config}
            rows={tableRows}
            loading={loading}
            error={error}
            onRefresh={reload}
            onValuesChange={(values) => setFilters(buildBankFilters(values))}
            pagination={{
                page: currentPage,
                perPage,
                total,
                lastPage,
                from,
                to,
                onPageChange: setPage,
                onPerPageChange: setPerPage,
            }}
        />
    );
}
