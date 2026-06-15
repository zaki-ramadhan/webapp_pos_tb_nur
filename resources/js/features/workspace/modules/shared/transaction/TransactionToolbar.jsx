import { useEffect, useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import Tooltip from '@/components/ui/Tooltip';
import { tableRegistry, useColumnVisibility, getTableSchemaKey, cleanHeaderLabel } from '@/features/workspace/shared/columnVisibility';

export function TransactionToolbarIconButton({ label, children, className = '' }) {
    return (
        <Tooltip content={label} portal>
            <button
                type="button"
                aria-label={label}
                className={`inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${className}`.trim()}
            >
                {children}
            </button>
        </Tooltip>
    );
}

export function TransactionToolbarSplitButton({ label, icon, items = [] }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <Tooltip content={label} portal>
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setOpen((current) => !current)}
                    className="inline-flex h-[34px] shrink-0 overflow-hidden rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    aria-label={label}
                >
                    <span className="inline-flex w-[36px] items-center justify-center">{icon}</span>
                    <span className="inline-flex w-[28px] items-center justify-center border-l border-l-[#7aa2d5]">
                        <ChevronDownIcon className="h-4 w-4" />
                    </span>
                </button>
            </Tooltip>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[180px]"
            >
                <div className="flex flex-col">
                    {items.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => {
                                item.onClick?.();
                                setOpen(false);
                            }}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

/**
 * Tombol pengaturan kolom tabel.
 */
export function TransactionToolbarSettingsButton({ label = 'Pengaturan kolom', icon, columns: columnsProp }) {
    const [open, setOpen] = useState(false);
    const [activeTableState, setActiveTableState] = useState(() => tableRegistry.activeTable);
    const buttonRef = useRef(null);

    useEffect(() => {
        return tableRegistry.subscribe((state) => setActiveTableState(state));
    }, []);

    const rawColumns = columnsProp ?? activeTableState?.columns ?? [];
    const columns = rawColumns
        .map(col => col ? { ...col, label: cleanHeaderLabel(col.label) } : col)
        .filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);

    const schemaKey = getTableSchemaKey(columns);
    const [visibleIds, setVisibleIds] = useColumnVisibility(schemaKey, columns);

    if (!columns.length) return null;

    return (
        <div ref={buttonRef} className="relative">
            <Tooltip content={label} portal>
                <button
                    type="button"
                    onClick={() => setOpen(c => !c)}
                    className="inline-flex h-[34px] shrink-0 overflow-hidden rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    aria-label={label}
                >
                    <span className="inline-flex w-[36px] items-center justify-center">{icon}</span>
                    <span className="inline-flex w-[28px] items-center justify-center border-l border-l-[#7aa2d5]">
                        <ChevronDownIcon className="h-4 w-4" />
                    </span>
                </button>
            </Tooltip>

            {open ? (
                <TransactionColumnSettingsPanel
                    anchorRef={buttonRef}
                    columns={columns}
                    visibleIds={visibleIds}
                    onToggle={(id) =>
                        setVisibleIds(prev =>
                            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
                        )
                    }
                    onClose={() => setOpen(false)}
                />
            ) : null}
        </div>
    );
}

function TransactionColumnSettingsPanel({ anchorRef, columns, visibleIds, onToggle, onClose }) {
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
            {}
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

            {}
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
