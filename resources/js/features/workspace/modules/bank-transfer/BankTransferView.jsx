import { useEffect, useMemo, useRef, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import BankTransferFormView from './BankTransferFormView';
import BankTransferTableView from './BankTransferTableView';
import { buildBankTransferFilters, buildBankTransferRow } from './bankTransferShared';

export default function BankTransferView({
    page,
    mode,
    activeLevel2Tab, level2Tabs = [],
    onOpenContent,
    onOpenDetail,
    onCloseDetail,}) {
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
        resource: 'bank-transfers',
        initialPerPage: 25,
        enabled: true,
    });

  // Stable form config — excludes loading/error/rows so the form state isn't

  // reset every time the background data fetch completes.

    const formConfigRef = useRef(null);
    if (!formConfigRef.current) {
        formConfigRef.current = page.bankTransfer;
    }

    const mappedRows = useMemo(() => rows.map((record) => buildBankTransferRow(record)), [rows]);

  // rowMap is also stable per fetch result — used only for detail record lookup

    const rowMap = useMemo(
        () => mappedRows.reduce((result, row) => { result[row.id] = row; return result; }, {}),
        [mappedRows],
    );

  // formConfig stays referentially stable between fetches so useFormDraftState

  // doesn't treat it as a "source record change" and wipe user-entered data.

    const formConfig = useMemo(
        () => ({ ...formConfigRef.current, rowMap }),
        [rowMap],
    );

    const tableConfig = useMemo(
        () => ({
            ...formConfig,
            table: {
                ...page.bankTransfer.table,
                rows: mappedRows,
                filters: buildBankTransferFilters(page.bankTransfer.table?.filters ?? [], mappedRows),
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: page.bankTransfer?.table?.refreshLabel || 'Muat ulang',
                emptyLabel: error || page.bankTransfer.table?.emptyLabel || 'Belum ada data',
                onRefresh: reload,
                pagination: {
                    page: currentPage,
                    perPage,
                    total,
                    lastPage,
                    from,
                    to,
                    onPageChange: setPage,
                    onPerPageChange: setPerPage,
                },
            },
        }),
        [formConfig, page.bankTransfer, mappedRows, total, loading, error, reload, currentPage, perPage, lastPage, from, to, setPage, setPerPage],
    );

        const [lastActiveFormTab, setLastActiveFormTab] = useState(null);

    useEffect(() => {
        if (activeLevel2Tab && activeLevel2Tab.kind === 'content') {
            setLastActiveFormTab(activeLevel2Tab);
        } else if (!activeLevel2Tab) {
            setLastActiveFormTab(null);
        }
    }, [activeLevel2Tab]);

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <BankTransferTableView config={tableConfig} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <BankTransferFormView
            pageId={page.id}
            config={formConfig}
            activeLevel2Tab={lastActiveFormTab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
                </div>
            )}
        </div>
    );
}
