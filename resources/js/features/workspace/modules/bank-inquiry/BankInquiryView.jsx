import InquiryWorkspaceView from '@/features/workspace/modules/shared/InquiryWorkspaceView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    BACKEND_BANK_RESOURCES,
    buildBankFilters,
    mapBankRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';
import { bankInquiryPageConfigs } from './bankInquiryConfig';
import { useCallback, useMemo, useState } from 'react';


export default function BankInquiryView({ page }) {
    const config = bankInquiryPageConfigs[page.id] ?? bankInquiryPageConfigs['bank-statement'];
    const isStatement = page.id === 'bank-statement';
    const [filters, setFilters] = useState(() => buildBankFilters(isStatement ? { keyword: 'Bank BRI' } : {}));
    const resource = BACKEND_BANK_RESOURCES[page.id] ?? BACKEND_BANK_RESOURCES['bank-statement'];
    const {
        rows,
        total,
        loading,
        error,
        reload,
        serverPaginationProps,
    } = useBackendIndexResource({
        resource,
        filters,
        initialPerPage: 25,
    });
    const isAccountSelected = Boolean(filters.search?.trim() || filters.account_id);
    const tableRows = useMemo(() => {
        if (!isAccountSelected && (page.id === 'bank-history' || page.id === 'account-history' || page.id === 'bank-statement')) {
            return [];
        }
        return mapBankRows(page.id, rows);
    }, [page.id, rows, isAccountSelected]);

    const handleValuesChange = useCallback((values) => {
        const nextFilters = buildBankFilters(values);
        setFilters((prev) => {
            if (
                prev.search === nextFilters.search &&
                prev.account_id === nextFilters.account_id &&
                prev.start_date === nextFilters.start_date &&
                prev.end_date === nextFilters.end_date &&
                prev.per_page === nextFilters.per_page
            ) {
                return prev;
            }
            return nextFilters;
        });
    }, []);

    return (
        <div className="flex h-full flex-col min-h-0">
            {isStatement && (
                <div className="border-b border-ui-border bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-semibold text-slate-800">
                            SmartLink e-Banking: BRI Mobile (BRIMO)
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="font-mono text-slate-600">0129-01-002847-50-8</span>
                        <span className="text-slate-500 font-medium">(TB NUR - OPERASIONAL)</span>
                    </div>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                        Sinkronisasi Otomatis BRIMO Aktif
                    </span>
                </div>
            )}
            <InquiryWorkspaceView
                key={page.id}
                pageId={page.id}
                config={config}
                rows={tableRows}
                loading={loading}
                error={error}
                onRefresh={reload}
                onValuesChange={handleValuesChange}
                pagination={serverPaginationProps}
            />
        </div>
    );
}
