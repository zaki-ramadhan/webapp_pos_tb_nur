import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import {
    buildDepositFormState,
} from '@/features/workspace/modules/shared/DepositWorkspaceShared';
import {
    TransactionFieldLabel,
    TransactionFormLayout,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import {
    DepositAmountField,
    DepositFooter,
    DepositInfoSection,
    DepositSmartlinkSection,
    DepositStamp,
    DepositSummarySection,
    SalesDepositHeader,
} from './SalesDepositSections';

export default function SalesDepositFormView({ pageId, config, buildRecord, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'deposit');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () => (activeRecordId ? buildRecord(config.table.rows.find((row) => row.id === activeRecordId)) : config.draft),
        [activeRecordId, buildRecord, config.draft, config.table.rows],
    );
    const [values, setValues] = useState(() => buildDepositFormState(sourceRecord));
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'deposit');
        setValues(buildDepositFormState(sourceRecord));
    }, [config.sectionTabs, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            customer: sourceRecord.customer ?? config.draft?.customer ?? [],
            entryDate: sourceRecord.entryDate ?? config.draft?.entryDate ?? '',
            autoNumber: sourceRecord.autoNumber ?? config.draft?.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? config.draft?.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? config.draft?.documentNumber ?? '',
            depositAmount: sourceRecord.depositAmount ?? config.draft?.depositAmount ?? '',
            paymentTerms: sourceRecord.paymentTerms ?? config.draft?.paymentTerms ?? [],
            branches: sourceRecord.branches ?? config.draft?.branches ?? [],
            notes: sourceRecord.notes ?? config.draft?.notes ?? '',
        }),
        [config.draft, sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            customer: values.customer,
            entryDate: values.entryDate,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            depositAmount: values.depositAmount,
            paymentTerms: values.paymentTerms,
            branches: values.branches,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.customer, type: 'array', value: values.customer },
                    { label: config.labels.entryDate, value: values.entryDate },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.depositAmount, value: values.depositAmount },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.branch,
            config.labels.customer,
            config.labels.depositAmount,
            config.labels.documentNumber,
            config.labels.entryDate,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.customer,
            values.depositAmount,
            values.documentNumber,
            values.entryDate,
            values.numberingType,
        ],
    );

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? []).map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          disabled: saveDisabled,
                      }
                    : action,
            ),
        [saveDisabled, values.dockActions],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <TransactionFormLayout
            header={<SalesDepositHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            footer={<DepositFooter values={values} />}
            dockActions={dockActions}
        >
            <div className="relative">
                {isDetail && values.approvalStamp ? <DepositStamp label={values.approvalStamp} tone="blue" className="right-[12%] top-[-8px]" /> : null}
                {isDetail && values.statusStamp ? <DepositStamp label={values.statusStamp} tone={values.statusTone} className={activeSectionId === 'invoice-info' ? 'left-[49%] top-[37%]' : 'left-[49%] top-[33%]'} /> : null}

                {activeSectionId === 'additional-info' ? (
                    <DepositInfoSection config={config} values={values} isDetail={isDetail} />
                ) : activeSectionId === 'smartlink' ? (
                    <DepositSmartlinkSection config={config} />
                ) : activeSectionId === 'invoice-info' ? (
                    <DepositSummarySection config={config} values={values} />
                ) : (
                    <section>
                        <TransactionSectionHeading title={config.depositTitle} icon="payment" />

                        <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.depositAmount} required />
                            <DepositAmountField value={values.depositAmount} />

                            <TransactionFieldLabel label={config.labels.purchaseOrderNumber} />
                            <TextInput value={values.purchaseOrderNumber} readOnly className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />

                            <TransactionFieldLabel label={config.labels.tax} />
                            <div className="flex flex-wrap gap-8 text-[17px] text-[#1f2436]">
                                <label className="inline-flex items-center gap-3">
                                    <input type="checkbox" checked={values.taxEnabled} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                                    <span>Kena Pajak</span>
                                </label>
                                <label className="inline-flex items-center gap-3">
                                    <input type="checkbox" checked={values.taxIncluded} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                                    <span>Total termasuk Pajak</span>
                                </label>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </TransactionFormLayout>
    );
}
