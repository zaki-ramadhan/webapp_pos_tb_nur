import React, { useEffect, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import Tooltip from '@/components/ui/Tooltip';
import {
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    LoadingIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';

import { printTable } from './exportUtils';
import { useColumnVisibility, getTableSchemaKey, tableRegistry, cleanHeaderLabel } from './columnVisibility';
import { showWarningToast, showSuccessToast, showErrorToast } from '@/components/feedback/toast';

// Modular Toolbar Imports
import ToolbarIconButton from './toolbar/ToolbarIconButton';
import ToolbarImportButton from './toolbar/ToolbarImportButton';
import ToolbarExportSplitButton from './toolbar/ToolbarExportSplitButton';
import ToolbarSettingsMenu from './toolbar/ToolbarSettingsMenu';
import {
    SIZE_STYLES,
    PAGE_ID_TO_RESOURCE_MAP,
    mapImportRow,
    cleanRightControls,
} from './toolbar/toolbarConstants';

export default function TableToolbar({
    size = 'compact',
    filters = null,
    createButton = null,
    refreshButton = null,
    leftControls = null,
    importButton = null,
    printButton = null,
    menuButton = null,
    columnSettings = null,
    rightControls = null,
    search = null,
    pageValue = undefined,
    exportConfig = null,
    className = '',
    topRowClassName = '',
    bottomRowClassName = '',
    rightControlsClassName = '',
    resourceName = null,
    onRefresh = null,
}) {
    const [activeTableState, setActiveTableState] = useState(() => tableRegistry.activeTable);

    useEffect(() => {
        return tableRegistry.subscribe((tableState) => {
            setActiveTableState(tableState);
        });
    }, []);

    const rawResolvedColumns = exportConfig?.columns ?? activeTableState?.columns ?? [];
    const resolvedColumns = React.useMemo(() => {
        return rawResolvedColumns.map(col => {
            if (!col) return col;
            return {
                ...col,
                label: cleanHeaderLabel(col.label)
            };
        });
    }, [rawResolvedColumns]);
    const resolvedRows = exportConfig?.rows ?? activeTableState?.rows ?? [];
    const rawResourceName = resourceName ?? activeTableState?.resource ?? (typeof window !== 'undefined' ? window.__activePageId : null) ?? null;
    const resolvedResourceName = PAGE_ID_TO_RESOURCE_MAP[rawResourceName] ?? rawResourceName;

    const schemaKey = getTableSchemaKey(resolvedColumns);
    const [visibleColumnIds, setVisibleColumnIds] = useColumnVisibility(schemaKey, resolvedColumns);

    const resolvedColumnSettings = columnSettings === false
        ? null
        : (columnSettings || (resolvedColumns.length ? {
            columns: resolvedColumns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label),
            visibleIds: visibleColumnIds,
            onToggle: (columnId) => {
                setVisibleColumnIds(prev =>
                    prev.includes(columnId)
                        ? prev.filter(id => id !== columnId)
                        : [...prev, columnId]
                );
            }
        } : null));

    const defaultPrintHandler = () => {
        if (resolvedRows.length === 0) {
            showWarningToast({
                title: 'Cetak Gagal',
                message: 'Tidak ada data di tabel untuk dicetak.',
            });
            return;
        }
        let activeCols = resolvedColumns.filter(col => {
            if (visibleColumnIds && !visibleColumnIds.includes(col.id)) return false;
            return col && col.kind !== 'spacer' && col.id !== 'actions';
        });
        if (activeCols.length === 0) {
            activeCols = resolvedColumns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions');
        }
        printTable(activeCols, resolvedRows, exportConfig?.title || activeTableState?.title || 'Laporan');
    };

    const resolvedPrintButton = printButton === false
        ? null
        : (printButton
            ? {
                  ...printButton,
                  onClick: printButton.onClick ?? defaultPrintHandler,
              }
            : (resolvedColumns.length ? {
                  label: 'Cetak data',
                  onClick: defaultPrintHandler,
              } : null));

    const resolvedImportButton = importButton === false
        ? null
        : (importButton || (resolvedResourceName ? {
            label: 'Impor data',
            onImport: async ({ headers, rows }) => {
                if (!rows.length) return;
                try {
                    const mappedRows = rows.map(row => mapImportRow(row, resolvedColumns));

                    const response = await window.axios.post(`/api/backend/${resolvedResourceName}/import`, {
                        rows: mappedRows,
                    });

                     showSuccessToast({
                        message: response.data?.message || 'Berhasil mengimpor data.',
                    });
                    if (typeof onRefresh === 'function') {
                        onRefresh();
                    } else if (typeof refreshButton?.onClick === 'function') {
                        refreshButton.onClick();
                    }
                } catch (err) {
                    let msg = 'Gagal mengimpor data.';
                    if (err.response) {
                        const status = err.response.status;
                        const backendMsg = err.response.data?.message;

                        if (status === 404) {
                            msg = 'Gagal mengimpor: Halaman ini tidak mendukung impor data atau alamat tujuan tidak ditemukan.';
                        } else if (status === 403) {
                            msg = 'Gagal mengimpor: Anda tidak memiliki izin untuk mengimpor data ke halaman ini.';
                        } else if (status === 401) {
                            msg = 'Gagal mengimpor: Sesi Anda telah berakhir, silakan login kembali.';
                        } else if (status === 409) {
                            msg = 'Gagal mengimpor: Terdapat duplikasi data atau pelanggaran relasi pada database.';
                        } else if (status === 422) {
                            msg = backendMsg || 'Format data tidak valid.';
                        } else if (status === 500) {
                            msg = 'Gagal mengimpor: Terjadi kesalahan internal pada server. Silakan hubungi admin.';
                        } else {
                            msg = backendMsg || `Gagal mengimpor data (Error ${status}).`;
                        }
                    } else {
                        msg = err.message || 'Gagal menghubungkan ke server. Pastikan koneksi internet Anda aktif.';
                    }

                    showErrorToast({
                        message: msg,
                    });
                }
            }
        } : null));

    const resolvedExportConfig = exportConfig === false
        ? null
        : (exportConfig || (resolvedColumns.length ? {
            columns: resolvedColumns,
            rows: resolvedRows,
            filename: resolvedResourceName ? resolvedResourceName.replace(/\s+/g, '-') : 'export',
            title: exportConfig?.title || activeTableState?.title || 'Laporan',
        } : null));

    const sizeStyle = SIZE_STYLES[size] ?? SIZE_STYLES.default;
    const searchLoading = Boolean(search?.loading ?? refreshButton?.loading);
    const searchTrailing = searchLoading
        ? <LoadingIcon className={`${sizeStyle.searchIcon} animate-spin`.trim()} />
        : (search?.trailing ?? <SearchIcon className={sizeStyle.searchIcon} />);

    const cleanedRightControls = cleanRightControls(rightControls);

    return (
        <div className={className}>
            {filters ? (
                <div className={`mb-2.5 flex flex-wrap items-center justify-between gap-3 ${topRowClassName}`.trim()}>
                    <div className="flex w-full flex-wrap items-center gap-2">
                        {filters}
                    </div>
                </div>
            ) : null}

            <div className={`flex flex-col justify-between gap-3 md:flex-row md:items-center ${filters ? 'mt-1' : ''} ${bottomRowClassName}`.trim()}>
                <div className="flex flex-wrap items-center gap-2">
                    {createButton ? (
                        <Tooltip content="Tambah" portal>
                            <button
                                type="button"
                                onClick={createButton.onClick}
                                title={createButton.label}
                                className={`inline-flex shrink-0 items-center justify-center rounded-[4px] bg-brand-blue text-white shadow-sm transition hover:bg-brand-blue-darker ${size === 'compact' ? 'h-[34px] w-[86px]' : 'h-[40px] w-[100px]'}`.trim()}
                            >
                                <PlusIcon className={sizeStyle.createIcon} />
                            </button>
                        </Tooltip>
                    ) : null}

                    {refreshButton ? (
                        <ToolbarIconButton
                            label={refreshButton.label ?? 'Perbarui'}
                            onClick={refreshButton.onClick}
                            disabled={searchLoading}
                            className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue transition hover:bg-brand-blue-light ${sizeStyle.utilityButton} ${searchLoading ? 'pointer-events-none opacity-70' : ''}`.trim()}
                        >
                            <RefreshIcon className={`h-4 w-4 ${searchLoading ? 'animate-spin' : ''}`.trim()} />
                        </ToolbarIconButton>
                    ) : null}

                    {leftControls}
                </div>

                <div className={`flex flex-wrap items-center gap-2 md:justify-end ${rightControlsClassName}`.trim()}>
                    {resolvedImportButton ? (
                        <ToolbarImportButton
                            importConfig={resolvedImportButton}
                            sizeStyle={sizeStyle}
                        />
                    ) : null}

                    {resolvedExportConfig ? (
                        <ToolbarExportSplitButton
                            exportConfig={resolvedExportConfig}
                            sizeStyle={sizeStyle}
                            visibleColumnIds={visibleColumnIds}
                        />
                    ) : null}

                    {resolvedPrintButton ? (
                        <ToolbarIconButton
                            label={resolvedRows.length === 0 ? 'Tidak ada data untuk dicetak' : (resolvedPrintButton.label ?? 'Cetak')}
                            onClick={resolvedPrintButton.onClick}
                            disabled={resolvedRows.length === 0}
                            className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue transition ${resolvedRows.length === 0 ? 'opacity-50 cursor-not-allowed bg-tab-inactive-border-l border-gray-300 text-gray-400' : 'hover:bg-brand-blue-light'} ${sizeStyle.utilityButton}`.trim()}
                        >
                            <PrintIcon className="h-4 w-4" />
                        </ToolbarIconButton>
                    ) : null}

                    {resolvedColumnSettings ? (
                        <ToolbarSettingsMenu
                            menuButton={menuButton}
                            columnSettings={resolvedColumnSettings}
                            sizeStyle={sizeStyle}
                        />
                    ) : null}

                    {cleanedRightControls}

                    {search ? (
                        <TextInput
                            type="text"
                            placeholder={search.placeholder ?? 'Cari data...'}
                            value={search.value}
                            onChange={(event) => search.onChange?.(event)}
                            onClear={() => search.onChange?.({ target: { value: '' } })}
                            trailing={searchTrailing}
                            containerClassName={search.widthClassName ?? 'w-full md:w-[220px] lg:w-[260px]'}
                            className={sizeStyle.searchInput}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
