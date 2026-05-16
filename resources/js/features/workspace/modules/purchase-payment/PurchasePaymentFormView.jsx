import { useEffect, useMemo, useState } from 'react';

import PurchasePaymentInvoiceModal from '@/features/workspace/modules/shared/PurchasePaymentInvoiceModal';
import {
    TransactionDualTotalCard,
    TransactionFormLayout,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { buildPurchasePaymentRecord } from './purchasePaymentConfig';
import {
    PurchasePaymentAdditionalInfoSection,
    PurchasePaymentDetailsSection,
    PurchasePaymentHeader,
    PurchasePaymentInfoSection,
} from './PurchasePaymentSections';
import { buildFormState } from './purchasePaymentShared';

export default function PurchasePaymentFormView({ pageId, config, activeLevel2Tab }) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        return buildPurchasePaymentRecord(config.rowMap?.[activeRecordId] ?? { id: activeRecordId }, config);
    }, [activeRecordId, config]);
    const isDetail = Boolean(activeRecordId);
    const sectionTabs = isDetail ? config.detailSectionTabs : config.sectionTabs;
    const [activeSectionId, setActiveSectionId] = useState(sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));
    const [activeInvoice, setActiveInvoice] = useState(null);

    useEffect(() => {
        setActiveSectionId((isDetail ? config.detailSectionTabs : config.sectionTabs)?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
        setActiveInvoice(null);
    }, [config, isDetail, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            payee: sourceRecord.payee ?? config.draft?.payee ?? [],
            bankAccounts: sourceRecord.bankAccounts ?? config.draft?.bankAccounts ?? [],
            entryDate: sourceRecord.entryDate ?? config.draft?.entryDate ?? '',
            autoNumber: sourceRecord.autoNumber ?? config.draft?.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? config.draft?.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? config.draft?.documentNumber ?? '',
            invoices: sourceRecord.invoices ?? config.draft?.invoices ?? [],
            branches: sourceRecord.branches ?? config.draft?.branches ?? [],
            notes: sourceRecord.notes ?? config.draft?.notes ?? '',
        }),
        [config.draft, sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            payee: values.payee,
            bankAccounts: values.bankAccounts,
            entryDate: values.entryDate,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            invoices: values.invoices,
            branches: values.branches,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.payee, type: 'array', value: values.payee },
                    { label: config.labels.bank, type: 'array', value: values.bankAccounts },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.entryDate, value: values.entryDate },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.bank,
            config.labels.branch,
            config.labels.documentNumber,
            config.labels.entryDate,
            config.labels.payee,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.bankAccounts,
            values.branches,
            values.documentNumber,
            values.entryDate,
            values.numberingType,
            values.payee,
        ],
    );

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? config.draft?.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
                .map((action) =>
                    action.id === 'save' && !isDetail
                        ? { ...action, tone: 'primary', disabled: saveDisabled }
                        : action,
                ),
        [config.draft?.dockActions, isDetail, saveDisabled, values.dockActions],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <>
            <TransactionFormLayout
                header={<PurchasePaymentHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
                sectionTabs={sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={
                    <TransactionDualTotalCard
                        items={[
                            { label: 'Nilai Pembayaran', value: values.footerPaymentValue },
                            { label: 'Faktur Dibayar', value: values.footerInvoiceValue },
                        ]}
                    />
                }
                dockActions={dockActions}
            >
                {activeSectionId === 'additional-info' ? (
                    <PurchasePaymentAdditionalInfoSection config={config} values={values} isDetail={isDetail} />
                ) : activeSectionId === 'payment-info' ? (
                    <PurchasePaymentInfoSection config={config} values={values} />
                ) : (
                    <PurchasePaymentDetailsSection
                        config={config}
                        values={values}
                        isDetail={isDetail}
                        onOpenInvoice={setActiveInvoice}
                    />
                )}
            </TransactionFormLayout>

            <PurchasePaymentInvoiceModal
                open={Boolean(activeInvoice)}
                onClose={() => setActiveInvoice(null)}
                modal={values.modal}
                invoice={activeInvoice}
            />
        </>
    );
}
