import { useMemo, useRef } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import BankTransferFormView from './BankTransferFormView';
import BankTransferTableView from './BankTransferTableView';
import { buildBankTransferFilters, buildBankTransferRow } from './bankTransferShared';

export default function BankTransferView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
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
                refreshLabel: loading ? 'Memuat data...' : page.bankTransfer.table?.refreshLabel,
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

    return mode === 'table' ? (
        <BankTransferTableView config={tableConfig} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <BankTransferFormView
            pageId={page.id}
            config={formConfig}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
