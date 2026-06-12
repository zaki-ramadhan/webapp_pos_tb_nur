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
            className={`w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none ${className}`.trim()}
        />
    );
}

export function DocumentStamp({ label, tone, className = '' }) {
    const toneClassName =
        tone === 'blue'
            ? 'border-[#7fd1ff] text-[#7dcaf4]'
            : tone === 'gray'
              ? 'border-[#bebfc8] text-[#b8bac3]'
              : 'border-[#8bd987] text-[#8ccc81]';

    return (
        <div
            className={`pointer-events-none absolute flex h-[92px] w-[136px] rotate-[-18deg] items-center justify-center opacity-55 ${className}`.trim()}
        >
            <div className={`relative flex h-[78px] w-[78px] items-center justify-center rounded-full border-[4px] ${toneClassName}`.trim()}>
                <div className={`absolute h-[92px] w-[92px] rounded-full border-[2px] ${toneClassName}`.trim()} />
            </div>
            <div
                className={`absolute whitespace-pre-line rounded-[3px] border-[3px] bg-white px-3 py-1 text-center text-sm font-bold leading-[1.05] tracking-[0.12em] ${toneClassName}`.trim()}
            >
                {label}
            </div>
        </div>
    );
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
            {titleRequired ? <span className="text-[#ED3969]"> *</span> : null}
        </>
    );
    const hasRows = rows.length > 0;

    return (
        <div className={`flex flex-col ${hasRows ? 'min-h-[540px] sm:min-h-[620px]' : 'min-h-[240px] sm:min-h-[260px]'}`.trim()}>
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className={`flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center ${hideSearchField ? '' : 'sm:max-w-[640px]'}`.trim()}>
                    {leadingAction ? (
                        <button
                            type="button"
                            onClick={leadingAction.onClick}
                            className="inline-flex h-[40px] w-full shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-5 text-base text-[#21539b] sm:w-auto hover:bg-[#f3f7fc] transition"
                        >
                            {leadingAction.label}
                        </button>
                    ) : null}

                    {extraActions}

                    {!hideSearchField ? (
                        <div className="min-w-0 flex-1">
                            {searchInput ?? (
                                <TextInput
                                    value={searchValue}
                                    readOnly
                                    placeholder={searchPlaceholder}
                                    trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                />
                            )}
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    {showTitleSearchButton ? (
                        <button
                            type="button"
                            className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[4px] border border-[#cfd6e2] bg-white text-[#1f2436]"
                            aria-label={`Cari ${title}`}
                        >
                            <SearchIcon className="h-5 w-5 text-[#1f2436]" />
                        </button>
                    ) : null}

                    {onTitleClick ? (
                        <button
                            type="button"
                            className="text-left text-xl font-normal text-[#1f2436] sm:text-right sm:text-2xl"
                            onClick={onTitleClick}
                        >
                            {titleContent}
                        </button>
                    ) : (
                        <div className="text-left text-xl font-normal text-[#1f2436] sm:text-right sm:text-2xl">{titleContent}</div>
                    )}
                </div>
            </div>

            <div className={`mt-4 overflow-x-auto ${hasRows ? 'min-h-0 flex-1' : ''}`.trim()}>
                <div className={minWidthClassName}>
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${resolveCellAlignClassName(column.align)}`.trim()}
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
                                            className={`border-[#dde1e8] bg-white ${rowClickable ? 'cursor-pointer hover:bg-[#eef3fb]' : ''}`.trim()}
                                            onClick={rowClickable ? () => onRowClick(row) : undefined}
                                        >
                                            {columns.map((column) => (
                                                <DataTableCell
                                                    key={column.id}
                                                    className={`px-3 text-base text-[#131a28] ${resolveCellAlignClassName(column.align)}`.trim()}
                                                >
                                                    {column.kind === 'spacer' ? (
                                                        <span className="inline-flex items-center justify-center text-[#a8afbe]">
                                                            <TableActionIcon className="h-4 w-4" />
                                                        </span>
                                                    ) : (
                                                        formatTableTextValue(row[column.id])
                                                    )}
                                                </DataTableCell>
                                            ))}
                                        </DataTableRow>
                                    );
                                })
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell colSpan={columns.length} className="px-3 py-3 text-center text-base text-[#131a28]">
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
