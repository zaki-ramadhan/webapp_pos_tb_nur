import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';

export const sharedDetailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction(),
    createAttachmentDockAction(),
    {
        id: 'approval',
        label: 'Status proses',
        icon: 'check',
        tone: 'success',
        items: [{ id: 'view-approval', label: 'Lihat status persetujuan' }],
    },
    createMoreDockAction(),
    createDeleteDockAction(),
];

export function mergeSalesDocumentConfigWithPage(baseConfig, pageConfig = {}) {
    const mergedCostTable =
        baseConfig.costTable || pageConfig.costTable
            ? {
                  ...(baseConfig.costTable ?? {}),
                  ...(pageConfig.costTable ?? {}),
                  columns: pageConfig.costTable?.columns ?? baseConfig.costTable?.columns,
              }
            : undefined;
    const mergedAdvancePaymentTable =
        baseConfig.advancePaymentTable || pageConfig.advancePaymentTable
            ? {
                  ...(baseConfig.advancePaymentTable ?? {}),
                  ...(pageConfig.advancePaymentTable ?? {}),
                  columns: pageConfig.advancePaymentTable?.columns ?? baseConfig.advancePaymentTable?.columns,
              }
            : undefined;

    return {
        ...baseConfig,
        ...pageConfig,
        topActions: pageConfig.topActions ?? baseConfig.topActions,
        labels: {
            ...baseConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        table: {
            ...baseConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns ?? baseConfig.table.columns,
            rows: pageConfig.table?.rows ?? baseConfig.table.rows,
            filters: pageConfig.table?.filters ?? baseConfig.table.filters,
            downloadItems: pageConfig.table?.downloadItems ?? baseConfig.table.downloadItems,
            printItems: pageConfig.table?.printItems ?? baseConfig.table.printItems,
            settingsItems: pageConfig.table?.settingsItems ?? baseConfig.table.settingsItems,
        },
        sectionTabs: pageConfig.sectionTabs ?? baseConfig.sectionTabs,
        itemTable: {
            ...baseConfig.itemTable,
            ...(pageConfig.itemTable ?? {}),
            columns: pageConfig.itemTable?.columns ?? baseConfig.itemTable.columns,
        },
        ...(mergedCostTable ? { costTable: mergedCostTable } : {}),
        ...(mergedAdvancePaymentTable ? { advancePaymentTable: mergedAdvancePaymentTable } : {}),
        itemModal: {
            ...(baseConfig.itemModal ?? {}),
            ...(pageConfig.itemModal ?? {}),
        },
        draft: {
            ...baseConfig.draft,
            ...(pageConfig.draft ?? {}),
        },
        detailRecords: {
            ...baseConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildSalesDocumentRecord(row = {}, draft, detailRecords, fallback = {}) {
    const detailRecord = detailRecords[row.id];

    if (detailRecord) {
        return {
            ...draft,
            ...detailRecord,
        };
    }

    return {
        ...draft,
        customer: row.customer ? [`${fallback.customerPrefix ?? '[CJKT-0001]'} ${row.customer}`] : [],
        entryDate: row.date ?? draft.entryDate,
        autoNumber: false,
        documentNumber: row.number ?? '',
        currency: fallback.currency ?? 'IDR',
        showProcessButton: fallback.showProcessButton ?? true,
        processDisabled: row.status === 'Terproses',
        approvalStamp: fallback.approvalStamp ?? 'DISETUJUI',
        processStamp: fallback.processStamp ?? (row.status ? row.status.toUpperCase() : ''),
        subtotal: `Rp ${row.total ?? '0'}`,
        taxLabel: fallback.taxLabel ?? '',
        taxValue: fallback.taxValue ?? '',
        total: `Rp ${row.total ?? '0'}`,
        summary: [
            ['Total', `Rp ${row.total ?? '0'}`],
            ...(fallback.includeAdvanceSummary ?? true
                ? [
                      ['Uang Muka', 'Rp 0'],
                      ['Uang Muka Terpakai/Retur', 'Rp 0'],
                      ['Sisa Uang Muka', 'Rp 0'],
                  ]
                : []),
            ['Status', row.status ?? '-'],
            ...(fallback.includePrintedSummary ?? true ? [['Dicetak/email', 'Belum cetak/email']] : []),
        ],
        processedBy: fallback.processedBy ?? {
            number: '-',
            date: row.date ?? '',
        },
        dockActions: fallback.dockActions ?? sharedDetailDockActions,
    };
}
