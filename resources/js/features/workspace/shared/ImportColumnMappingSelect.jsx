import React from 'react';

export default function ImportColumnMappingSelect({ label, fieldKey, mapping, setMapping, csvHeaders, defaultLabel = '-- Pilih Kolom --' }) {
    return (
        <div>
            <label className="block text-xs font-normal text-slate-600 mb-1">{label}</label>
            <select
                value={mapping[fieldKey]}
                onChange={(e) => setMapping(prev => ({ ...prev, [fieldKey]: parseInt(e.target.value) }))}
                className="w-full h-[32px] rounded-[4px] border border-ui-border px-2 text-xs outline-none focus:border-import-action-blue"
            >
                <option value="-1">{defaultLabel}</option>
                {csvHeaders.map((header, idx) => (
                    <option key={idx} value={idx}>{header}</option>
                ))}
            </select>
        </div>
    );
}
