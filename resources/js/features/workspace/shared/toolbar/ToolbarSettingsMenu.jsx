import React, { useState, useEffect, useRef } from 'react';
import Tooltip from '@/components/ui/Tooltip';
import { ChevronDownIcon, CogIcon, SearchIcon } from '@/features/workspace/shared/Icons';

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
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[240px] rounded-[4px] border border-chart-border bg-white shadow-menu-dropdown overflow-hidden"
        >
            <div className="px-2 pt-2 pb-1.5 border-b border-table-row-border">
                <div className="flex items-center gap-1.5 rounded-[4px] border border-border-info-card bg-bg-info-card px-2.5 py-1.5">
                    <SearchIcon className="h-3.5 w-3.5 shrink-0 text-blue-94a3b8" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari..."
                        className="min-w-0 flex-1 bg-transparent text-sm text-brand-dark placeholder-placeholder-input-alt outline-none"
                        autoFocus
                    />
                    {search ? (
                        <button type="button" onClick={() => setSearch('')} className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-blue-94a3b8 hover:text-brand-dark">
                            <svg viewBox="0 0 10 10" fill="currentColor" className="h-2.5 w-2.5">
                                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            </svg>
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="flex max-h-[280px] flex-col gap-0 overflow-y-auto py-1.5">
                {filtered.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-blue-94a3b8">Tidak ada kolom ditemukan.</p>
                ) : filtered.map(col => {
                    const visible = visibleIds.includes(col.id);
                    const originalIndex = columns.findIndex(c => c.id === col.id);
                    const isCrucial = originalIndex < 2;
                    const toggleableVisibleCount = columns.filter(c => visibleIds.includes(c.id)).length;
                    const cannotUncheck = isCrucial || (visible && toggleableVisibleCount <= 2);
                    return (
                        <button
                            key={col.id}
                            type="button"
                            onClick={() => {
                                if (cannotUncheck) return;
                                onToggle(col.id);
                            }}
                            className={`flex items-center gap-2.5 px-3 py-[7px] text-left text-sm text-brand-dark transition ${
                                cannotUncheck ? 'cursor-not-allowed opacity-50' : 'hover:bg-workspace-hover-bg'
                            }`.trim()}
                        >
                            <span
                                className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border transition ${
                                    visible
                                        ? 'border-brand-blue bg-brand-blue text-white'
                                        : 'border-border-input-hover-alt bg-white'
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

export default function ToolbarSettingsMenu({ menuButton, columnSettings, sizeStyle }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    const colSettings = columnSettings;
    const hasColumns = colSettings?.columns?.length > 0;

    if (!menuButton && !hasColumns) return null;

    return (
        <div ref={buttonRef} className="relative">
            <Tooltip content={menuButton?.label ?? 'Pengaturan kolom'} portal>
                <button
                    type="button"
                    onClick={() => setOpen(c => !c)}
                    className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-2 text-brand-blue transition hover:bg-brand-blue-light ${sizeStyle.menuButton} ${menuButton?.buttonClassName ?? ''}`.trim()}
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
