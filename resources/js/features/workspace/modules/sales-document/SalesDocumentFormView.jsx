import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    createBackendResource,
    deleteBackendResource,
    extractBackendRows,
    getBackendErrorMessage,
    listBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import {
    buildGeneratedDocumentNumber,
    buildOperationDocumentPayload,
    parseNumericInput,
} from '@/features/workspace/backend/operationDocumentBackend';
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
import {
    buildSectionProps,
    resolveInitialSectionId,
    resolveSectionComponent,
    SalesDocumentHeaderButtons,
} from '@/features/workspace/modules/sales-document/salesDocumentViewShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';

const sectionComponentMap = {
    'additional-info': SalesDocumentAdditionalInfoSection,
    'additional-costs': SalesDocumentAdditionalCostSection,
    smartlink: SalesDocumentSmartlinkSection,
    'advance-payments': SalesDocumentAdvancePaymentsSection,
    'order-info': SalesDocumentSummarySection,
    details: SalesDocumentItemsSection,
};

function formatCurrencyValue(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '0';
    }

    return numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function formatCurrencyLabel(value) {
    return `Rp ${formatCurrencyValue(value)}`;
}

function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? '').trim();
    const name = String(record?.name ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

function applyComputedTotals(currentValues, nextItems) {
    const subtotalAmount = nextItems.reduce((sum, item) => sum + parseNumericInput(item.total), 0);
    const discountAmount = nextItems.reduce((sum, item) => sum + parseNumericInput(item.discountValue ?? item.discount), 0);
    const taxAmount = currentValues.taxEnabled ? Math.max(0, (subtotalAmount - discountAmount) * 0.1) : 0;
    const totalAmount = Math.max(0, subtotalAmount - discountAmount + taxAmount);
    const nextSummary = Array.isArray(currentValues.summary)
        ? currentValues.summary.map(([label, value], index) => {
              if (index === 0 || String(label).toLowerCase() === 'total') {
                  return [label, formatCurrencyLabel(totalAmount)];
              }

              return [label, value];
          })
        : currentValues.summary;

    return {
        ...currentValues,
        items: nextItems,
        itemCountLabel: nextItems.length ? `${nextItems.length} ${currentValues.pageId ? 'Barang' : 'Rincian Barang'}` : 'Rincian Barang',
        subtotal: formatCurrencyLabel(subtotalAmount),
        discountValue: formatCurrencyValue(discountAmount),
        taxLabel: currentValues.taxEnabled ? currentValues.taxLabel || 'Pajak' : '',
        taxValue: currentValues.taxEnabled ? formatCurrencyLabel(taxAmount) : '',
        total: formatCurrencyLabel(totalAmount),
        summary: nextSummary,
    };
}

function buildDocumentComparableSnapshot(values) {
    return {
        customer: values.customer,
        partnerId: values.__partnerId,
        entryDate: values.entryDate,
        documentNumber: values.documentNumber,
        autoNumber: values.autoNumber,
        numberingType: values.numberingType,
        paymentTerms: values.paymentTerms,
        paymentTermId: values.__paymentTermId,
        shippingDate: values.shippingDate,
        poNumber: values.poNumber,
        address: values.address,
        branches: values.branches,
        branchId: values.__branchId,
        notes: values.notes,
        shippingMethod: values.shippingMethod,
        shippingMethodId: values.__shippingMethodId,
        fob: values.fob,
        fobId: values.__fobId,
        taxEnabled: values.taxEnabled,
        taxIncluded: values.taxIncluded,
        items: (values.items ?? []).map((item) => ({
            name: item.name,
            code: item.code,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            discountValue: item.discountValue ?? item.discount,
            total: item.total,
        })),
    };
}

function validateSalesDocumentValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.customer, value: values.__partnerId, type: 'lookup' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber ? [{ label: 'Tipe penomoran', value: values.numberingType }] : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.branch, value: values.__branchId, type: 'lookup' },
        { label: 'Rincian barang', value: values.items, type: 'array' },
        ...(config.headerTextField?.required ? [{ label: config.headerTextField.label, value: values[config.headerTextField.valueKey] }] : []),
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    const invalidItem = (values.items ?? []).find(
        (item) =>
            !String(item?.name ?? '').trim()
            || Number.parseFloat(String(item?.quantity ?? '0').replace(',', '.')) <= 0
            || !String(item?.unit ?? '').trim(),
    );

    if (invalidItem) {
        return 'Setiap item wajib memiliki nama, kuantitas lebih dari 0, dan satuan.';
    }

    return '';
}

