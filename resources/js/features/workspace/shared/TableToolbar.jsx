import React, { useEffect, useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import TextInput from '@/components/ui/TextInput';
import {
    ChevronDownIcon,
    ColumnsIcon,
    DownloadIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    TableActionIcon,
    UploadIcon,
} from '@/features/workspace/shared/Icons';
import { exportToCSV, exportToExcelXML, importFromFile, printTable } from './exportUtils';
import { useColumnVisibility, getTableSchemaKey, tableRegistry, cleanHeaderLabel } from './columnVisibility';
import { showWarningToast, showInfoToast } from '@/components/feedback/toast';

const SIZE_STYLES = {
    compact: {
        createButton: 'h-[34px] min-w-[60px] px-3',
        utilityButton: 'h-[34px] w-[40px]',
        menuButton: 'h-[34px] min-w-[48px] px-2',
        searchInput: 'h-[34px]',
        pageInput: 'h-[34px] w-[68px] sm:w-[74px]',
        createIcon: 'h-5 w-5',
        searchIcon: 'h-5 w-5',
        searchText: 'text-[15px]',
    },
    default: {
        createButton: 'h-[40px] min-w-[72px] px-3.5',
        utilityButton: 'h-[40px] w-[50px]',
        menuButton: 'h-[40px] min-w-[50px] px-2',
        searchInput: 'h-[40px]',
        pageInput: 'h-[40px] w-[70px] sm:w-[76px]',
        createIcon: 'h-7 w-7',
        searchIcon: 'h-6 w-6',
        searchText: 'text-[17px]',
    },
};

function ToolbarIconButton({ label, onClick, className, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            aria-label={label}
            title={label}
        >
            {children}
        </button>
    );
}

// ─── Import Button ────────────────────────────────────────────────────────────

function ToolbarImportButton({ importConfig, sizeStyle }) {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    async function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const result = await importFromFile(file);
            importConfig.onImport?.(result);
        } catch {
            // silently ignore — consumer may handle via onImport error shape
        } finally {
            setLoading(false);
            // reset so same file can be re-selected
            event.target.value = '';
        }
    }

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
            />
            <ToolbarIconButton
                label={importConfig.label ?? 'Impor data'}
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${sizeStyle.utilityButton} ${loading ? 'pointer-events-none opacity-70' : ''}`.trim()}
            >
                {loading
                    ? <RefreshIcon className="h-4 w-4 animate-spin" />
                    : <UploadIcon className="h-4 w-4" />
                }
            </ToolbarIconButton>
        </>
    );
}

// ─── Export Split Button ──────────────────────────────────────────────────────

function ToolbarExportSplitButton({ exportConfig, sizeStyle }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const rows = exportConfig.rows ?? [];
    const disabled = rows.length === 0;

    function handleExport(type) {
        if (disabled) {
            showWarningToast({
                title: 'Ekspor Gagal',
                message: 'Tidak ada data di tabel untuk diekspor.',
            });
            setOpen(false);
            return;
        }

        const columns = exportConfig.columns ?? [];
        const filename = exportConfig.filename ?? 'export';
        const title = exportConfig.title ?? filename;

        if (type === 'csv') {
            exportToCSV(columns, rows, filename);
        } else if (type === 'excel') {
            exportToExcelXML(columns, rows, filename);
        } else if (type === 'print') {
            printTable(columns, rows, title);
        }

        setOpen(false);
    }

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => {
                    if (disabled) {
                        showWarningToast({
                            title: 'Ekspor Gagal',
                            message: 'Tidak ada data di tabel untuk diekspor.',
                        });
                        return;
                    }
                    setOpen(current => !current);
                }}
                className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${sizeStyle.menuButton} ${
                    disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-300 text-gray-400' : ''
                }`.trim()}
                title={disabled ? 'Tidak ada data untuk diekspor' : 'Ekspor data'}
                aria-label="Ekspor data"
            >
                <DownloadIcon className="h-4 w-4 text-current" />
                <ChevronDownIcon />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[200px]"
            >
                <div className="flex flex-col">
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                        Ekspor ke Excel (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                        Ekspor ke CSV (.csv)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('print')}>
                        Cetak / Ekspor PDF
                    </DropdownMenuItem>
                </div>
            </DropdownMenu>
        </div>
    );
}

// ─── Column Settings Panel ────────────────────────────────────────────────────

