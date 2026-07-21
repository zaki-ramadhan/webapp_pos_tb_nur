import React from 'react';

export default function DocumentStamp({ label, tone = 'blue', className = '' }) {
    const normalizedLabel = (label || '').replace(/\s+/g, ' ').trim().toUpperCase();
    const isBelumLunas = normalizedLabel === 'BELUM LUNAS';
    const isLunas = normalizedLabel === 'LUNAS';

    if (isBelumLunas) {
        return (
            <img
                src="/assets/images/belum_lunas_stamp.svg"
                alt="Belum Lunas"
                className={`pointer-events-none absolute select-none w-[136px] h-[136px] ${className}`.trim()}
            />
        );
    }

    if (isLunas) {
        return (
            <img
                src="/assets/images/lunas.svg"
                alt="Lunas"
                className={`pointer-events-none absolute select-none w-[136px] h-[136px] ${className}`.trim()}
            />
        );
    }

    const toneClassName =
        tone === 'gray'
            ? 'border-border-badge-neutral text-text-badge-neutral'
            : tone === 'green' || tone === 'success'
              ? 'border-status-success-badge-border text-status-success-badge-text'
              : 'border-blue-80 text-blue-80';

    return (
        <div
            className={`pointer-events-none absolute flex h-[98px] w-[144px] rotate-[-18deg] items-center justify-center opacity-55 ${className}`.trim()}
        >
            <div
                className={`relative flex h-[82px] w-[82px] items-center justify-center rounded-full border-[4px] ${toneClassName}`.trim()}
            >
                <div className={`absolute h-[96px] w-[96px] rounded-full border-[2px] ${toneClassName}`.trim()} />
            </div>
            <div
                className={`absolute whitespace-pre-line rounded-[3px] border-[3px] bg-white px-3 py-1 text-center text-sm font-semibold leading-[1.05] tracking-[0.12em] ${toneClassName}`.trim()}
            >
                {label}
            </div>
        </div>
    );
}
