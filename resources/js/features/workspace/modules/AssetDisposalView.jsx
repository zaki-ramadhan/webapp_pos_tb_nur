import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import TableListView from '@/features/workspace/modules/TableListView';
import {
    buildAssetDisposalConfig,
    buildAssetDisposalRecord,
} from '@/features/workspace/modules/assetDisposalConfig';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSectionRail,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';

function SectionCard({ children, className = '' }) {
    return (
        <div className={`rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-4 ${className}`.trim()}>
            {children}
        </div>
    );
}

function DisposalFieldRow({ label, required = false, children, alignTop = false }) {
    return (
        <div className={`grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-x-4 ${alignTop ? 'sm:items-start' : 'sm:items-center'}`.trim()}>
            <TransactionFieldLabel label={label} required={required} className={alignTop ? 'pt-2' : ''} />
            <div>{children}</div>
        </div>
    );
}

function buildFormValues(config, detailRow = null) {
    return buildAssetDisposalRecord(detailRow ?? {}, config);
}

function AssetDisposalHeader({ config, values, setValues, isDetail }) {
    return (
        <SectionCard>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,480px)] xl:items-start">
                <div className="grid gap-4 sm:max-w-[760px]">
                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.asset} required />
                        <ChipLookupField
                            values={values.asset}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari aset"
                            onRemove={isDetail ? null : (item) =>
                                setValues((current) => ({
                                    ...current,
                                    asset: current.asset.filter((value) => value !== item),
                                }))
                            }
                            className="max-w-[600px]"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <TransactionFieldLabel label={config.labels.lastDepreciation} />
                            <TextInput
                                value={values.lastDepreciation}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <TransactionFieldLabel label={config.labels.bookValue} />
                            <TextInput
                                value={values.bookValue}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-right text-[15px] text-[#1f2436]"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:justify-self-end xl:min-w-[420px]">
                    <div className="flex flex-wrap items-center justify-start gap-3 xl:justify-end">
                        <TransactionFieldLabel label={config.labels.number} required />
                        {!isDetail ? (
                            <TransactionSwitch
                                checked={values.autoNumber}
                                onChange={(nextValue) =>
                                    setValues((current) => ({
                                        ...current,
                                        autoNumber: nextValue,
                                    }))
                                }
                            />
                        ) : null}

                        {values.autoNumber && !isDetail ? (
                            <SelectField
                                value={values.numberingType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        numberingType: event.target.value,
                                    }))
                                }
                                containerClassName="w-full xl:w-[400px]"
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
                                value={values.numberingType}
                                readOnly
                                className="h-[40px] w-full rounded-[4px] border-[#cfd6e2] xl:w-[400px]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        )}
                    </div>

                    <div className="grid gap-2 xl:justify-items-end">
                        <TransactionFieldLabel label={config.labels.date} required />
                        <TransactionDateInput value={values.transactionDate} className="w-full xl:max-w-[230px]" />
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

function AssetDisposalGeneralSection({ config, values, setValues }) {
    return (
        <div className="space-y-4">
            <TransactionSectionHeading title="Informasi umum" icon="document" />

            <div className="grid gap-6 pt-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)]">
                <div className="space-y-4">
                    <DisposalFieldRow label={config.labels.quantity} required>
                        <TextInput
                            value={values.quantity}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    quantity: event.target.value.replace(/[^\d.,]/g, ''),
                                }))
                            }
                            className="h-[40px] max-w-[180px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-right text-[15px] text-[#1f2436]"
                        />
                    </DisposalFieldRow>

                    <DisposalFieldRow label={config.labels.profitLossAccount} required>
                        <AccountLookupField
                            values={values.profitLossAccount}
                            placeholder="Cari/Pilih Akun Perkiraan..."
                            searchLabel="Cari akun laba rugi"
                            dialogTitle="Pilih Akun Laba Rugi"
                            onRemove={(item) =>
                                setValues((current) => ({
                                    ...current,
                                    profitLossAccount: current.profitLossAccount.filter((value) => value !== item),
                                }))
                            }
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    profitLossAccount: label ? [label] : [],
                                }))
                            }
                            className="max-w-[580px]"
                        />
                    </DisposalFieldRow>

                    <DisposalFieldRow label={config.labels.assetLocation}>
                        <ChipLookupField
                            values={values.assetLocation}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari lokasi aset"
                            onRemove={(item) =>
                                setValues((current) => ({
                                    ...current,
                                    assetLocation: current.assetLocation.filter((value) => value !== item),
                                }))
                            }
                            className="max-w-[580px]"
                        />
                    </DisposalFieldRow>

                    <DisposalFieldRow label={config.labels.notes} alignTop>
                        <TextareaField
                            value={values.notes}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    notes: event.target.value,
                                }))
                            }
                            rows={3}
                            className="max-w-[580px] rounded-[4px] border-[#cfd6e2]"
                            textareaClassName="text-[15px] text-[#1f2436]"
                        />
                    </DisposalFieldRow>
                </div>

                <div className="space-y-4">
                    <DisposalFieldRow label={config.labels.soldAsset}>
                        <CheckboxField
                            checked={values.soldAsset}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    soldAsset: event.target.checked,
                                }))
                            }
                            label="Ya"
                            align="center"
                            containerClassName="w-auto"
                            labelClassName="text-[16px] md:text-[17px]"
                            inputClassName="mt-0 h-[18px] w-[18px]"
                        />
                    </DisposalFieldRow>
                </div>
            </div>
        </div>
    );
}

function AssetDisposalFormView({ page, activeLevel2Tab }) {
    const config = useMemo(
        () => buildAssetDisposalConfig(page.assetDisposal ?? {}),
        [page.assetDisposal],
    );
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => row.id === recordId) ?? null;
    }, [activeLevel2Tab, config.table.rows]);
    const isDetail = Boolean(detailRow);
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormValues(config, detailRow));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs[0]?.id ?? 'general');
        setValues(buildFormValues(config, detailRow));
    }, [config, detailRow]);

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="space-y-4">
                <AssetDisposalHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />

                <div className="flex flex-col gap-4 xl:flex-row">
                    <TransactionSectionRail
                        tabs={config.sectionTabs}
                        activeTabId={activeSectionId}
                        onSelectTab={setActiveSectionId}
                    />

                    <SectionCard className="min-h-[642px] flex-1">
                        <AssetDisposalGeneralSection config={config} values={values} setValues={setValues} />
                    </SectionCard>
                </div>
            </div>

            <TransactionDock actions={values.dockActions} />
        </div>
    );
}

function AssetDisposalTableView({ page, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => buildAssetDisposalConfig(page.assetDisposal ?? {}),
        [page.assetDisposal],
    );

    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onOpenContent,
            }}
            onRowClick={onOpenDetail ? (row) => onOpenDetail({ recordId: row.id, label: row.number ?? row.id }) : null}
        />
    );
}

export default function AssetDisposalView({
    page,
    mode = 'table',
    activeLevel2Tab = null,
    onOpenContent,
    onOpenDetail,
}) {
    if (mode === 'form') {
        return <AssetDisposalFormView page={page} activeLevel2Tab={activeLevel2Tab} />;
    }

    return <AssetDisposalTableView page={page} onOpenContent={onOpenContent} onOpenDetail={onOpenDetail} />;
}
