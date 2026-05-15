import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import TableListView from '@/features/workspace/modules/TableListView';
import {
    buildAssetChangeConfig,
    buildAssetChangeRecord,
} from './assetChangeConfig';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    AccountLookupField,
    AccountLookupTextInput,
} from '@/features/workspace/shared/AccountLookupControls';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneRows(rows = []) {
    return rows.map((row) => ({ ...row }));
}

function buildFormValues(source = {}) {
    return {
        ...source,
        asset: cloneList(source.asset),
        branch: cloneList(source.branch),
        department: cloneList(source.department),
        assetAccount: cloneList(source.assetAccount),
        expenseRows: cloneRows(source.expenseRows),
    };
}

function AssetChangeFieldRow({ label, required = false, children, alignTop = false, labelClassName = '' }) {
    return (
        <div
            className={`grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-x-4 ${alignTop ? 'sm:items-start' : 'sm:items-center'}`.trim()}
        >
            <TransactionFieldLabel
                label={label}
                required={required}
                className={`${alignTop ? 'pt-2' : ''} ${labelClassName}`.trim()}
            />
            <div>{children}</div>
        </div>
    );
}

function AssetChangeLookupField({
    values,
    placeholder,
    searchLabel,
    onRemove = null,
    className = '',
}) {
    return (
        <ChipLookupField
            values={values}
            placeholder={placeholder}
            searchLabel={searchLabel}
            onRemove={onRemove}
            className={className}
            heightClassName="h-[40px]"
        />
    );
}

function InlineCheckboxField({ checked, label = 'Ya' }) {
    return (
        <CheckboxField
            checked={checked}
            onChange={() => {}}
            readOnly
            label={label}
            size="md"
            align="center"
            containerClassName="w-auto"
            className="gap-2 text-[15px]"
            labelClassName="text-[15px]"
        />
    );
}

function AssetChangeHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] xl:items-start">
                <div className="space-y-3">
                    <AssetChangeFieldRow label={config.labels.changeType}>
                        <SelectField
                            value={values.changeType}
                            disabled={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    changeType: event.target.value,
                                }))
                            }
                            containerClassName="w-full sm:max-w-[334px]"
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.changeTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </AssetChangeFieldRow>

                    <AssetChangeFieldRow label={config.labels.asset} required>
                        <AssetChangeLookupField
                            values={values.asset}
                            placeholder={config.assetPlaceholder}
                            searchLabel={config.assetSearchLabel}
                            onRemove={
                                isDetail
                                    ? null
                                    : (value) =>
                                          setValues((current) => ({
                                              ...current,
                                              asset: current.asset.filter((item) => item !== value),
                                          }))
                            }
                            className="max-w-[600px]"
                        />
                    </AssetChangeFieldRow>

                    <AssetChangeFieldRow label={config.labels.lastDepreciation}>
                        <TextInput
                            value={values.lastDepreciation}
                            readOnly
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[334px]"
                            inputClassName="text-[15px] text-[#6b7280]"
                        />
                    </AssetChangeFieldRow>
                </div>

                <div className="space-y-3 xl:justify-self-end xl:min-w-[420px]">
                    {isDetail ? (
                        <AssetChangeFieldRow label={config.labels.number} required labelClassName="sm:text-right">
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                trailing={<span className="text-[22px] font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </AssetChangeFieldRow>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start gap-4 sm:justify-end">
                                <TransactionFieldLabel label={config.labels.number} required />
                                <TransactionSwitch
                                    checked={values.autoNumber}
                                    onChange={(nextValue) =>
                                        setValues((current) => ({
                                            ...current,
                                            autoNumber: nextValue,
                                        }))
                                    }
                                />
                            </div>

                            {values.autoNumber ? (
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
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            documentNumber: event.target.value,
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />
                            )}
                        </div>
                    )}

                    <AssetChangeFieldRow label={config.labels.date} labelClassName="sm:text-right">
                        <TransactionDateInput
                            value={values.transactionDate}
                            onChange={(nextValue) =>
                                setValues((current) => ({
                                    ...current,
                                    transactionDate: nextValue,
                                }))
                            }
                            className="w-full sm:max-w-[230px]"
                        />
                    </AssetChangeFieldRow>

                    <AssetChangeFieldRow label={config.labels.bookValue} labelClassName="sm:text-right">
                        <TextInput
                            value={values.bookValue}
                            readOnly
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[230px]"
                            inputClassName="text-right text-[15px] text-[#6b7280]"
                        />
                    </AssetChangeFieldRow>
                </div>
            </div>
        </div>
    );
}

