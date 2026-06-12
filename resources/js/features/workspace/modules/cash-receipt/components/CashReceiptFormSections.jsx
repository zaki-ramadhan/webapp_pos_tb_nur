import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SearchIcon } from '@/features/workspace/shared/Icons';
import { CashReceiptEmptyLineRow } from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';

export function ReceiptLineItemsSection({ config, values, handlers = {} }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    <TextInput
                        value={values.lineLookup}
                        readOnly
                        placeholder={config.lineSearchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        onClick={handlers.onSelectLineAccount}
                    />
                </div>

                <div className="text-right text-2xl font-normal text-[#1f2436]">
                    {detailTitle} <span className="text-[#ED3969]">*</span>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <div className="min-w-[760px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {config.lineTable.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${
                                            column.align === 'right'
                                                ? 'text-right'
                                                : column.align === 'left'
                                                  ? 'text-left'
                                                  : 'text-center'
                                        }`.trim()}
                                    >
                                        {column.label}
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {values.lineItems.length ? (
                                values.lineItems.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${handlers.onEditLineItem ? 'cursor-pointer' : ''}`.trim()}
                                        onClick={handlers.onEditLineItem ? () => handlers.onEditLineItem(row) : undefined}
                                    >
                                        {config.lineTable.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-3 text-base text-[#131a28]`.trim()}
                                            >
                                                {formatTableTextValue(row[column.id])}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <CashReceiptEmptyLineRow
                                    colSpan={config.lineTable.columns.length}
                                    emptyLabel={config.lineTable.emptyLabel}
                                />
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}

export function ReceiptInfoSection({ config, values, isDetail, handlers = {} }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.infoTitle} icon="document" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.checkNumber} />
                <div className="max-w-[276px]">
                    <TextInput
                        value={values.checkNumber}
                        readOnly
                        className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>

                <TransactionFieldLabel label={config.labels.payer} />
                <textarea
                    value={values.payer}
                    readOnly
                    rows={3}
                    className="min-h-[56px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none"
                />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.voided} />
                        <label className="inline-flex h-[34px] items-center gap-2 text-xs sm:text-sm text-[#1f2436]">
                            <input
                                type="checkbox"
                                checked={values.voided}
                                readOnly
                                className="h-[24px] w-[24px] rounded-[4px] border border-[#cfd6e2]"
                            />
                            <span>Ya</span>
                        </label>
                    </>
                ) : null}

                <TransactionFieldLabel label={config.labels.branch} required />
                <ChipLookupField
                    values={values.branches}
                    placeholder={config.branchPlaceholder}
                    onRemove={(value) => handlers.onRemoveBranch?.(value)}
                    searchLabel="Cari cabang"
                    onSearch={handlers.onSelectBranch}
                />

                <TransactionFieldLabel label={config.labels.notes} />
                <textarea
                    value={values.notes}
                    readOnly
                    rows={4}
                    className="min-h-[70px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none"
                />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.reconcileStatus} />
                        <div className="pt-1 text-xs sm:text-sm text-[#1f2436]">
                            <span className="italic">{values.reconcileStatus}</span>
                            <span className="ml-8">{values.reconcileDate}</span>
                        </div>

                        <TransactionFieldLabel label={config.labels.printStatus} />
                        <TextInput
                            value={values.printStatus}
                            readOnly
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#5f6779]"
                        />
                    </>
                ) : null}
            </div>
        </div>
    );
}
