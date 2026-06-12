import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import SectionTab from '@/features/workspace/shared/SectionTab';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import TableListView from '@/features/workspace/modules/TableListView';
import { TransactionToolbarIconButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    buildAssetTaxCategoryConfig,
    calculateAssetTaxCategoryRate,
} from './assetTaxCategoryConfig';
import { CloseIcon, PrintIcon, SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';

function buildFormValues(config, detailRow = null) {
    const detailRecord = detailRow ? config.detailRecords?.[detailRow.id] : null;
    const source = {
        ...config.draft,
        ...(detailRecord ?? {}),
    };

    return {
        name: source.name ?? '',
        depreciationMethod: source.depreciationMethod ?? config.depreciationMethodOptions[0] ?? '',
        estimatedLifeYears: source.estimatedLifeYears ?? '',
    };
}

function renderDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

function TaxCategoryFieldRow({ label, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-center">
            <label className="text-xs sm:text-sm text-[#1f2436]">{label}</label>
            <div>{children}</div>
        </div>
    );
}

function TaxCategoryFormView({ page, activeLevel2Tab }) {
    const config = useMemo(
        () => buildAssetTaxCategoryConfig(page.assetTaxCategory ?? {}),
        [page.assetTaxCategory],
    );
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => row.id === recordId) ?? null;
    }, [activeLevel2Tab, config.table.rows]);
    const isDetail = Boolean(detailRow);
    const [values, setValues] = useState(() => buildFormValues(config, detailRow));

    useEffect(() => {
        setValues(buildFormValues(config, detailRow));
    }, [config, detailRow]);

    const rateValue = calculateAssetTaxCategoryRate(values.depreciationMethod, values.estimatedLifeYears);
    const dockActions = isDetail ? config.detailDockActions : config.createDockActions;

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
            <div className="shrink-0 px-1 pt-0.5">
                <SectionTab label={config.sectionLabel} tone="accent" className="h-[34px]" />
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-4 rounded-[4px] border border-[#cfd6e2] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-stretch xl:px-4 xl:py-4 overflow-hidden">
                <div className="order-2 min-w-0 flex-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col lg:order-1">
                    <div className="grid max-w-[920px] gap-4">
                        <TaxCategoryFieldRow label={config.labels.name}>
                            <TextInput
                                value={values.name}
                                onChange={(event) => handleChange('name', event.target.value)}
                                className="h-[40px] max-w-[570px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                trailing={
                                    values.name ? (
                                        <button
                                            type="button"
                                            onClick={() => handleChange('name', '')}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#111827] transition hover:bg-[#eef2f7]"
                                            aria-label="Kosongkan nama"
                                        >
                                            <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                                        </button>
                                    ) : null
                                }
                                trailingClassName={values.name ? 'pr-2' : ''}
                            />
                        </TaxCategoryFieldRow>

                        <TaxCategoryFieldRow label={config.labels.depreciationMethod}>
                            <SelectField
                                value={values.depreciationMethod}
                                onChange={(event) => handleChange('depreciationMethod', event.target.value)}
                                containerClassName="max-w-[570px]"
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-xs sm:text-sm text-[#1f2436]"
                            >
                                {config.depreciationMethodOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        </TaxCategoryFieldRow>

                        <TaxCategoryFieldRow label={config.labels.estimatedLife}>
                            <div className="flex flex-wrap items-center gap-3">
                                <TextInput
                                    value={values.estimatedLifeYears}
                                    onChange={(event) => handleChange('estimatedLifeYears', event.target.value.replace(/[^\d.,]/g, ''))}
                                    className="h-[40px] w-full max-w-[114px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                                />
                                <span className="text-xs sm:text-sm text-[#1f2436]">{config.labels.yearsSuffix}</span>
                            </div>
                        </TaxCategoryFieldRow>

                        <TaxCategoryFieldRow label={config.labels.depreciationRate}>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="min-w-[114px] text-right text-xs sm:text-sm text-[#1f2436]">{rateValue}</div>
                                <span className="text-xs sm:text-sm text-[#1f2436]">{config.labels.percentSuffix}</span>
                            </div>
                        </TaxCategoryFieldRow>
                    </div>
                </div>

                <div className="order-1 flex shrink-0 flex-row justify-end gap-3 lg:order-2 lg:flex-col lg:self-start">
                    {dockActions.map((action) => (
                        <DockActionButton
                            key={action.id}
                            label={action.label}
                            tone={action.tone}
                            icon={renderDockIcon(action.icon)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function TaxCategoryTableView({ page, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => buildAssetTaxCategoryConfig(page.assetTaxCategory ?? {}),
        [page.assetTaxCategory],
    );

    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onOpenContent,
            }}
            rightControls={
                <TransactionToolbarIconButton label="Cetak">
                    <PrintIcon className="h-4.5 w-4.5" />
                </TransactionToolbarIconButton>
            }
            onRowClick={onOpenDetail ? (row) => onOpenDetail({ recordId: row.id, label: row.name }) : null}
        />
    );
}

export default function AssetTaxCategoryView({
    page,
    mode = 'table',
    activeLevel2Tab = null,
    onOpenContent,
    onOpenDetail,
}) {
    if (mode === 'form') {
        return <TaxCategoryFormView page={page} activeLevel2Tab={activeLevel2Tab} />;
    }

    return <TaxCategoryTableView page={page} onOpenContent={onOpenContent} onOpenDetail={onOpenDetail} />;
}