function StatusMessage({ status }) {
    if (!status?.message) {
        return null;
    }

    const toneClassName =
        status.tone === 'error'
            ? 'border-[#f0c4c4] bg-[#fff6f6] text-[#a33939]'
            : 'border-[#c8dfc9] bg-[#f3fff4] text-[#2e6b34]';

    return (
        <div className={`mx-3 mt-3 rounded-[6px] border px-3 py-2 text-[14px] ${toneClassName}`.trim()}>
            {status.message}
        </div>
    );
}

async function promptSelectBackendRecord(resource, title, labelBuilder) {
    const keyword = window.prompt(`Cari ${title}`);

    if (keyword === null) {
        return null;
    }

    const payload = await listBackendResource(resource, {
        search: keyword.trim(),
        per_page: 10,
    });
    const records = extractBackendRows(payload);

    if (!records.length) {
        throw new Error(`${title} tidak ditemukan.`);
    }

    const optionText = records
        .map((record, index) => `${index + 1}. ${labelBuilder(record)}`)
        .join('\n');
    const pickedValue = window.prompt(`Pilih ${title}:\n${optionText}\nKetik nomor pilihan.`);

    if (pickedValue === null) {
        return null;
    }

    const pickedIndex = Number.parseInt(pickedValue, 10) - 1;

    if (!Number.isInteger(pickedIndex) || !records[pickedIndex]) {
        throw new Error(`Pilihan ${title} tidak valid.`);
    }

    return records[pickedIndex];
}

function promptItemEditor(item = null) {
    const name = window.prompt('Nama barang', item?.name ?? '');

    if (name === null) {
        return null;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new Error('Nama barang wajib diisi.');
    }

    const code = window.prompt('Kode barang', item?.code ?? '') ?? '';
    const quantity = window.prompt('Kuantitas', item?.quantity ?? '1');

    if (quantity === null) {
        return null;
    }

    const unit = window.prompt('Satuan', item?.unit ?? 'PCS');

    if (unit === null) {
        return null;
    }

    const price = window.prompt('Harga satuan', item?.price ?? '0');

    if (price === null) {
        return null;
    }

    const discountValue = window.prompt('Diskon nominal', item?.discountValue ?? item?.discount ?? '0');

    if (discountValue === null) {
        return null;
    }

    const quantityAmount = parseNumericInput(quantity);
    const unitPriceAmount = parseNumericInput(price);
    const discountAmount = parseNumericInput(discountValue);
    const totalAmount = Math.max(0, quantityAmount * unitPriceAmount - discountAmount);

    return {
        id: item?.id ?? `draft-item-${Date.now()}`,
        __lineId: item?.__lineId ?? null,
        name: trimmedName,
        code: code.trim(),
        quantity: String(quantityAmount || 0),
        unit: unit.trim() || 'PCS',
        price: formatCurrencyValue(unitPriceAmount),
        discount: formatCurrencyValue(discountAmount),
        discountValue: formatCurrencyValue(discountAmount),
        total: formatCurrencyValue(totalAmount),
    };
}

