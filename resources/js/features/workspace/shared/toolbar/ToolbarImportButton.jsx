import React, { useState, useRef } from 'react';
import ToolbarIconButton from './ToolbarIconButton';
import { LoadingIcon, UploadIcon } from '@/features/workspace/shared/Icons';
import { importFromFile } from '../exportUtils';

export default function ToolbarImportButton({ importConfig, sizeStyle }) {
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
            // abaikan error
        } finally {
            setLoading(false);
            // reset pilihan file
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
                className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] transition hover:bg-[#e8f2ff] ${sizeStyle.utilityButton} ${loading ? 'pointer-events-none opacity-70' : ''}`.trim()}
            >
                {loading
                    ? <LoadingIcon className="h-4 w-4 animate-spin" />
                    : <UploadIcon className="h-4 w-4" />
                }
            </ToolbarIconButton>
        </>
    );
}