function ToolbarColumnSettings({ columnSettings, sizeStyle }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    if (!columnSettings?.columns?.length) return null;

    const { columns, visibleIds, onToggle } = columnSettings;

    return (
        <div ref={buttonRef} className="relative">
            <ToolbarIconButton
                label="Pengaturan kolom"
                onClick={() => setOpen(current => !current)}
                className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${sizeStyle.utilityButton}`.trim()}
            >
                <ColumnsIcon className="h-4 w-4" />
            </ToolbarIconButton>

            {open ? (
                <ColumnSettingsPanel
                    anchorRef={buttonRef}
                    columns={columns}
                    visibleIds={visibleIds}
                    onToggle={onToggle}
                    onClose={() => setOpen(false)}
                />
            ) : null}
        </div>
    );
}


function ColumnSettingsPanel({ anchorRef, columns, visibleIds, onToggle, onClose }) {
    const panelRef = useRef(null);

    useEffect(() => {
        function handlePointerDown(event) {
            if (
                panelRef.current?.contains(event.target) ||
                anchorRef?.current?.contains(event.target)
            ) return;
            onClose();
        }
        function handleKeyDown(event) {
            if (event.key === 'Escape') onClose();
        }
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [anchorRef, onClose]);

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] rounded-[6px] border border-[#d6deea] bg-white p-2 shadow-[0_6px_14px_rgba(15,23,42,0.12)]"
        >
            <p className="mb-1.5 px-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8b94a7]">
                Tampilkan Kolom
            </p>
            <div className="flex flex-col gap-0.5">
                {columns.map(col => {
                    const visible = visibleIds.includes(col.id);
                    return (
                        <button
                            key={col.id}
                            type="button"
                            onClick={() => onToggle(col.id)}
                            className="flex items-center gap-2.5 rounded-[4px] px-2 py-1.5 text-left text-[13px] text-[#1f2436] transition hover:bg-[#eef3fb]"
                        >
                            <span
                                className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border transition ${
                                    visible
                                        ? 'border-[#2353a0] bg-[#2353a0] text-white'
                                        : 'border-[#c0c8d5] bg-white'
                                }`}
                            >
                                {visible ? (
                                    <svg viewBox="0 0 10 8" fill="none" className="h-[9px] w-[9px]">
                                        <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : null}
                            </span>
                            {col.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Action Menu Button ───────────────────────────────────────────────────────

function getPreferencesTabForResource(filename, resourceName) {
    const name = (filename || resourceName || '').toLowerCase();

    if (name.includes('anggaran') || name.includes('budget') || name.includes('departemen') || name.includes('gudang') || name.includes('cabang')) {
        return 'features';
    }
    if (name.includes('pajak') || name.includes('tax')) {
        return 'tax';
    }
    if (name.includes('sales') || name.includes('penjualan') || name.includes('pengiriman') || name.includes('syarat-pembayaran')) {
        return 'sales';
    }
    if (name.includes('pemasok') || name.includes('supplier')) {
        return 'purchase';
    }
    if (name.includes('pembayaran') || name.includes('penerimaan') || name.includes('transfer-bank') || name.includes('beban') || name.includes('jurnal') || name.includes('gaji')) {
        return 'approval';
    }
    if (name.includes('karyawan') || name.includes('employee')) {
        return 'limitations';
    }
    if (name.includes('log') || name.includes('history') || name.includes('activity')) {
        return 'others';
    }
    return 'features';
}

function ToolbarActionMenu({ menuButton, sizeStyle, exportConfig, resolvedResourceName, resolvedColumns = [], resolvedRows = [] }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    if (!menuButton?.items?.length) return null;

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen(current => !current)}
                className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-2 text-[#2353a0] ${sizeStyle.menuButton} ${menuButton.buttonClassName ?? ''}`.trim()}
                aria-label={menuButton.label}
            >
                {menuButton.icon ?? <TableActionIcon />}
                <ChevronDownIcon />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName={menuButton.widthClassName ?? 'w-[180px]'}
            >
                <div className="flex flex-col">
                    {menuButton.items.map(item => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => {
                                if (item.onClick) {
                                    item.onClick();
                                } else if (item.id === 'settings' || item.id === 'column-settings' || item.id === 'arrange-columns' || item.id.includes('settings')) {
                                    const targetTab = getPreferencesTabForResource(exportConfig?.filename, resolvedResourceName);
                                    window.__nextPreferencesTab = targetTab;
                                    window.dispatchEvent(new CustomEvent('workspace:open-page', {
                                        detail: { pageId: 'preferences' }
                                    }));
                                    window.dispatchEvent(new CustomEvent('workspace:open-preferences-tab', {
                                        detail: { sideItemId: targetTab }
                                    }));
                                } else if (item.id === 'export-log' || item.id.includes('export') || item.id.includes('download')) {
                                    exportToExcelXML(resolvedColumns, resolvedRows, exportConfig?.filename || resolvedResourceName || 'export');
                                } else {
                                    showInfoToast({
                                        title: 'Pengaturan Tabel',
                                        message: 'Pengaturan kolom untuk tabel ini dapat disesuaikan menggunakan tombol "Pengaturan Kolom" (ikon kolom) di sebelah kanan.',
                                    });
                                }
                                setOpen(false);
                            }}
                            icon={item.icon}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

// ─── TableToolbar ─────────────────────────────────────────────────────────────

/**
 * Shared table toolbar.
 *
 * New props:
 *   importButton  – { label?, onImport(result: { headers, rows }) }
 *   columnSettings – { columns: {id, label}[], visibleIds: string[], onToggle(id) }
 *
 * exportConfig gains an optional `title` field for print headers.
 */
function mapImportRow(row, columns) {
    const mapped = {};
    const rowKeys = Object.keys(row);

    columns.forEach(col => {
        if (!col.id || col.kind === 'spacer' || col.id === 'actions') return;

        const normalizedLabel = String(col.label || '').toLowerCase().trim();
        const normalizedId = String(col.id).toLowerCase().trim();

        const matchedKey = rowKeys.find(k => {
            const normalizedKey = k.toLowerCase().trim();
            return normalizedKey === normalizedLabel || 
                   normalizedKey === normalizedId ||
                   normalizedKey.replace(/[^a-z0-9]/g, '') === normalizedId.replace(/[^a-z0-9]/g, '');
        });

        if (matchedKey !== undefined) {
            mapped[col.id] = row[matchedKey];
        } else {
            const aliasMap = {
                code: ['kode', 'no', 'nomor', 'employee_code', 'number'],
                name: ['nama', 'nama lengkap', 'description', 'full_name'],
                description: ['keterangan', 'deskripsi', 'catatan'],
                notes: ['keterangan', 'deskripsi', 'catatan'],
                rate: ['rate', 'persentase', 'persen', 'nilai'],
                percentage: ['rate', 'persentase', 'persen', 'nilai'],
            };
            const aliases = aliasMap[col.id] || [];
            const matchedAliasKey = rowKeys.find(k => {
                const normalizedKey = k.toLowerCase().trim();
                return aliases.includes(normalizedKey);
            });
            if (matchedAliasKey !== undefined) {
                mapped[col.id] = row[matchedAliasKey];
            }
        }
    });

    return mapped;
}

function cleanRightControls(controls) {
    if (!controls) return null;

    const controlsArray = React.Children.toArray(controls);

    const isDummyAction = (element) => {
        if (!React.isValidElement(element)) return false;

        const props = element.props || {};
        const key = String(element.key || '').toLowerCase();
        const icon = String(props.icon || '').toLowerCase();
        const id = String(props.id || props.action?.id || '').toLowerCase();
        const label = String(props.label || props.action?.label || '').toLowerCase();

        const dummyKeys = ['download', 'print', 'settings'];
        const dummyIcons = ['download', 'print', 'settings'];
        const dummyIds = ['download', 'print', 'settings'];
        const dummyLabels = ['unduh', 'cetak', 'pengaturan tabel', 'download', 'print', 'settings'];

        return (
            dummyKeys.some(dk => key.includes(dk)) ||
            dummyIcons.some(di => icon.includes(di)) ||
            dummyIds.some(di => id === di) ||
            dummyLabels.some(dl => label.includes(dl))
        );
    };

    const cleaned = controlsArray.filter(child => !isDummyAction(child));
    return cleaned.length > 0 ? cleaned : null;
}

export default function TableToolbar({
    size = 'default',
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
    const resolvedResourceName = resourceName ?? activeTableState?.resource ?? null;

    const schemaKey = getTableSchemaKey(resolvedColumns);
    const [visibleColumnIds, setVisibleColumnIds] = useColumnVisibility(schemaKey, resolvedColumns);

    const resolvedColumnSettings = columnSettings || (resolvedColumns.length ? {
        columns: resolvedColumns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label),
        visibleIds: visibleColumnIds,
        onToggle: (columnId) => {
            setVisibleColumnIds(prev =>
                prev.includes(columnId)
                    ? prev.filter(id => id !== columnId)
                    : [...prev, columnId]
            );
        }
    } : null);

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

    const resolvedPrintButton = printButton
        ? {
              ...printButton,
              onClick: printButton.onClick ?? defaultPrintHandler,
          }
        : (resolvedColumns.length ? {
              label: 'Cetak data',
              onClick: defaultPrintHandler,
          } : null);

    const resolvedImportButton = importButton || (resolvedResourceName ? {
        label: 'Impor data',
        onImport: async ({ headers, rows }) => {
            if (!rows.length) return;
            try {
                const mappedRows = rows.map(row => mapImportRow(row, resolvedColumns));

                const response = await window.axios.post(`/api/backend/${resolvedResourceName}/import`, {
                    rows: mappedRows,
                });

                alert(response.data?.message || 'Berhasil mengimpor data.');
                if (typeof onRefresh === 'function') {
                    onRefresh();
                } else if (typeof refreshButton?.onClick === 'function') {
                    refreshButton.onClick();
                }
            } catch (err) {
                const msg = err.response?.data?.message || err.message || 'Gagal mengimpor data.';
                alert(msg);
            }
        }
    } : null);

    const resolvedExportConfig = exportConfig || (resolvedColumns.length ? {
        columns: resolvedColumns,
        rows: resolvedRows,
        filename: resolvedResourceName ? resolvedResourceName.replace(/\s+/g, '-') : 'export',
        title: exportConfig?.title || activeTableState?.title || 'Laporan',
    } : null);

    const sizeStyle = SIZE_STYLES[size] ?? SIZE_STYLES.default;
    const searchLoading = Boolean(search?.loading ?? refreshButton?.loading);
    const searchTrailing = searchLoading
        ? <RefreshIcon className={`${sizeStyle.searchIcon} animate-spin`.trim()} />
        : (search?.trailing ?? <SearchIcon className={sizeStyle.searchIcon} />);

    const cleanedRightControls = cleanRightControls(rightControls);

    return (
        <div className={className}>
            {filters ? (
                <div className={`flex flex-wrap items-center justify-between gap-3 ${topRowClassName}`.trim()}>
                    <div className="flex w-full flex-wrap items-center gap-3">{filters}</div>
                </div>
            ) : null}

            <div
                className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${filters ? 'mt-3' : ''} ${bottomRowClassName}`.trim()}
            >
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    {createButton ? (
                        <ToolbarIconButton
                            label={createButton.label}
                            onClick={createButton.onClick}
                            className={`inline-flex shrink-0 items-center justify-center rounded-[4px] bg-[#2353a0] text-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${sizeStyle.createButton}`.trim()}
                        >
                            {createButton.icon ?? <PlusIcon className={sizeStyle.createIcon} />}
                        </ToolbarIconButton>
                    ) : null}

                    {refreshButton ? (
                        <ToolbarIconButton
                            label={refreshButton.label ?? 'Muat ulang'}
                            onClick={refreshButton.onClick}
                            className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${sizeStyle.utilityButton}`.trim()}
                        >
                            {refreshButton.loading ? (
                                <RefreshIcon className="h-4.5 w-4.5 animate-spin" />
                            ) : (
                                <RefreshIcon className="h-4.5 w-4.5" />
                            )}
                        </ToolbarIconButton>
                    ) : null}

                    {leftControls}
                </div>

                <div
                    className={`flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center md:flex-nowrap ${rightControlsClassName}`.trim()}
                >
                    {cleanedRightControls ? <div className="flex shrink-0 flex-row flex-wrap items-center gap-2">{cleanedRightControls}</div> : null}

                    {resolvedImportButton ? <ToolbarImportButton importConfig={resolvedImportButton} sizeStyle={sizeStyle} /> : null}

                    {resolvedExportConfig ? <ToolbarExportSplitButton exportConfig={resolvedExportConfig} sizeStyle={sizeStyle} /> : null}

                    {menuButton ? (
                        <ToolbarActionMenu
                            menuButton={menuButton}
                            sizeStyle={sizeStyle}
                            exportConfig={resolvedExportConfig}
                            resolvedResourceName={resolvedResourceName}
                            resolvedColumns={resolvedColumns}
                            resolvedRows={resolvedRows}
                        />
                    ) : null}

                    {resolvedColumnSettings ? <ToolbarColumnSettings columnSettings={resolvedColumnSettings} sizeStyle={sizeStyle} /> : null}

                    {resolvedPrintButton ? (
                        <ToolbarIconButton
                            label={resolvedPrintButton.label}
                            onClick={resolvedPrintButton.onClick}
                            className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${sizeStyle.utilityButton} ${
                                resolvedRows.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-300 text-gray-400' : ''
                            }`.trim()}
                        >
                            {resolvedPrintButton.icon ?? <PrintIcon />}
                        </ToolbarIconButton>
                    ) : null}

                    {search ? (
                        <TextInput
                            value={search.value}
                            onChange={search.onChange}
                            placeholder={search.placeholder || 'Cari data di sini...'}
                            trailing={searchTrailing}
                            aria-label={search.placeholder || 'Cari data'}
                            className={`${sizeStyle.searchInput} w-full rounded-[4px] border-[#cfd6e2] ${search.widthClassName ?? 'sm:max-w-[248px]'}`.trim()}
                            inputClassName={search.inputClassName ?? `${sizeStyle.searchText} text-[#1f2436]`}
                            trailingClassName={search.trailingClassName ?? 'px-3'}
                        />
                    ) : null}

                </div>
            </div>
        </div>
    );
}
