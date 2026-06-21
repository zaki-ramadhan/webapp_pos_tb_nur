import React, { useState, useRef } from 'react';
import Tooltip from '@/components/ui/Tooltip';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon, DownloadIcon } from '@/features/workspace/shared/Icons';
import { exportToCSV, exportToExcelXML } from '../exportUtils';
import { showWarningToast } from '@/components/feedback/toast';

export default function ToolbarExportSplitButton({ exportConfig, sizeStyle, visibleColumnIds }) {
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

        const allColumns = exportConfig.columns ?? [];
        const columns = allColumns.filter(col => {
            if (!col) return false;
            if (col.kind === 'spacer' || col.id === 'actions') return false;
            if (visibleColumnIds && visibleColumnIds.length > 0) {
                return visibleColumnIds.includes(col.id);
            }
            return true;
        });

        const filename = exportConfig.filename ?? 'export';

        if (type === 'csv') {
            exportToCSV(columns, rows, filename);
        } else if (type === 'excel') {
            exportToExcelXML(columns, rows, filename);
        }

        setOpen(false);
    }

    return (
        <div className="relative">
            <Tooltip content={disabled ? 'Tidak ada data untuk diekspor' : 'Ekspor data'} portal>
                <button
                    ref={buttonRef}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        if (disabled) return;
                        setOpen(current => !current);
                    }}
                    className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] transition ${
                        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-300 text-gray-400' : 'hover:bg-[#e8f2ff]'
                    } ${sizeStyle.menuButton}`.trim()}
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
                </div>
            </DropdownMenu>
        </div>
    );
}