export default function SalesDocumentFormView({
    pageId,
    config,
    buildRecord,
    activeLevel2Tab,
    backendConfig,
    onOpenContent,
    onOpenDetail,
    onRefresh,
}) {
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
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
    const initialSnapshot = useMemo(
        () => buildDocumentComparableSnapshot(buildSalesDocumentFormState(sourceRecord)),
        [sourceRecord],
    );

    useEffect(() => {
        setActiveSectionId(resolveInitialSectionId(config, isDetail));
        setValues(buildSalesDocumentFormState(sourceRecord));
        setItemModalOpen(false);
        setStatus({ tone: '', message: '' });
    }, [config, isDetail, sourceRecord]);

    const validationMessage = useMemo(() => validateSalesDocumentValues(values, config), [config, values]);
    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildDocumentComparableSnapshot(values), initialSnapshot),
        [initialSnapshot, values],
    );
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    async function selectLookup(resource, title, labelBuilder, onApply) {
        try {
            const record = await promptSelectBackendRecord(resource, title, labelBuilder);

            if (!record) {
                return;
            }

            onApply(record);
            setStatus({ tone: '', message: '' });
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error, error.message) });
        }
    }

    function updateItems(updater) {
        setValues((current) => {
            const nextItems = typeof updater === 'function' ? updater(current.items ?? []) : updater;
            return applyComputedTotals(current, nextItems);
        });
    }

    function handleCreateItem() {
        try {
            const nextItem = promptItemEditor();

            if (!nextItem) {
                return;
            }

            updateItems((items) => [...items, nextItem]);
            setStatus({ tone: 'success', message: 'Item ditambahkan ke dokumen.' });
        } catch (error) {
            setStatus({ tone: 'error', message: error.message });
        }
    }

    function handleEditItem(item) {
        try {
            const nextItem = promptItemEditor(item);

            if (!nextItem) {
                return;
            }

            updateItems((items) => items.map((entry) => (entry.id === item.id ? nextItem : entry)));
            setStatus({ tone: 'success', message: 'Item diperbarui.' });
        } catch (error) {
            setStatus({ tone: 'error', message: error.message });
        }
    }

    async function handleSave() {
        if (!backendConfig) {
            setStatus({ tone: 'error', message: 'Konfigurasi backend dokumen belum tersedia.' });
            return;
        }

        if (validationMessage) {
            setStatus({ tone: 'error', message: validationMessage });
            return;
        }

        setSaving(true);
        setStatus({ tone: '', message: '' });

        try {
            const resolvedDocumentNumber =
                values.autoNumber || !String(values.documentNumber ?? '').trim()
                    ? buildGeneratedDocumentNumber(pageId)
                    : values.documentNumber;
            const payload = buildOperationDocumentPayload(
                {
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                },
                pageId,
                backendConfig,
            );
            const response =
                isDetail && values.__backendRecordId
                    ? await updateBackendResource(backendConfig.resource, values.__backendRecordId, payload)
                    : await createBackendResource(backendConfig.resource, payload);
            const record = response?.data ?? null;

            await onRefresh?.();
            setStatus({
                tone: 'success',
                message: isDetail ? 'Dokumen berhasil diperbarui.' : 'Dokumen berhasil dibuat.',
            });

            if (!isDetail && record?.id && onOpenDetail) {
                onOpenDetail({
                    recordId: String(record.id),
                    label: record.document_number ?? resolvedDocumentNumber,
                    tabLabel: record.document_number ?? resolvedDocumentNumber,
                });
            }
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error) });
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!backendConfig || !values.__backendRecordId) {
            return;
        }

        if (!window.confirm('Hapus dokumen ini?')) {
            return;
        }

        setSaving(true);
        setStatus({ tone: '', message: '' });

        try {
            await deleteBackendResource(backendConfig.resource, values.__backendRecordId);
            await onRefresh?.();
            setStatus({ tone: 'success', message: 'Dokumen berhasil dihapus.' });
            onOpenContent?.();
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error) });
        } finally {
            setSaving(false);
        }
    }

    const handlers = useMemo(
        () => ({
            openItemModal: () => setItemModalOpen(true),
            onCreateItem: handleCreateItem,
            onEditItem: handleEditItem,
            onSelectPaymentTerm: () =>
                selectLookup('payment-terms', 'syarat pembayaran', (record) => buildLookupLabel(record), (record) =>
                    setValues((current) => ({
                        ...current,
                        __paymentTermId: record.id,
                        paymentTerms: [buildLookupLabel(record)],
                    })),
                ),
            onSelectBranch: () =>
                selectLookup('branches', 'cabang', (record) => buildLookupLabel(record), (record) =>
                    setValues((current) => ({
                        ...current,
                        __branchId: record.id,
                        branches: [buildLookupLabel(record)],
                    })),
                ),
            onSelectShippingMethod: () =>
                selectLookup('shipping-methods', 'metode pengiriman', (record) => buildLookupLabel(record), (record) =>
                    setValues((current) => ({
                        ...current,
                        __shippingMethodId: record.id,
                        shippingMethod: [buildLookupLabel(record)],
                    })),
                ),
            onSelectFob: () =>
                selectLookup('fob-terms', 'FOB', (record) => buildLookupLabel(record), (record) =>
                    setValues((current) => ({
                        ...current,
                        __fobId: record.id,
                        fob: [buildLookupLabel(record)],
                    })),
                ),
        }),
        [selectLookup],
    );

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? []).map((action) => {
                if (action.id === 'save') {
                    return {
                        ...action,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: handleSave,
                        disabled: action.disabled || saveDisabled,
                    };
                }

                if (action.id === 'delete') {
                    return {
                        ...action,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: handleDelete,
                    };
                }

                return action;
            }),
        [handleDelete, handleSave, saveDisabled, saving, values.dockActions],
    );

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
                                    onRemove={() =>
                                        setValues((current) => ({
                                            ...current,
                                            customer: [],
                                            __partnerId: null,
                                        }))
                                    }
                                    onSearch={() =>
                                        selectLookup(
                                            backendConfig?.partnerResource ?? 'customers',
                                            String(config.labels.customer).toLowerCase(),
                                            (record) => buildLookupLabel(record),
                                            (record) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    __partnerId: record.id,
                                                    customer: [buildLookupLabel(record)],
                                                    address:
                                                        record.shipping_address
                                                        ?? record.billing_address
                                                        ?? current.address,
                                                })),
                                        )
                                    }
                                    searchLabel={config.customerSearchLabel ?? 'Cari pelanggan'}
                                />
                                {isDetail ? (
                                    <div className="max-w-[180px]">
                                        <TextInput value={values.currency} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />
                                    </div>
                                ) : null}

                                <TransactionFieldLabel label={config.labels.entryDate} required />
                                <TransactionDateInput
                                    value={values.entryDate}
                                    onChange={(nextDisplayValue) =>
                                        setValues((current) => ({
                                            ...current,
                                            entryDate: nextDisplayValue,
                                        }))
                                    }
                                />

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

                                {config.headerLookupField ? (
                                    <>
                                        <TransactionFieldLabel label={config.headerLookupField.label} />
                                        <ChipLookupField
                                            values={values[config.headerLookupField.valueKey] ?? []}
                                            placeholder={config.headerLookupField.placeholder ?? 'Cari/Pilih...'}
                                            onRemove={(value) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    [config.headerLookupField.valueKey]: current[config.headerLookupField.valueKey].filter((item) => item !== value),
                                                }))
                                            }
                                            onSearch={handlers.onSelectShippingMethod}
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
                                            onChange={(event) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    [config.headerTextField.valueKey]: event.target.value,
                                                }))
                                            }
                                            trailing={
                                                values[config.headerTextField.valueKey] ? (
                                                    <button
                                                        type="button"
                                                        className="text-[18px] font-semibold text-[#1f2436]"
                                                        onClick={() =>
                                                            setValues((current) => ({
                                                                ...current,
                                                                [config.headerTextField.valueKey]: '',
                                                            }))
                                                        }
                                                    >
                                                        ×
                                                    </button>
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
                                        onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value, autoNumber: false }))}
                                        readOnly={isDetail}
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

                    <StatusMessage status={status} />

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
                                {...buildSectionProps(activeSectionId, config, values, setValues, isDetail, handlers)}
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
                    <TransactionDock actions={dockActions} />
                </div>
            </div>

            <SalesDocumentItemModal open={itemModalOpen} onClose={() => setItemModalOpen(false)} modal={values.itemModal} />
        </div>
    );
}
