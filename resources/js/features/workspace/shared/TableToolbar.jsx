import React, { useEffect, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import Tooltip from '@/components/ui/Tooltip';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import {
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    LoadingIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';

import { printTable } from './exportUtils';
import { useColumnVisibility, getTableSchemaKey, tableRegistry, cleanHeaderLabel } from '@/features/workspace/shared/columnVisibility';
import { showWarningToast, showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';

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
    const searchPlaceholder = React.useMemo(() => {
        const rawPlaceholder = String(search?.placeholder ?? '').trim();
        if (rawPlaceholder && rawPlaceholder.toLowerCase() !== 'cari...' && rawPlaceholder.toLowerCase() !== 'cari' && rawPlaceholder.toLowerCase() !== 'cari data...') {
            return rawPlaceholder;
        }
        const searchCols = (resolvedColumns ?? []).filter(
            (col) => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label
        );
        if (!searchCols.length) {
            return 'Cari data...';
        }
        const labels = searchCols.map(col => col.label);
        return `Cari ${labels.slice(0, 3).join(', ')}${labels.length > 3 ? '...' : ''}`;
    }, [search?.placeholder, resolvedColumns]);
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
        const activeVisibleIds = columnSettings?.visibleIds ?? visibleColumnIds;
        let activeCols = resolvedColumns.filter(col => {
            if (activeVisibleIds && !activeVisibleIds.includes(col.id)) return false;
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
                if (!rows.length) {
                    showErrorToast({
                        title: 'Impor Gagal',
                        message: 'File yang diunggah tidak berisi data.',
                    });
                    return;
                }

                // 1. Periksa kecocokan kolom header
                const hasMatchingHeader = headers.some(header => {
                    const normalizedHeader = String(header).toLowerCase().trim();
                    return resolvedColumns.some(col => {
                        if (!col.id || col.kind === 'spacer' || col.id === 'actions') return false;
                        const colLabel = String(col.label || '').toLowerCase().trim();
                        const colId = String(col.id).toLowerCase().trim();
                        return normalizedHeader === colLabel || 
                               normalizedHeader === colId ||
                               colId.includes(normalizedHeader) ||
                               normalizedHeader.includes(colId);
                    });
                });

                if (!hasMatchingHeader) {
                    showErrorToast({
                        title: 'Format File Salah',
                        message: 'Kolom pada file yang diunggah tidak cocok dengan kolom tabel (tidak ada kolom utama seperti Nama/Kode yang sesuai).',
                    });
                    return;
                }

                try {
                    const mappedRows = rows.map(row => mapImportRow(row, resolvedColumns));

                    // Periksa apakah baris yang dipetakan kosong semua datanya
                    const hasValidData = mappedRows.some(mappedRow => {
                        return Object.values(mappedRow).some(val => val !== undefined && String(val).trim() !== '');
                    });

                    if (!hasValidData) {
                        showErrorToast({
                            title: 'Data Tidak Valid',
                            message: 'Nilai pada baris data kosong atau tidak cocok dengan format kolom tabel.',
                        });
                        return;
                    }

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
                    let errorList = [];
                    if (err.response) {
                        const status = err.response.status;
                        const backendMsg = err.response.data?.message;

                        if (status === 404) {
                            msg = 'Layanan impor tidak tersedia untuk halaman ini.';
                        } else if (status === 403) {
                            msg = 'Anda tidak memiliki akses untuk mengimpor data di halaman ini.';
                        } else if (status === 401) {
                            msg = 'Sesi masuk Anda telah habis. Silakan masuk kembali.';
                        } else if (status === 422) {
                            const errors = err.response.data?.errors;
                            if (errors && typeof errors === 'object') {
                                Object.values(errors).forEach(errMsgs => {
                                    if (Array.isArray(errMsgs)) {
                                        errorList.push(...errMsgs);
                                    } else if (typeof errMsgs === 'string') {
                                        errorList.push(errMsgs);
                                    }
                                });
                            }
                            msg = backendMsg || 'Terdapat format nilai kolom yang tidak sesuai atau data wajib yang kosong.';
                        } else if (status === 500) {
                            msg = 'Format data pada file tidak sesuai (misal: kolom angka diisi teks, atau data referensi tidak terdaftar). Silakan periksa kembali isi file Anda.';
                        } else if (backendMsg) {
                            msg = backendMsg;
                        }
                    } else {
                        msg = err.message || 'Gagal menghubungkan ke server. Pastikan koneksi internet Anda aktif.';
                    }

                    if (errorList.length > 1) {
                        showSystemErrorModal({
                            title: 'Impor Gagal',
                            description: 'Terdapat beberapa kesalahan format data pada file Anda:',
                            messages: errorList,
                        });
                    } else if (errorList.length === 1) {
                        showSystemErrorModal({
                            title: 'Impor Gagal',
                            description: 'Terdapat kesalahan format data pada file Anda:',
                            message: errorList[0],
                        });
                    } else {
                        showSystemErrorModal({
                            title: 'Impor Gagal',
                            description: 'Terjadi kesalahan saat memproses data:',
                            message: msg,
                        });
                    }
                }
            }
        } : null));

    const resolvedExportConfig = (exportConfig === false || exportConfig?.hideExport)
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
                                className={`inline-flex shrink-0 items-center justify-center rounded-[4px] bg-brand-blue text-white shadow-sm transition hover:bg-brand-blue-darker ${size === 'compact' ? 'h-[40px] w-[86px]' : 'h-[40px] w-[100px]'}`.trim()}
                            >
                                <PlusIcon className={sizeStyle.createIcon} />
                            </button>
                        </Tooltip>
                    ) : null}

                    {refreshButton ? (
                        <RefreshButton
                            label={refreshButton.label ?? 'Muat ulang'}
                            onClick={refreshButton.onClick}
                            loading={searchLoading}
                            className={sizeStyle.utilityButton}
                        />
                    ) : null}

                    {leftControls}
                </div>

                <div className={`flex flex-wrap items-center gap-2 md:justify-end ${rightControlsClassName}`.trim()}>
                    {resolvedImportButton ? (
                        <ToolbarImportButton
                            importConfig={resolvedImportButton}
                            sizeStyle={sizeStyle}
                            resource={resolvedResourceName}
                            columns={resolvedColumns}
                        />
                    ) : null}

                    {resolvedExportConfig ? (
                        <ToolbarExportSplitButton
                            exportConfig={resolvedExportConfig}
                            sizeStyle={sizeStyle}
                            visibleColumnIds={columnSettings?.visibleIds ?? visibleColumnIds}
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

                    {resolvedColumnSettings || menuButton ? (
                        <ToolbarSettingsMenu
                            columnSettings={resolvedColumnSettings}
                            menuButton={menuButton}
                            sizeStyle={sizeStyle}
                        />
                    ) : null}                    {cleanedRightControls}

                    {search ? (
                        <TextInput
                            type="text"
                            placeholder={searchPlaceholder}
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
