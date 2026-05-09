import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    buildCashReceiptDetailRecordFromRow,
    buildCashReceiptFormState,
    CashReceiptEmptyLineRow,
    CashReceiptSortHeader,
} from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSectionRail,
    TransactionSwitch,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SearchIcon } from '@/features/workspace/shared/Icons';

function ReceiptLineItemsSection({ config, values }) {
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
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <div className="text-right text-[24px] font-normal text-[#1f2436]">
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
                                        className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${
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
                                        className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    >
                                        {config.lineTable.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-3 text-[15px] text-[#131a28]`.trim()}
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

function ReceiptInfoSection({ config, values, isDetail }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.infoTitle} icon="document" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.checkNumber} />
                <div className="max-w-[276px]">
                    <TextInput
                        value={values.checkNumber}
                        readOnly
                        className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <TransactionFieldLabel label={config.labels.payer} />
                <textarea
                    value={values.payer}
                    readOnly
                    rows={3}
                    className="min-h-[56px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none"
                />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.voided} />
                        <label className="inline-flex h-[34px] items-center gap-2 text-[17px] text-[#1f2436]">
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
                <ChipLookupField values={values.branches} placeholder={config.branchPlaceholder} onRemove={() => {}} searchLabel="Cari cabang" />

                <TransactionFieldLabel label={config.labels.notes} />
                <textarea
                    value={values.notes}
                    readOnly
                    rows={4}
                    className="min-h-[70px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none"
                />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.reconcileStatus} />
                        <div className="pt-1 text-[17px] text-[#1f2436]">
                            <span className="italic">{values.reconcileStatus}</span>
                            <span className="ml-8">{values.reconcileDate}</span>
                        </div>

                        <TransactionFieldLabel label={config.labels.printStatus} />
                        <TextInput
                            value={values.printStatus}
                            readOnly
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#5f6779]"
                        />
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default function CashReceiptFormView({ config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        return config.detailRecords?.[activeRecordId] ?? buildCashReceiptDetailRecordFromRow(config.rowMap?.[activeRecordId], config);
    }, [activeRecordId, config]);
    const [values, setValues] = useState(() => buildCashReceiptFormState(sourceRecord, config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildCashReceiptFormState(sourceRecord, config));
    }, [config, sourceRecord]);

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (activeRecordId ? true : action.id !== 'delete'))
                .map((action) => (action.id === 'save' ? { ...action, tone: values.saveTone } : action)),
        [activeRecordId, config.dockActions, values.saveTone],
    );

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                            <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <TransactionFieldLabel label={config.labels.cashBank} required />
                                <ChipLookupField values={values.bankAccounts} placeholder={config.cashBankPlaceholder} onRemove={() => {}} searchLabel="Cari kas atau bank" />

                                <TransactionFieldLabel label={config.labels.entryDate} required />
                                <TransactionDateInput value={values.entryDate} />
                            </div>

                            <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <div className="flex items-center justify-start gap-4 sm:justify-end">
                                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                                    {!activeRecordId ? (
                                        <TransactionSwitch
                                            checked={values.autoNumber}
                                            onChange={(nextChecked) => setValues((current) => ({ ...current, autoNumber: nextChecked }))}
                                        />
                                    ) : null}
                                </div>

                                {values.autoNumber ? (
                                    <SelectField
                                        value={values.numberingType}
                                        onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        selectClassName="text-[15px] text-[#1f2436]"
                                    >
                                        {config.numberingOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>
                                ) : (
                                    <TextInput
                                        value={values.documentNumber}
                                        readOnly
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        inputClassName="text-[15px] text-[#1f2436]"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-[620px] gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <ReceiptInfoSection config={config} values={values} isDetail={Boolean(activeRecordId)} />
                            ) : (
                                <ReceiptLineItemsSection config={config} values={values} />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end px-3 pb-3">
                        <TransactionTotalCard label={config.totalCardLabel} value={values.totalValue} />
                    </div>
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={dockActions} />
                </div>
            </div>
        </div>
    );
}
