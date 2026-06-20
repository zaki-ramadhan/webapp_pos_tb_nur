import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
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
                                         className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white text-center`.trim()}
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
                                        className={`border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'} ${handlers.onEditLineItem ? 'cursor-pointer' : ''}`.trim()}
                                        onClick={handlers.onEditLineItem ? () => handlers.onEditLineItem(row) : undefined}
                                    >
                                        {config.lineTable.columns.map((column) => (
                                             <DataTableCell
                                                 key={column.id}
                                                 className={`text-left px-3 text-base text-[#131a28]`.trim()}
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
                <TextareaField
                    value={values.payer}
                    readOnly
                    rows={3}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[56px] text-xs sm:text-sm text-[#1f2436]"
                />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.voided} />
                        <CheckboxField
                            id="voided"
                            label="Ya"
                            checked={values.voided}
                            disabled
                            inputClassName="h-[24px] w-[24px] rounded-[4px]"
                            containerClassName="w-auto inline-flex items-center"
                        />
                    </>
                ) : null}



                <TransactionFieldLabel label={config.labels.notes} />
                <TextareaField
                    value={values.notes}
                    readOnly
                    rows={4}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[70px] text-xs sm:text-sm text-[#1f2436]"
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
