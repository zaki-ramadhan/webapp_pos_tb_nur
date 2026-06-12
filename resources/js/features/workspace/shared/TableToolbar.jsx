import React, { useEffect, useRef, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import Tooltip from '@/components/ui/Tooltip';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import {
    ChevronDownIcon,
    ColumnsIcon,
    DownloadIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    UploadIcon,
    CogIcon,
    FunnelIcon,
} from '@/features/workspace/shared/Icons';
import { exportToCSV, exportToExcelXML, importFromFile, printTable } from './exportUtils';
import { useColumnVisibility, getTableSchemaKey, tableRegistry, cleanHeaderLabel } from './columnVisibility';
import { showWarningToast, showSuccessToast, showErrorToast } from '@/components/feedback/toast';

const SIZE_STYLES = {
    compact: {
        createButton: 'h-[34px] min-w-[60px] px-3',
        utilityButton: 'h-[34px] w-[40px]',
        menuButton: 'h-[34px] min-w-[48px] px-2',
        searchInput: 'h-[34px]',
        pageInput: 'h-[34px] w-[68px] sm:w-[74px]',
        createIcon: 'h-5 w-5',
        searchIcon: 'h-5 w-5',
        searchText: 'text-sm',
    },
    default: {
        createButton: 'h-[40px] min-w-[72px] px-3.5',
        utilityButton: 'h-[40px] w-[50px]',
        menuButton: 'h-[40px] min-w-[50px] px-2',
        searchInput: 'h-[40px]',
        pageInput: 'h-[40px] w-[70px] sm:w-[76px]',
        createIcon: 'h-7 w-7',
        searchIcon: 'h-6 w-6',
        searchText: 'text-sm',
    },
};

function ToolbarIconButton({ label, onClick, className, children }) {
    return (
        <Tooltip content={label} portal>
            <button
                type="button"
                onClick={onClick}
                className={className}
                aria-label={label}
            >
                {children}
            </button>
        </Tooltip>
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
            <Tooltip content={disabled ? 'Tidak ada data untuk diekspor' : 'Ekspor data'} portal>
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
                    aria-label="Ekspor data"
                >
                    <DownloadIcon className="h-4 w-4 text-current" />
                    <ChevronDownIcon />
                </button>
            </Tooltip>

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

// ─── Settings Menu (Column Settings Panel) ────────────────────────────────────

/**
 * Unified settings button: CogIcon opens a search + checkbox column panel.
 * Falls back to a no-op if no columns are available.
 */
function ToolbarSettingsMenu({ menuButton, columnSettings, sizeStyle }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    // Prefer columnSettings from toolbar; fall through if neither exist
    const colSettings = columnSettings;
    const hasColumns = colSettings?.columns?.length > 0;

    // Only render if there's a menu button config or columns to show
    if (!menuButton && !hasColumns) return null;

    return (
        <div ref={buttonRef} className="relative">
            <Tooltip content={menuButton?.label ?? 'Pengaturan kolom'} portal>
                <button
                    type="button"
                    onClick={() => setOpen(c => !c)}
                    className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-2 text-[#2353a0] ${sizeStyle.menuButton} ${menuButton?.buttonClassName ?? ''}`.trim()}
                    aria-label={menuButton?.label ?? 'Pengaturan kolom'}
                >
                    {menuButton?.icon ?? <CogIcon className="h-4 w-4" />}
                    <ChevronDownIcon />
                </button>
            </Tooltip>

            {open && hasColumns ? (
                <ColumnSettingsPanel
                    anchorRef={buttonRef}
                    columns={colSettings.columns}
                    visibleIds={colSettings.visibleIds}
                    onToggle={colSettings.onToggle}
                    onClose={() => setOpen(false)}
                />
            ) : null}
        </div>
    );
}

function ColumnSettingsPanel({ anchorRef, columns, visibleIds, onToggle, onClose }) {
    const panelRef = useRef(null);
    const [search, setSearch] = useState('');

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

    const filtered = search.trim()
        ? columns.filter(col => col.label?.toLowerCase().includes(search.toLowerCase()))
        : columns;

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[240px] rounded-[6px] border border-[#d6deea] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.14)] overflow-hidden"
        >
            {/* Search */}
            <div className="px-2 pt-2 pb-1.5 border-b border-[#edf0f5]">
                <div className="flex items-center gap-1.5 rounded-[4px] border border-[#d0d7e3] bg-[#f7f9fc] px-2.5 py-1.5">
                    <SearchIcon className="h-3.5 w-3.5 shrink-0 text-[#9aa4b6]" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari..."
                        className="min-w-0 flex-1 bg-transparent text-sm text-[#1f2436] placeholder-[#b0b8c9] outline-none"
                        autoFocus
                    />
                    {search ? (
                        <button type="button" onClick={() => setSearch('')} className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[#9aa4b6] hover:text-[#1f2436]">
                            <svg viewBox="0 0 10 10" fill="currentColor" className="h-2.5 w-2.5">
                                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            </svg>
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Column list */}
            <div className="flex max-h-[280px] flex-col gap-0 overflow-y-auto py-1.5">
                {filtered.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-[#9aa4b6]">Tidak ada kolom ditemukan.</p>
                ) : filtered.map(col => {
                    const visible = visibleIds.includes(col.id);
                    return (
                        <button
                            key={col.id}
                            type="button"
                            onClick={() => onToggle(col.id)}
                            className="flex items-center gap-2.5 px-3 py-[7px] text-left text-sm text-[#1f2436] transition hover:bg-[#eef3fb]"
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

    const flatten = (nodes) => {
        let result = [];
        React.Children.forEach(nodes, (node) => {
            if (!node) return;
            if (node.type === React.Fragment) {
                result = result.concat(flatten(node.props.children));
            } else {
                result.push(node);
            }
        });
        return result;
    };

    const controlsArray = flatten(controls);

    const isDummyAction = (element) => {
        if (!React.isValidElement(element)) return false;

        const props = element.props || {};
        const key = String(element.key || '').toLowerCase();
        const icon = String(props.icon || '').toLowerCase();
        const id = String(props.id || props.action?.id || '').toLowerCase();
        const label = String(props.label || props.action?.label || '').toLowerCase();

        const dummyKeys = ['download', 'print', 'settings', 'cog', 'columns'];
        const dummyIcons = ['download', 'print', 'settings', 'cog', 'columns'];
        const dummyIds = [
            'download',
            'print',
            'settings',
            'cog',
            'columns',
            'arrange-columns',
            'download-excel',
            'share-link',
        ];
        const dummyLabels = [
            'unduh',
            'cetak',
            'pengaturan',
            'download',
            'print',
            'settings',
            'cog',
            'kolom',
            'tampilan',
        ];

        return (
            dummyKeys.some(dk => key.includes(dk)) ||
            dummyIcons.some(di => icon.includes(di)) ||
            dummyIds.some(di => id === di || id.includes(di)) ||
            dummyLabels.some(dl => label.includes(dl))
        );
    };

    const cleaned = controlsArray.filter(child => !isDummyAction(child));
    return cleaned.length > 0 ? cleaned : null;
}

function hasFunnelButton(node) {
    if (!node) return false;
    if (React.isValidElement(node)) {
        const type = node.type;
        const typeName = typeof type === 'function' ? (type.name || type.displayName || '') : (typeof type === 'string' ? type : '');
        const ariaLabel = String(node.props?.['aria-label'] || '').toLowerCase();
        
        if (
            typeName === 'FunnelIcon' ||
            typeName.toLowerCase().includes('filter') ||
            ariaLabel.includes('filter') ||
            node.props?.icon?.type?.name === 'FunnelIcon'
        ) {
            return true;
        }
        if (node.props?.children) {
            return React.Children.toArray(node.props.children).some(child => hasFunnelButton(child));
        }
    }
    if (Array.isArray(node)) {
        return node.some(child => hasFunnelButton(child));
    }
    return false;
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
    const resolvedResourceName = resourceName ?? activeTableState?.resource ?? (typeof window !== 'undefined' ? window.__activePageId : null) ?? null;

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

                 showSuccessToast({
                    message: response.data?.message || 'Berhasil mengimpor data.',
                });
                if (typeof onRefresh === 'function') {
                    onRefresh();
                } else if (typeof refreshButton?.onClick === 'function') {
                    refreshButton.onClick();
                }
            } catch (err) {
                const msg = err.response?.data?.message || err.message || 'Gagal mengimpor data.';
                showErrorToast({
                    message: msg,
                });
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
                    <div className="flex w-full flex-wrap items-center gap-2">
                        {filters}
                        {!hasFunnelButton(filters) && (
                            <button
                                type="button"
                                className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0] transition hover:bg-[#cbe3ff]"
                                aria-label="Filter"
                            >
                                <FunnelIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
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

                    {(menuButton || resolvedColumnSettings) ? (
                        <ToolbarSettingsMenu
                            menuButton={menuButton ?? null}
                            columnSettings={resolvedColumnSettings}
                            sizeStyle={sizeStyle}
                        />
                    ) : null}

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
