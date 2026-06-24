import React from 'react';
import Tooltip from '@/components/ui/Tooltip';
import { ExternalLinkIcon } from '@/features/workspace/shared/Icons';
import { exportToExcelXML } from '../exportUtils';

export default function ToolbarExportSplitButton({ exportConfig, sizeStyle, visibleColumnIds }) {
    const rows = exportConfig.rows ?? [];
    const disabled = rows.length === 0;

    function handleExport() {
        if (disabled) return;

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
        exportToExcelXML(columns, rows, filename);
    }

    return (
        <Tooltip content={disabled ? 'Tidak ada data untuk diekspor' : 'Ekspor data'} portal>
            <button
                type="button"
                disabled={disabled}
                onClick={handleExport}
                className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] transition ${
                    disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-300 text-gray-400' : 'hover:bg-[#e8f2ff]'
                } ${sizeStyle.utilityButton}`.trim()}
                aria-label="Ekspor data"
            >
                <ExternalLinkIcon className="h-4 w-4 text-current" />
            </button>
        </Tooltip>
    );
}
