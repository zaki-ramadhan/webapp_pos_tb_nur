import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import SalesDocumentItemModal from '@/features/workspace/modules/shared/SalesDocumentItemModal';
import {
    buildSalesDocumentFormState,
    DocumentStamp,
    SalesDocumentAdditionalCostSection,
    SalesDocumentAdditionalInfoSection,
    SalesDocumentAdvancePaymentsSection,
    SalesDocumentFooter,
    SalesDocumentItemsSection,
    SalesDocumentSmartlinkSection,
    SalesDocumentSummarySection,
} from '@/features/workspace/modules/shared/SalesDocumentSections';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionRail,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    buildSectionProps,
    resolveInitialSectionId,
    resolveSectionComponent,
    SalesDocumentHeaderButtons,
} from '@/features/workspace/modules/sales-document/salesDocumentViewShared';

const sectionComponentMap = {
    'additional-info': SalesDocumentAdditionalInfoSection,
    'additional-costs': SalesDocumentAdditionalCostSection,
    'smartlink': SalesDocumentSmartlinkSection,
    'advance-payments': SalesDocumentAdvancePaymentsSection,
    'order-info': SalesDocumentSummarySection,
    details: SalesDocumentItemsSection,
};

export default function SalesDocumentFormView({ config, buildRecord, activeLevel2Tab }) {
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () => (activeRecordId ? buildRecord(config.table.rows.find((row) => row.id === activeRecordId)) : config.draft),
        [activeRecordId, buildRecord, config.draft, config.table.rows],
    );
    const [values, setValues] = useState(() => buildSalesDocumentFormState(sourceRecord));
    const isDetail = Boolean(activeRecordId);
    const [activeSectionId, setActiveSectionId] = useState(() => resolveInitialSectionId(config, isDetail));
    const activeSectionKey = resolveSectionComponent(activeSectionId);
    const ActiveSectionComponent = sectionComponentMap[activeSectionKey] ?? SalesDocumentItemsSection;

    useEffect(() => {
        setActiveSectionId(resolveInitialSectionId(config, isDetail));
        setValues(buildSalesDocumentFormState(sourceRecord));
        setItemModalOpen(false);
    }, [config, isDetail, sourceRecord]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <div className={`grid gap-x-8 gap-y-3 ${isDetail ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]'}`.trim()}>
                            <div className={`grid gap-y-3 ${isDetail ? 'sm:grid-cols-[170px_minmax(0,1fr)_180px]' : 'sm:grid-cols-[170px_minmax(0,1fr)]'} sm:items-center sm:gap-x-4`.trim()}>
                                <TransactionFieldLabel label={config.labels.customer} required />
                                <ChipLookupField
                                    values={values.customer}
                                    placeholder={config.customerPlaceholder ?? 'Cari/Pilih Pelanggan...'}
                                    onRemove={() => {}}
                                    searchLabel={config.customerSearchLabel ?? 'Cari pelanggan'}
                                />
                                {isDetail ? (
                                    <div className="max-w-[180px]">
                                        <TextInput value={values.currency} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />
                                    </div>
                                ) : null}

                                <TransactionFieldLabel label={config.labels.entryDate} required />
                                <TransactionDateInput value={values.entryDate} />

                                {values.exchangeRate ? (
                                    <>
                                        <TransactionFieldLabel label={config.labels.exchangeRate ?? 'Kurs'} />
                                        <div className="max-w-[520px]">
                                            {values.exchangeRateLabel ? (
                                                <div className="mb-1 text-[12px] leading-4 text-[#1f2436]">{values.exchangeRateLabel}</div>
                                            ) : null}
                                            <div className="flex flex-wrap gap-3">
                                                <TextInput
                                                    value={values.exchangeRate}
                                                    readOnly
                                                    prefix={values.exchangeRatePrefix ?? 'Rp'}
                                                    className="h-[34px] w-full max-w-[186px] rounded-[4px] border-[#cfd6e2]"
                                                    prefixClassName="min-w-[42px] justify-center border-r-[#d8dde7] bg-[#fbfcfe] px-2 text-[15px] text-[#9097aa]"
                                                    inputClassName="text-right text-[15px] text-[#1f2436]"
                                                />
                                                {(values.showSecondaryExchangeRateField ?? config.showSecondaryExchangeRateField ?? Boolean(values.secondaryExchangeRate)) ? (
                                                    <TextInput
                                                        value={values.secondaryExchangeRate ?? ''}
                                                        readOnly
                                                        prefix={values.secondaryExchangeRatePrefix ?? 'Pjk'}
                                                        className="h-[34px] w-full max-w-[186px] rounded-[4px] border-[#cfd6e2]"
                                                        prefixClassName="min-w-[42px] justify-center border-r-[#d8dde7] bg-[#fbfcfe] px-2 text-[15px] text-[#9097aa]"
                                                        inputClassName="text-right text-[15px] text-[#1f2436]"
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                        {isDetail ? <div /> : null}
                                    </>
                                ) : null}

                                {config.headerSelectLookupField ? (
                                    <>
                                        <TransactionFieldLabel
                                            label={config.headerSelectLookupField.label}
                                            required={config.headerSelectLookupField.required}
                                        />
                                        <div
                                            className={`grid gap-3 ${
                                                config.headerSelectLookupField.layoutClassName ?? 'md:grid-cols-[minmax(0,180px)_minmax(0,1fr)]'
                                            }`.trim()}
                                        >
                                            <SelectField
                                                value={values[config.headerSelectLookupField.selectValueKey] ?? ''}
                                                onChange={(event) =>
                                                    setValues((current) => ({
                                                        ...current,
                                                        [config.headerSelectLookupField.selectValueKey]: event.target.value,
                                                    }))
                                                }
                                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                                selectClassName="text-[15px] text-[#1f2436]"
                                            >
                                                {(config.headerSelectLookupField.options ?? []).map((option) => {
                                                    const optionValue = typeof option === 'string' ? option : option.value;
                                                    const optionLabel = typeof option === 'string' ? option : option.label;

                                                    return (
                                                        <option key={optionValue} value={optionValue}>
                                                            {optionLabel}
                                                        </option>
                                                    );
                                                })}
                                            </SelectField>

                                            <ChipLookupField
                                                values={values[config.headerSelectLookupField.valueKey] ?? []}
                                                placeholder={config.headerSelectLookupField.placeholder ?? 'Cari/Pilih...'}
                                                onRemove={() => {}}
                                                searchLabel={config.headerSelectLookupField.searchLabel ?? config.headerSelectLookupField.label}
                                            />
                                        </div>
                                        {isDetail ? <div /> : null}
                                    </>
                                ) : null}

                                {config.headerLookupField ? (
                                    <>
                                        <TransactionFieldLabel label={config.headerLookupField.label} />
                                        <ChipLookupField
                                            values={values[config.headerLookupField.valueKey] ?? []}
                                            placeholder={config.headerLookupField.placeholder ?? 'Cari/Pilih...'}
                                            onRemove={() => {}}
                                            searchLabel={config.headerLookupField.searchLabel ?? config.headerLookupField.label}
                                        />
                                        {isDetail ? <div /> : null}
                                    </>
                                ) : null}

                                {config.headerTextField ? (
                                    <>
                                        <TransactionFieldLabel
                                            label={config.headerTextField.label}
                                            required={config.headerTextField.required}
                                        />
                                        <TextInput
                                            value={values[config.headerTextField.valueKey] ?? ''}
                                            readOnly
                                            trailing={
                                                isDetail && config.headerTextField.clearableInDetail !== false ? (
                                                    <span className="text-[18px] font-semibold text-[#1f2436]">×</span>
                                                ) : null
                                            }
                                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                            inputClassName="text-[15px] text-[#1f2436]"
                                            trailingClassName="px-3"
                                        />
                                        {isDetail ? <div /> : null}
                                    </>
                                ) : null}
                            </div>

                            <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <div className="flex items-center justify-start gap-4 sm:justify-end">
                                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                                    {!isDetail ? (
                                        <TransactionSwitch checked={values.autoNumber} onChange={(nextValue) => setValues((current) => ({ ...current, autoNumber: nextValue }))} />
                                    ) : null}
                                </div>

                                {!isDetail && values.autoNumber ? (
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
                                        trailing={<span className="text-[18px] font-semibold text-[#1f2436]">×</span>}
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        inputClassName="text-[15px] text-[#1f2436]"
                                        trailingClassName="px-3"
                                    />
                                )}

                                <div />
                                <SalesDocumentHeaderButtons config={config} values={values} isDetail={isDetail} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="relative min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {isDetail && values.approvalStamp ? <DocumentStamp label={values.approvalStamp} tone="blue" className="right-[12%] top-[-6px]" /> : null}
                            {isDetail && values.processStamp ? (
                                <DocumentStamp
                                    label={values.processStamp}
                                    tone={values.processStampTone ?? 'green'}
                                    className={
                                        activeSectionId === 'additional-info'
                                            ? 'left-[49%] top-[34%]'
                                            : activeSectionId === 'advance-payments'
                                              ? 'left-[49%] top-[36%]'
                                              : 'left-[50%] top-[40%]'
                                    }
                                />
                            ) : null}

                            <ActiveSectionComponent
                                {...buildSectionProps(activeSectionId, config, values, isDetail, () => setItemModalOpen(true))}
                            />
                        </div>
                    </div>

                    {config.showFooter !== false ? (
                        <div className="px-3 pb-3">
                            <SalesDocumentFooter values={values} />
                        </div>
                    ) : null}
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={values.dockActions} />
                </div>
            </div>

            <SalesDocumentItemModal open={itemModalOpen} onClose={() => setItemModalOpen(false)} modal={values.itemModal} />
        </div>
    );
}
