import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { buildSalesReceiptRecord } from '@/features/workspace/modules/salesReceiptConfig';
import SalesReceiptInvoiceModal from '@/features/workspace/modules/shared/SalesReceiptInvoiceModal';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionRail,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    SalesReceiptAdditionalInfoSection,
    SalesReceiptInvoicesSection,
} from '@/features/workspace/modules/sales-receipt/SalesReceiptFormSections';
import {
    buildSalesReceiptFormState,
    ReceiptAmountActionButton,
    ReceiptAmountInput,
    ReceiptSummaryFooter,
} from '@/features/workspace/modules/sales-receipt/salesReceiptViewShared';

export default function SalesReceiptFormView({ config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [activeInvoiceModal, setActiveInvoiceModal] = useState(null);
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () => (activeRecordId ? buildSalesReceiptRecord(config.rowMap?.[activeRecordId]) : config.draft),
        [activeRecordId, config.draft, config.rowMap],
    );
    const [values, setValues] = useState(() => buildSalesReceiptFormState(sourceRecord));
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildSalesReceiptFormState(sourceRecord));
        setActiveInvoiceModal(null);
    }, [config.sectionTabs, sourceRecord]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <div className={`grid gap-x-8 gap-y-3 ${isDetail ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]'}`.trim()}>
                            <div className={`grid gap-y-3 ${isDetail ? 'sm:grid-cols-[170px_minmax(0,1fr)_180px]' : 'sm:grid-cols-[170px_minmax(0,1fr)]'} sm:items-center sm:gap-x-4`.trim()}>
                                <TransactionFieldLabel label={config.labels.customer} required />
                                <ChipLookupField values={values.customer} placeholder="Cari/Pilih Pelanggan..." onRemove={() => {}} searchLabel="Cari pelanggan" />
                                {isDetail ? (
                                    <div className="max-w-[180px]">
                                        <TextInput value={values.currency} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />
                                    </div>
                                ) : null}

                                <TransactionFieldLabel label={config.labels.bank} required />
                                <ChipLookupField values={values.bankAccounts} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari bank" heightClassName="h-[40px]" />
                                {isDetail ? <div /> : null}

                                <TransactionFieldLabel label={config.labels.paymentAmount} />
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="min-w-0 flex-1 max-w-[280px]">
                                        <ReceiptAmountInput value={values.paymentAmount} isDetail={isDetail} />
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {values.amountButtons.map((buttonType) => (
                                            <ReceiptAmountActionButton key={buttonType} type={buttonType} />
                                        ))}
                                    </div>
                                </div>
                                {isDetail ? <div /> : null}
                            </div>

                            <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <div className="flex items-center justify-start gap-4 sm:justify-end">
                                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                                    {!isDetail ? (
                                        <TransactionSwitch
                                            checked={values.autoNumber}
                                            onChange={(nextChecked) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    autoNumber: nextChecked,
                                                }))
                                            }
                                        />
                                    ) : null}
                                </div>

                                {!isDetail && values.autoNumber ? (
                                    <SelectField
                                        value={values.numberingType}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                numberingType: event.target.value,
                                            }))
                                        }
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
                                        trailing={<span className="text-[18px] font-semibold text-[#1f2436]">×</span>}
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        inputClassName="text-[15px] text-[#1f2436]"
                                        trailingClassName="px-3"
                                    />
                                )}

                                <TransactionFieldLabel label={config.labels.entryDate} required className="sm:text-right" />
                                <div className="max-w-[236px]">
                                    <TransactionDateInput value={values.entryDate} className="max-w-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <SalesReceiptAdditionalInfoSection
                                    config={config}
                                    values={values}
                                    setValues={setValues}
                                    isDetail={isDetail}
                                />
                            ) : (
                                <SalesReceiptInvoicesSection
                                    config={config}
                                    values={values}
                                    setValues={setValues}
                                    isDetail={isDetail}
                                    onOpenInvoiceModal={setActiveInvoiceModal}
                                />
                            )}
                        </div>
                    </div>

                    <div className="px-3 pb-3">
                        <ReceiptSummaryFooter paymentAmount={values.paymentAmount} />
                    </div>
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={values.dockActions} />
                </div>
            </div>

            <SalesReceiptInvoiceModal
                open={Boolean(activeInvoiceModal)}
                modal={activeInvoiceModal}
                onClose={() => setActiveInvoiceModal(null)}
            />
        </div>
    );
}
