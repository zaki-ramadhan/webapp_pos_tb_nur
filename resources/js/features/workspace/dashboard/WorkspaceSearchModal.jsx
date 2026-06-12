import { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';

import EmptyState from '@/components/ui/EmptyState';
import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import implementedWorkspacePageIds from '@/features/workspace/shared/implementedWorkspacePageIds';
import {
    isWorkspacePageInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';
import { CloseIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function resolveToneClassName(tone) {
    switch (tone) {
        case 'amber':
            return {
                border: 'border-[#ff9a4d]',
                icon: 'text-[#eb6f00]',
                hover: 'hover:bg-[#fff8f1]',
            };
        case 'green':
            return {
                border: 'border-[#61a84b]',
                icon: 'text-[#5b920f]',
                hover: 'hover:bg-[#f6fbf2]',
            };
        case 'purple':
            return {
                border: 'border-[#7b45c4]',
                icon: 'text-[#6a1fc4]',
                hover: 'hover:bg-[#fbf7ff]',
            };
        case 'blue':
        default:
            return {
                border: 'border-[#68b4f2]',
                icon: 'text-[#147ac7]',
                hover: 'hover:bg-[#f7fbff]',
            };
    }
}

function SearchMenuCard({ item, onSelect }) {
    const { props } = usePage();
    const preferences = props.dashboard?.preferences ?? {};
    const toneClassName = resolveToneClassName(item.tone);
    const isInactive = isWorkspacePageInactive(item.id, preferences);
    const isImplemented = item.implemented !== false || implementedWorkspacePageIds.has(item.id);
    const isSelectable = isImplemented && !isInactive;
    const className = isInactive
        ? 'border-[#f0d9a3] bg-[#fff8e9] text-[#9d7a24]'
        : isImplemented
          ? `${toneClassName.border} ${toneClassName.hover}`
          : 'border-[#d6d9e2] bg-[#eef0f4] text-[#9aa3b1] opacity-80 saturate-0';
    const iconClassName = isInactive ? 'text-[#b67d12]' : isImplemented ? toneClassName.icon : 'text-[#9aa3b1]';
    const labelClassName = isInactive ? 'text-[#7d6220]' : isImplemented ? 'text-[#495164]' : 'text-[#8f97a7]';
    const statusLabel = isInactive ? WORKSPACE_INACTIVE_HINT : isImplemented ? '' : 'Belum diimplementasikan penuh';

    return (
        <button
            type="button"
            onClick={() => {
                if (isSelectable) {
                    onSelect(item);
                }
            }}
            className={`flex min-h-[108px] flex-col items-center justify-center gap-2.5 rounded-[8px] border px-5 py-5 text-center transition ${
                isSelectable ? '' : 'cursor-not-allowed'
            } ${className}`.trim()}
            title={statusLabel || item.label}
            aria-disabled={!isSelectable}
        >
            <NavigationIcon type={item.icon} className={`h-7 w-7 ${iconClassName}`.trim()} strokeWidth={1.65} />
            <span className={`text-sm font-medium leading-5 ${labelClassName}`.trim()}>{item.label}</span>
            {statusLabel ? (
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] ${
                        isInactive ? 'bg-[#f6dfab] text-[#8b6511]' : 'bg-[#dde2ea] text-[#7d8698]'
                    }`.trim()}
                >
                    {isInactive ? WORKSPACE_INACTIVE_BADGE_LABEL : 'Draft'}
                </span>
            ) : null}
        </button>
    );
}

export default function WorkspaceSearchModal({
    open,
    modal,
    onClose,
    onSelectItem,
}) {
    const { props } = usePage();
    const preferences = props.dashboard?.preferences ?? {};
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        if (!open) {
            setKeyword('');
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose?.();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, open]);

    const filteredItems = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return modal.topItems ?? [];
        }

        return (modal.items ?? []).filter((item) => item.keywords.includes(normalizedKeyword));
    }, [keyword, modal.items, modal.topItems]);
    const firstSelectableItem = useMemo(
        () =>
            filteredItems.find((item) => {
                const isImplemented = item.implemented !== false || implementedWorkspacePageIds.has(item.id);
                return isImplemented && !isWorkspacePageInactive(item.id, preferences);
            }) ?? null,
        [filteredItems, preferences],
    );

    const sectionTitle = keyword.trim() ? modal.resultLabel ?? 'Hasil Pencarian' : modal.topLabel ?? 'Menu Teratas';

    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(22,31,52,0.62)]"
            panelClassName="max-w-[770px] overflow-hidden rounded-[6px] px-0 py-0 shadow-[0_16px_38px_rgba(15,23,42,0.22)]"
        >
            <div className="bg-white px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="w-full max-w-[360px]">
                        <TextInput
                            value={keyword}
                            autoFocus
                            onChange={(event) => setKeyword(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && firstSelectableItem) {
                                    onSelectItem(firstSelectableItem);
                                }
                            }}
                            placeholder={modal.searchPlaceholder ?? 'Cari...'}
                            trailing={<SearchIcon className="h-5.5 w-5.5 text-[#7b859c]" />}
                            className="h-[50px] rounded-[20px] border-[#5a9ae5] shadow-[0_0_0_3px_rgba(90,154,229,0.12)]"
                            inputClassName="text-lg text-[#1f2436]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-[#1f2436] transition hover:bg-[#f4f6fa]"
                        aria-label={modal.closeLabel ?? 'Tutup pencarian menu'}
                        title={modal.closeLabel ?? 'Tutup pencarian menu'}
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4 sm:mt-6">
                    <h2 className="text-center text-base font-semibold text-[#20263a]">{sectionTitle}</h2>

                    {filteredItems.length ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {filteredItems.map((item) => (
                                <SearchMenuCard key={item.id} item={item} onSelect={onSelectItem} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            bordered
                            tone="subtle"
                            size="sm"
                            iconName="search"
                            title="Tidak ada hasil"
                            description={modal.emptyLabel ?? 'Tidak ada menu yang cocok dengan kata kunci tersebut.'}
                            className="mt-6 rounded-[8px] border-[#d6dce8] px-6 py-8"
                            titleClassName="text-base font-medium text-[#59637b]"
                            descriptionClassName="mt-2 text-sm leading-5 text-[#778099]"
                        />
                    )}
                </div>
            </div>
        </ModalBase>
    );
}
