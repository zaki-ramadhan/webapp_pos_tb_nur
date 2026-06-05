import { useEffect, useMemo, useState } from 'react';

import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import EmptyState from '@/components/ui/EmptyState';
import { CloseIcon } from '@/features/workspace/shared/Icons';

function LibraryIcon({ type }) {
    const className = 'h-9 w-9 shrink-0';

    switch (type) {
        case 'activity':
            return (
                <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
                    <rect x="4" y="4" width="40" height="40" rx="8" fill="#d7f0fb" stroke="#52b9e9" strokeWidth="2" />
                    <rect x="13" y="12" width="18" height="4" rx="2" fill="#52b9e9" />
                    <rect x="13" y="20" width="10" height="4" rx="2" fill="#7dcdf0" />
                    <rect x="13" y="28" width="14" height="4" rx="2" fill="#7dcdf0" />
                    <rect x="13" y="36" width="8" height="4" rx="2" fill="#7dcdf0" />
                    <rect x="33" y="12" width="3" height="28" rx="1.5" fill="#52b9e9" />
                </svg>
            );
        case 'cash-flow':
            return (
                <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
                    <rect x="4" y="4" width="40" height="40" rx="8" fill="#ffe7d6" stroke="#ff883d" strokeWidth="2" />
                    <rect x="13" y="16" width="5" height="18" rx="2" fill="#ff883d" />
                    <rect x="21.5" y="11" width="5" height="23" rx="2" fill="#ffb57a" />
                    <rect x="30" y="20" width="5" height="14" rx="2" fill="#ff883d" />
                    <path fill="#ff883d" d="M11 37.5h26v2H11z" />
                </svg>
            );
        case 'asset':
            return (
                <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
                    <rect x="4" y="4" width="40" height="40" rx="8" fill="#eef9d5" stroke="#8bc72f" strokeWidth="2" />
                    <circle cx="24" cy="24" r="10.5" fill="none" stroke="#8bc72f" strokeWidth="3" />
                    <circle cx="24" cy="24" r="3.5" fill="#8bc72f" />
                    <path fill="#8bc72f" d="M24 10h2v6h-2zm0 22h2v6h-2zM10 23h6v2h-6zm22 0h6v2h-6z" />
                </svg>
            );
        case 'stock':
            return (
                <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
                    <rect x="4" y="4" width="40" height="40" rx="8" fill="#d7f0fb" stroke="#52b9e9" strokeWidth="2" />
                    <rect x="12" y="10" width="24" height="28" rx="4" fill="none" stroke="#52b9e9" strokeWidth="3" />
                    <rect x="17" y="16" width="14" height="3.5" rx="1.75" fill="#7dcdf0" />
                    <rect x="17" y="23" width="14" height="3.5" rx="1.75" fill="#7dcdf0" />
                    <rect x="17" y="30" width="10" height="3.5" rx="1.75" fill="#7dcdf0" />
                </svg>
            );
        case 'expense':
            return (
                <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
                    <rect x="4" y="4" width="40" height="40" rx="8" fill="#ffe7d6" stroke="#ff883d" strokeWidth="2" />
                    <rect x="12" y="26" width="6" height="10" rx="2" fill="#ff883d" />
                    <rect x="21" y="18" width="6" height="18" rx="2" fill="#ffb57a" />
                    <rect x="30" y="12" width="6" height="24" rx="2" fill="#ff883d" />
                </svg>
            );
        default:
            return null;
    }
}

export default function WidgetLibraryModal({ open, modal, onClose, onSelectItem }) {
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        if (!open) {
            setKeyword('');
        }
    }, [open]);

    const filteredItems = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return modal.items;
        }

        return modal.items.filter((item) => {
            const haystack = `${item.title} ${item.description}`.toLowerCase();
            return haystack.includes(normalizedKeyword);
        });
    }, [keyword, modal.items]);

    return (
        <ModalBase
            open={open}
            className="bg-[rgba(22,31,52,0.62)]"
            panelClassName="max-w-[676px] overflow-hidden rounded-[6px] px-0 py-0 shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
        >
            <div className="border-b border-[#0f366d] bg-[#163a6d] px-4 py-2 text-white">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-[16px] font-medium">{modal.title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-white/90"
                        aria-label={modal.closeLabel}
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-4 py-4">
                <TextInput
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder={modal.searchPlaceholder}
                    className="h-[34px] max-w-[316px] rounded-[4px]"
                    inputClassName="text-[15px]"
                />

                <div className="mt-3 h-[400px] overflow-y-auto rounded-[4px] border border-[#d7dde8]">
                    {filteredItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectItem?.(item)}
                            className="flex w-full items-start gap-4 border-b border-[#edf1f6] px-5 py-3.5 text-left transition-colors duration-100 hover:bg-[#f8fafc]"
                        >
                            <LibraryIcon type={item.icon} />
                            <span className="min-w-0">
                                <span className="block text-[17px] font-medium leading-6 text-[#1f2536]">
                                    {item.title}
                                </span>
                                <span className="mt-1 block text-[13px] leading-5 text-[#7a8198]">
                                    {item.description}
                                </span>
                            </span>
                        </button>
                    ))}

                    {!filteredItems.length ? (
                        <div className="flex h-full min-h-[400px] items-center justify-center">
                            {keyword.trim() ? (
                                <EmptyState
                                    title="Tidak ada hasil"
                                    description={modal.emptyLabel}
                                    iconName="search"
                                    size="sm"
                                    tone="subtle"
                                    className="bg-transparent px-0 py-0"
                                    titleClassName="text-[16px] font-medium text-[#6b738f]"
                                    descriptionClassName="mt-2 text-[13px] leading-5 text-[#8a91a8]"
                                />
                            ) : (
                                <EmptyState
                                    title="Semua Widget Aktif"
                                    description="Semua pilihan widget sudah Anda tambahkan ke dashboard."
                                    iconName="document"
                                    size="sm"
                                    tone="subtle"
                                    className="bg-transparent px-0 py-0"
                                    titleClassName="text-[16px] font-medium text-[#6b738f]"
                                    descriptionClassName="mt-2 text-[13px] leading-5 text-[#8a91a8]"
                                />
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </ModalBase>
    );
}
