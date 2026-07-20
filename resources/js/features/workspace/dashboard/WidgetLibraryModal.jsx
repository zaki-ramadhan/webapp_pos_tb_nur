import { useEffect, useMemo, useState } from 'react';
import { Activity, TrendingUp, Layers, Package, Landmark, ListChecks } from 'lucide-react';

import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import EmptyState from '@/components/ui/EmptyState';
import { CloseIcon } from '@/features/workspace/shared/Icons';

function LibraryIcon({ type }) {
    let iconElement;
    let containerClass = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border ';

    switch (type) {
        case 'activity':
            iconElement = <Activity className="h-5 w-5 text-sky-500" strokeWidth={2} />;
            containerClass += 'border-sky-200 bg-[linear-gradient(180deg,#f0f9ff_0%,#e0f2fe_100%)]';
            break;
        case 'cash-flow':
            iconElement = <TrendingUp className="h-5 w-5 text-amber-500" strokeWidth={2} />;
            containerClass += 'border-amber-200 bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)]';
            break;
        case 'asset':
            iconElement = <Layers className="h-5 w-5 text-indigo-500" strokeWidth={2} />;
            containerClass += 'border-indigo-200 bg-[linear-gradient(180deg,#eef2ff_0%,#e0e7ff_100%)]';
            break;
        case 'stock':
            iconElement = <Package className="h-5 w-5 text-teal-500" strokeWidth={2} />;
            containerClass += 'border-teal-200 bg-[linear-gradient(180deg,#f0fdf4_0%,#dcfce7_100%)]';
            break;
        case 'expense':
            iconElement = <Landmark className="h-5 w-5 text-rose-500" strokeWidth={2} />;
            containerClass += 'border-rose-200 bg-[linear-gradient(180deg,#fff1f2_0%,#ffe4e6_100%)]';
            break;
        default:
            iconElement = null;
    }

    if (!iconElement) return null;

    return (
        <div className={containerClass} aria-hidden="true">
            {iconElement}
        </div>
    );
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
            onBackdropClick={onClose}
            className="bg-modal-overlay-light"
            panelClassName="max-w-[676px] overflow-hidden rounded-[6px] px-0 py-0 shadow-modal-dialog"
        >
            <div className="border-b border-illustration-danger-border bg-illustration-danger-border px-4 py-2.5 text-white">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-sm font-medium">{modal.title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-white/90 cursor-pointer"
                        aria-label={modal.closeLabel}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-4 py-4">
                <TextInput
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder={modal.searchPlaceholder}
                    className="h-[34px] max-w-[316px] rounded-[4px]"
                    inputClassName="text-xs sm:text-sm"
                />

                <div className={`mt-3 h-[400px] overflow-y-auto rounded-[4px] border border-ui-border-medium [scrollbar-width:thin] ${
                    filteredItems.length > 0
                        ? 'grid grid-cols-1 sm:grid-cols-2 auto-rows-max gap-1 p-1'
                        : 'flex flex-col items-center justify-center p-1'
                }`}>
                    {filteredItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectItem?.(item)}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-100 hover:bg-ui-bg-hover rounded-[6px] min-w-0"
                        >
                            <LibraryIcon type={item.icon} />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs sm:text-sm font-medium text-brand-darker">
                                    {item.title}
                                </span>
                                <span className="mt-1 block truncate text-[13px] text-text-light">
                                    {item.description}
                                </span>
                            </span>
                        </button>
                    ))}

                    {!filteredItems.length ? (
                        keyword.trim() ? (
                            <EmptyState
                                title="Tidak ada hasil"
                                description={modal.emptyLabel}
                                icon={<ListChecks className="h-12 w-12 text-slate-400" strokeWidth={1.25} />}
                                size="sm"
                                tone="subtle"
                                className="bg-transparent px-0 py-0"
                                titleClassName="text-base font-medium text-text-muted"
                                descriptionClassName="mt-2 text-sm leading-5 text-text-light"
                            />
                        ) : (
                            <EmptyState
                                title="Semua Widget Aktif"
                                description="Semua pilihan widget sudah Anda tambahkan ke dashboard."
                                icon={<ListChecks className="h-12 w-12 text-slate-400" strokeWidth={1.25} />}
                                size="sm"
                                tone="subtle"
                                className="bg-transparent px-0 py-0"
                                titleClassName="text-base font-medium text-text-muted"
                                descriptionClassName="mt-2 text-sm leading-5 text-text-light"
                            />
                        )
                    ) : null}
                </div>
            </div>
        </ModalBase>
    );
}
