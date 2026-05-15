import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { SIMPLE_MASTER_BACKEND_CONFIG } from '@/features/workspace/backend/workspaceBackendAdapters';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import {
    finishCrudLoadingToast,
    showCrudErrorToast,
    showCrudLoadingToast,
    showCrudSuccessToast,
    showCrudValidationToast,
} from '@/features/workspace/shared/crudFeedback';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import SectionTab from '@/features/workspace/shared/SectionTab';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CloseIcon, InfoIcon, LinkIcon, PlusIcon, SaveIcon, SearchIcon, TrashIcon } from '@/features/workspace/shared/Icons';

function buildFormValues(form, detailRow = null) {
    return (form.fields ?? []).reduce((result, field) => {
        if (field.type === 'heading') {
            return result;
        }

        if (field.type === 'checkbox') {
            result[field.id] = Boolean(detailRow?.[field.id] ?? field.checked ?? false);
            return result;
        }

        result[field.id] = detailRow?.[field.id] ?? field.value ?? '';
        return result;
    }, {});
}

function FieldLabel({ field, className = '' }) {
    return (
        <label className={`text-[17px] text-[#1f2436] ${className}`.trim()}>
            {field.label}
            {field.required ? <span className="text-[#ED3969]"> *</span> : null}
            {field.info ? <InfoIcon className="ml-1 inline-flex h-4.5 w-4.5 align-[-2px] text-[#394157]" /> : null}
        </label>
    );
}

function MasterFieldRow({ field, value, onChange }) {
    if (field.type === 'heading') {
        return (
            <div className={`pt-1 ${field.containerClassName ?? ''}`.trim()}>
                <div className="text-[17px] font-semibold text-[#1f2436]">{field.label}</div>
            </div>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,420px)] lg:items-center">
                <FieldLabel field={field} />
                <CheckboxField
                    id={field.id}
                    label={field.checkboxLabel ?? field.label}
                    checked={Boolean(value)}
                    onChange={(event) => onChange(field.id, event.target.checked)}
                    align="center"
                    labelClassName="text-[16px] md:text-[17px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName={field.containerClassName ?? 'w-auto'}
                />
            </div>
        );
    }

    if (field.type === 'textarea') {
        return (
            <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,420px)] lg:items-start">
                <FieldLabel field={field} className="pt-2" />
                <div>
                    <TextareaField
                        value={value}
                        onChange={(event) => onChange(field.id, event.target.value)}
                        rows={field.rows ?? 3}
                        className={`rounded-[4px] border-[#cfd6e2] ${field.className ?? ''}`.trim()}
                        textareaClassName={`text-[15px] text-[#1f2436] ${field.textareaClassName ?? ''}`.trim()}
                        containerClassName={field.containerClassName ?? ''}
                    />
                </div>
            </div>
        );
    }

    if (field.type === 'lookup') {
        return (
            <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,420px)] lg:items-center">
                <FieldLabel field={field} />
                <div>
                    <TextInput
                        value={value}
                        onChange={(event) => onChange(field.id, event.target.value)}
                        placeholder={field.placeholder ?? 'Cari/Pilih...'}
                        className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${field.className ?? ''}`.trim()}
                        inputClassName="text-[15px] text-[#1f2436]"
                        containerClassName={field.containerClassName ?? ''}
                        trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                        trailingClassName="px-3"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,420px)] lg:items-center">
            <FieldLabel field={field} />
            <div>
                <TextInput
                    value={value}
                    onChange={(event) => onChange(field.id, event.target.value)}
                    className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${field.className ?? ''}`.trim()}
                    inputClassName="text-[15px] text-[#1f2436]"
                    containerClassName={field.containerClassName ?? ''}
                    trailing={
                        field.clearable && value ? (
                            <button
                                type="button"
                                onClick={() => onChange(field.id, '')}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#111827] transition hover:bg-[#eef2f7]"
                                aria-label={`Kosongkan ${field.label}`}
                            >
                                <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                            </button>
                        ) : null
                    }
                    trailingClassName={field.clearable ? 'pr-2' : ''}
                />
            </div>
        </div>
    );
}

function StandaloneCheckboxField({ field, value, onChange }) {
    return (
        <div className={field.offsetClassName ?? 'lg:pl-[260px]'}>
            <CheckboxField
                id={field.id}
                label={field.label}
                checked={Boolean(value)}
                onChange={(event) => onChange(field.id, event.target.checked)}
                align="center"
                labelClassName="text-[16px] md:text-[17px]"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName={field.containerClassName ?? 'w-auto'}
            />
        </div>
    );
}

function renderDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

function buildDockActions(form, isDetailMode) {
    if (isDetailMode && form.dockActionsDetail?.length) {
        return form.dockActionsDetail;
    }

    if (!isDetailMode && form.dockActionsCreate?.length) {
        return form.dockActionsCreate;
    }

    if (form.dockActions?.length) {
        return form.dockActions;
    }

    const actions = [
        {
            id: 'save',
            label: form.saveLabel,
            tone: isDetailMode ? (form.saveToneDetail ?? 'muted') : (form.saveToneCreate ?? 'primary'),
            icon: 'save',
        },
    ];

    if (isDetailMode && form.deleteLabel) {
        actions.push({
            id: 'delete',
            label: form.deleteLabel,
            tone: 'danger',
            icon: 'trash',
        });
    }

    return actions;
}

function findDetailRow(tableRows, activeLevel2Tab) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

    if (!recordId) {
        return null;
    }

    return (tableRows ?? []).find((row) => String(row.id) === String(recordId)) ?? null;
}

function SimpleMasterFormView({
    page,
    activeLevel2Tab,
    backendConfig = null,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const { form, table } = page;
    const detailRow = findDetailRow(table?.rows, activeLevel2Tab);
    const isDetailMode = Boolean(detailRow);
    const [values, setValues] = useState(() => buildFormValues(form, detailRow));
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const initialValues = useMemo(() => buildFormValues(form, detailRow), [detailRow, form]);

    useEffect(() => {
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
    }, [initialValues]);

    function handleChange(fieldId, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [fieldId]: nextValue,
        }));
    }

    const validationMessage = useMemo(() => {
        const requiredChecks = (form.fields ?? [])
            .filter((field) => field.required && field.type !== 'heading' && field.type !== 'checkbox')
            .map((field) => ({
                label: field.label,
                value: values[field.id],
                type: field.type === 'lookup' ? 'lookup' : 'text',
            }));
        const requiredValidationMessage = validateRequiredChecks(requiredChecks);

        if (requiredValidationMessage) {
            return requiredValidationMessage;
        }

        return backendConfig?.validate?.(values) ?? '';
    }, [backendConfig, form.fields, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(values, initialValues), [initialValues, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    useWorkspaceDirtyRegistration({
        pageId: page.id,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleAction(actionId) {
        if (!backendConfig) {
            return;
        }

        if (actionId === 'delete') {
            if (!detailRow?.id) {
                return;
            }

            const loadingToastId = showCrudLoadingToast('Sedang menghapus data.');
            setSaving(true);

            try {
                await deleteBackendResource(backendConfig.resource, detailRow.id);
                await onRefresh?.();
                const successMessage = 'Data berhasil dihapus.';
                setStatus({ tone: 'success', message: successMessage });
                finishCrudLoadingToast(loadingToastId);
                showCrudSuccessToast(successMessage);
                onCloseDetail?.(detailRow.id);
                onOpenContent?.();
            } catch (error) {
                const errorMessage = getBackendErrorMessage(error);
                setStatus({ tone: 'error', message: errorMessage });
                finishCrudLoadingToast(loadingToastId);
                showCrudErrorToast(errorMessage);
            } finally {
                setSaving(false);
            }

            return;
        }

        if (validationMessage) {
            setStatus({ tone: 'error', message: validationMessage });
            showCrudValidationToast(validationMessage);
            return;
        }

        const loadingToastId = showCrudLoadingToast(isDetailMode ? 'Sedang memperbarui data.' : 'Sedang menyimpan data baru.');
        setSaving(true);

        try {
            const payload = backendConfig.toPayload(values);
            const response = isDetailMode && detailRow?.id
                ? await updateBackendResource(backendConfig.resource, detailRow.id, payload)
                : await createBackendResource(backendConfig.resource, payload);
            const record = response?.data ?? null;

            await onRefresh?.();
            const successMessage = isDetailMode ? 'Data berhasil diperbarui.' : 'Data berhasil dibuat.';
            setStatus({ tone: 'success', message: successMessage });
            finishCrudLoadingToast(loadingToastId);
            showCrudSuccessToast(successMessage);

            if (!isDetailMode && record && onOpenDetail) {
                const row = backendConfig.toRow(record);

                onOpenDetail({
                    recordId: row.id,
                    label: row[backendConfig.labelField] ?? row.name ?? row.id,
                    tabLabel: row.tabLabel ?? row[backendConfig.labelField] ?? row.name ?? row.id,
                });
            }
        } catch (error) {
            const errorMessage = getBackendErrorMessage(error);
            setStatus({ tone: 'error', message: errorMessage });
            finishCrudLoadingToast(loadingToastId);
            showCrudErrorToast(errorMessage);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab label={form.sectionLabel} tone="accent" className="h-[34px]" />
            </div>

            <div className="flex min-h-[642px] flex-col gap-4 rounded-[4px] border border-[#cfd6e2] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-start xl:px-4 xl:py-4">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    <CrudStatusMessage status={status} />

                    <div className="space-y-4">
                        {(form.fields ?? []).map((field) => (
                            field.standalone ? (
                                <StandaloneCheckboxField
                                    key={field.id}
                                    field={field}
                                    value={values[field.id]}
                                    onChange={handleChange}
                                />
                            ) : (
                                <MasterFieldRow
                                    key={field.id}
                                    field={field}
                                    value={values[field.id] ?? ''}
                                    onChange={handleChange}
                                />
                            )
                        ))}
                    </div>
                </div>

                <div className="flex shrink-0 flex-row justify-end gap-3 lg:flex-col">
                    {buildDockActions(form, isDetailMode).map((action) => (
                        <DockActionButton
                            key={action.id}
                            label={saving ? 'Memproses...' : action.label}
                            tone={action.tone}
                            icon={renderDockIcon(action.icon)}
                            onClick={saving ? undefined : () => handleAction(action.id)}
                            disabled={action.id === 'save' ? saveDisabled : saving}
                            className={saving ? 'pointer-events-none opacity-70' : ''}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function renderCellValue(column, row) {
    if (column.kind === 'spacer') {
        return '';
    }

    return formatTableTextValue(row[column.id]);
}

function ToolbarLeftButton({ button }) {
    return (
        <button
            type="button"
            aria-label={button.label}
            title={button.label}
            className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
        >
            <LinkIcon className="h-4.5 w-4.5" />
        </button>
    );
}

function SimpleMasterTableView({ table, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return (table.rows ?? []).filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            return table.columns.some((column) => {
                if (column.kind === 'spacer') {
                    return false;
                }

                return String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword);
            });
        });
    }, [keyword, table.columns, table.rows]);
    const isRowInteractive = Boolean(onOpenDetail);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                leftControls={
                    table.leftButtons?.length
                        ? table.leftButtons.map((button) => <ToolbarLeftButton key={button.id} button={button} />)
                        : null
                }
                refreshButton={{ label: table.refreshLabel, onClick: table.onRefresh, loading: table.loading }}
                printButton={table.printLabel ? { label: table.printLabel } : null}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[310px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`${isRowInteractive ? 'cursor-pointer transition hover:bg-[#eef3fb]' : ''} border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.name ?? row.label ?? row.id,
                                            tabLabel: row.tabLabel ?? row.name ?? row.label ?? row.id,
                                        })
                                    }
                                >
                                    {table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.cellClassName ?? ''} px-3 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            {column.kind === 'spacer' ? null : (
                                                <span className={column.truncate === false ? '' : 'block truncate'}>
                                                    {renderCellValue(column, row)}
                                                </span>
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {table.emptyLabel ?? 'Belum ada data'}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function SimpleMasterView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const backendConfig = SIMPLE_MASTER_BACKEND_CONFIG[page.id] ?? null;
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: backendConfig?.resource,
        filters: {
            per_page: 100,
        },
        enabled: Boolean(backendConfig),
    });

    const resolvedPage = useMemo(() => {
        if (!backendConfig) {
            return page;
        }

        const mappedRows = rows.map((row) => backendConfig.toRow(row));

        return {
            ...page,
            table: {
                ...page.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : page.table?.refreshLabel,
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
            },
        };
    }, [backendConfig, error, loading, page, reload, rows, total]);

    return mode === 'table' ? (
        <SimpleMasterTableView table={resolvedPage.table} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SimpleMasterFormView
            page={resolvedPage}
            activeLevel2Tab={activeLevel2Tab}
            backendConfig={backendConfig}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
