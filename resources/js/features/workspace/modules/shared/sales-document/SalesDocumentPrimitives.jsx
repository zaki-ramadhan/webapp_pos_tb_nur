import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SearchIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneItemModal(modal) {
    if (!modal) {
        return null;
    }

    return {
        ...modal,
        tabs: (modal.tabs ?? []).map((tab) => ({ ...tab })),
        values: modal.values
            ? {
                  ...modal.values,
                  department: cloneList(modal.values.department),
                  unit: cloneList(modal.values.unit),
                  warehouse: cloneList(modal.values.warehouse),
                  salesPerson: cloneList(modal.values.salesPerson),
                  serialNumbers: cloneList(modal.values.serialNumbers),
              }
            : null,
    };
}

export function buildSalesDocumentFormState(source = {}) {
    return {
        ...source,
        customer: cloneList(source.customer),
        items: cloneList(source.items),
        paymentTerms: cloneList(source.paymentTerms),
        bankAccounts: cloneList(source.bankAccounts),
        branches: cloneList(source.branches),
        contacts: cloneList(source.contacts),
        shippingMethod: cloneList(source.shippingMethod),
        fob: cloneList(source.fob),
        additionalCosts: cloneList(source.additionalCosts),
        summary: cloneList(source.summary),
        advancePayments: cloneList(source.advancePayments),
        dockActions: cloneList(source.dockActions),
        itemModal: cloneItemModal(source.itemModal),
    };
}

export function ReadonlyDocumentTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            readOnly
            rows={rows}
            className={`w-full resize-y rounded-[4px] border border-ui-border px-4 py-3 text-xs sm:text-sm text-brand-dark outline-none ${className}`.trim()}
        />
    );
}

import DocumentStampShared from '@/components/ui/DocumentStamp';

export function DocumentStamp(props) {
    return <DocumentStampShared {...props} />;
}

function resolveCellAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}

export function SearchableTableSection({
    searchValue,
    searchPlaceholder,
    title,
    columns,
    rows,
    emptyLabel,
    minWidthClassName = 'min-w-[720px] sm:min-w-[820px] lg:min-w-[900px]',
    titleRequired = true,
    showTitleSearchButton = false,
    hideSearchField = false,
    searchInput = null,
    leadingAction = null,
    onTitleClick,
    onRowClick,
    extraActions = null,
}) {
    const titleContent = (
        <>
            {title}
            {titleRequired ? <span className="text-tab-active-border-t"> *</span> : null}
        </>
    );
    const hasRows = rows.length > 0;

    return (
        <div className={`flex flex-col ${hasRows ? 'min-h-[540px] sm:min-h-[620px]' : 'min-h-[240px] sm:min-h-[260px]'}`.trim()}>
            <div className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    {leadingAction ? (
                        <button
                            type="button"
                            onClick={leadingAction.onClick}
                            className="inline-flex h-[40px] w-full shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white px-5 text-base text-brand-blue-accent sm:w-auto hover:bg-brand-blue-lightest transition"
                        >
                            {leadingAction.label}
                        </button>
                    ) : null}

                    {extraActions}

                    {!hideSearchField ? (
                        <div className="min-w-0 flex-1 sm:max-w-[320px] md:max-w-[380px] w-full">
                            {searchInput ?? (
                                <TextInput
                                    value={searchValue}
                                    readOnly
                                    placeholder={searchPlaceholder}
                                    trailing={<SearchIcon className="h-5 w-5 text-brand-dark" />}
                                    className="h-[40px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                />
                            )}
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    {showTitleSearchButton ? (
                        <button
                            type="button"
                            className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[4px] border border-ui-border bg-white text-brand-dark"
                            aria-label={`Cari ${title}`}
                        >
                            <SearchIcon className="h-5 w-5 text-brand-dark" />
                        </button>
                    ) : null}

                    {onTitleClick ? (
                        <button
                            type="button"
                            className="text-left text-base sm:text-lg md:text-xl font-normal text-brand-dark sm:text-right inline-flex items-center gap-1 whitespace-nowrap"
                            onClick={onTitleClick}
                        >
                            {titleContent}
                        </button>
                    ) : (
                        <div className="text-left text-base sm:text-lg md:text-xl font-normal text-brand-dark sm:text-right inline-flex items-center gap-1 whitespace-nowrap">{titleContent}</div>
                    )}
                </div>
            </div>

            <div className={`mt-1 overflow-x-auto ${hasRows ? 'min-h-0 flex-1' : ''}`.trim()}>
                <div className={(minWidthClassName ?? '').replace(/\b(?:[a-z-]*:)?min-w-\[[^\]]+\]/g, '').trim() || 'w-full'}>
                    <DataTable wrapperClassName="border-table-wrapper-border">
                        <DataTableHeader className="bg-table-header-bg">
                            <tr>
                                {columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-base font-normal text-white ${resolveCellAlignClassName(column.align)}`.trim()}
                                    >
                                        {column.kind === 'spacer' ? (
                                            <span className="flex justify-center">
                                                <TableActionIcon className="h-4 w-4 text-white/55" />
                                            </span>
                                        ) : (
                                            column.label
                                        )}
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {rows.length ? (
                                rows.map((row) => {
                                    const rowClickable = Boolean(onRowClick);

                                    return (
                                        <DataTableRow
                                            key={row.id}
                                            className={`border-ui-border-row bg-white ${rowClickable ? 'cursor-pointer hover:bg-workspace-hover-bg' : ''}`.trim()}
                                            onClick={rowClickable ? () => onRowClick(row) : undefined}
                                        >
                                            {columns.map((column) => (
                                                <DataTableCell
                                                    key={column.id}
                                                    className={`px-3 text-base text-text-workspace-dark ${resolveCellAlignClassName(column.align)}`.trim()}
                                                >
                                                    {column.kind === 'spacer' ? (
                                                        <span className="inline-flex items-center justify-center text-text-workspace-inactive">
                                                            <TableActionIcon className="h-4 w-4" />
                                                        </span>
                                                    ) : (
                                                        formatTableTextValue(row[column.id], column)
                                                    )}
                                                </DataTableCell>
                                            ))}
                                        </DataTableRow>
                                    );
                                })
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell colSpan={columns.length} className="px-3 py-3 text-center text-base text-text-workspace-dark">
                                        {emptyLabel}
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}