function AssetChangeGeneralSection({ config, values, setValues, isDetail }) {
    return (
        <div className="min-h-[560px]">
            <TransactionSectionHeading title="Informasi umum" icon="document" />

            <div className="mt-4 grid gap-5 lg:max-w-[980px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="space-y-4">
                    <AssetChangeFieldRow label={config.labels.depreciationMethod}>
                        <SelectField
                            value={values.depreciationMethod}
                            disabled={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    depreciationMethod: event.target.value,
                                }))
                            }
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.depreciationMethodOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </AssetChangeFieldRow>

                    <AssetChangeFieldRow label={config.labels.residualValue}>
                        <FormattedAmountInput
                            value={values.residualValue}
                            readOnly={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    residualValue: event.target.value,
                                }))
                            }
                            prefix="Rp"
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[406px]"
                            inputClassName="text-right text-[15px] text-[#1f2436]"
                            prefixClassName="min-w-[46px] justify-center px-0 text-[#7a8498]"
                        />
                    </AssetChangeFieldRow>
                </div>

                <div className="space-y-4">
                    <AssetChangeFieldRow label={config.labels.changeNotes} alignTop>
                        <TextareaField
                            value={values.changeNotes}
                            readOnly={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    changeNotes: event.target.value,
                                }))
                            }
                            rows={4}
                            className="rounded-[4px] border-[#cfd6e2]"
                            textareaClassName="min-h-[140px] text-[15px] text-[#1f2436]"
                        />
                    </AssetChangeFieldRow>
                </div>
            </div>
        </div>
    );
}

function AssetChangeExpenseSection({ config, values, setValues }) {
    return (
        <div className="min-h-[560px]">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 lg:flex-row lg:items-start lg:justify-between">
                <AccountLookupTextInput
                    value={values.expenseSearch}
                    placeholder={config.expenseSearchPlaceholder}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] lg:max-w-[560px]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    dialogTitle="Pilih Akun Pengeluaran"
                    searchLabel="Cari akun pengeluaran"
                    onSelectAccount={(_, label) =>
                        setValues((current) => ({
                            ...current,
                            expenseSearch: label,
                        }))
                    }
                />

                <div className="text-right text-[22px] font-normal text-[#1f2436]">
                    {config.labels.expenseTitle}
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                <TransactionDataTable
                    columns={config.expenseTable.columns}
                    rows={values.expenseRows}
                    emptyLabel={config.expenseTable.emptyLabel}
                    minWidthClassName={config.expenseTable.minWidthClassName}
                    renderCell={({ row, column }) => row[column.id] ?? ''}
                />
            </div>
        </div>
    );
}

function AssetChangeAdditionalInfoSection({ config, values, setValues, isDetail }) {
    return (
        <div className="min-h-[560px]">
            <TransactionSectionHeading title="Info Lainnya" icon="info" />

            <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.78fr)] xl:gap-x-10">
                <div className="space-y-4">
                    <AssetChangeFieldRow label={config.labels.intangibleAsset}>
                        <InlineCheckboxField checked={values.intangibleAsset} />
                    </AssetChangeFieldRow>

                    <AssetChangeFieldRow label={config.labels.branch} required>
                        <AssetChangeLookupField
                            values={values.branch}
                            placeholder={config.branchPlaceholder}
                            searchLabel={config.branchSearchLabel}
                            onRemove={
                                isDetail
                                    ? null
                                    : (value) =>
                                          setValues((current) => ({
                                              ...current,
                                              branch: current.branch.filter((item) => item !== value),
                                          }))
                            }
                            className="max-w-[580px]"
                        />
                    </AssetChangeFieldRow>

                    <AssetChangeFieldRow label={config.labels.department}>
                        <AssetChangeLookupField
                            values={values.department}
                            placeholder={config.departmentPlaceholder}
                            searchLabel={config.departmentSearchLabel}
                            onRemove={
                                isDetail
                                    ? null
                                    : (value) =>
                                          setValues((current) => ({
                                              ...current,
                                              department: current.department.filter((item) => item !== value),
                                          }))
                            }
                            className="max-w-[580px]"
                        />
                    </AssetChangeFieldRow>

                    <AssetChangeFieldRow label={config.labels.assetAccount}>
                        <AccountLookupField
                            values={values.assetAccount}
                            placeholder={config.assetAccountPlaceholder}
                            searchLabel={config.assetAccountSearchLabel}
                            dialogTitle="Pilih Akun Aset"
                            onRemove={
                                isDetail
                                    ? null
                                    : (value) =>
                                          setValues((current) => ({
                                              ...current,
                                              assetAccount: current.assetAccount.filter((item) => item !== value),
                                          }))
                            }
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    assetAccount: label ? [label] : [],
                                }))
                            }
                            className="max-w-[580px]"
                        />
                    </AssetChangeFieldRow>
                </div>

                <div className="space-y-4">
                    <AssetChangeFieldRow label={config.labels.tax}>
                        <InlineCheckboxField checked={values.taxEnabled} />
                    </AssetChangeFieldRow>
                </div>
            </div>
        </div>
    );
}

function AssetChangeFormView({ pageId, config, activeLevel2Tab }) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildAssetChangeRecord(
                      config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId },
                      config,
                  )
                : config.draft,
        [activeRecordId, config],
    );
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormValues(sourceRecord));
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'general');
        setValues(buildFormValues(sourceRecord));
    }, [config.sectionTabs, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            changeType: sourceRecord.changeType ?? '',
            asset: sourceRecord.asset ?? [],
            autoNumber: sourceRecord.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? '',
            transactionDate: sourceRecord.transactionDate ?? '',
            depreciationMethod: sourceRecord.depreciationMethod ?? '',
            residualValue: sourceRecord.residualValue ?? '',
            changeNotes: sourceRecord.changeNotes ?? '',
            branch: sourceRecord.branch ?? [],
            department: sourceRecord.department ?? [],
            assetAccount: sourceRecord.assetAccount ?? [],
            taxEnabled: sourceRecord.taxEnabled ?? false,
        }),
        [sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            changeType: values.changeType,
            asset: values.asset,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            transactionDate: values.transactionDate,
            depreciationMethod: values.depreciationMethod,
            residualValue: values.residualValue,
            changeNotes: values.changeNotes,
            branch: values.branch,
            department: values.department,
            assetAccount: values.assetAccount,
            taxEnabled: values.taxEnabled,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.asset, type: 'array', value: values.asset },
                    {
                        label: config.labels.number,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.asset,
            config.labels.number,
            currentComparable,
            initialComparable,
            values.asset,
            values.autoNumber,
            values.documentNumber,
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
            header={<AssetChangeHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            dockActions={dockActions}
        >
            {activeSectionId === 'expense' ? (
                <AssetChangeExpenseSection config={config} values={values} setValues={setValues} />
            ) : activeSectionId === 'additional-info' ? (
                <AssetChangeAdditionalInfoSection
                    config={config}
                    values={values}
                    setValues={setValues}
                    isDetail={isDetail}
                />
            ) : (
                <AssetChangeGeneralSection
                    config={config}
                    values={values}
                    setValues={setValues}
                    isDetail={isDetail}
                />
            )}
        </TransactionFormLayout>
    );
}

function AssetChangeTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onCreate,
            }}
            onRowClick={onOpenDetail ? (row) => onOpenDetail({ recordId: row.id, label: row.number ?? row.id }) : null}
        />
    );
}

export default function AssetChangeView({
    page,
    mode = 'table',
    activeLevel2Tab = null,
    onOpenContent,
    onOpenDetail,
}) {
    const config = useMemo(() => buildAssetChangeConfig(page.assetChange ?? {}), [page.assetChange]);

    if (mode === 'form') {
        return <AssetChangeFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />;
    }

    return <AssetChangeTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
}
