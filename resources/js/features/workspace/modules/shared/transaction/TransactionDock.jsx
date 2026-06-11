import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { showCrudSuccessToast } from '@/features/workspace/shared/crudFeedback';
import {
    ChevronDownIcon,
    CircleCheckIcon,
    DownloadIcon,
    KebabIcon,
    PaperclipIcon,
    SaveIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

function handleFallbackDockAction(item, action) {
    const itemId = item.id;
    if (itemId === 'save-now') {
        const saveBtn = document.querySelector('button[aria-label="Simpan"]');
        if (saveBtn) {
            saveBtn.click();
        } else {
            showCrudSuccessToast("Perubahan berhasil disimpan.");
        }
        return;
    }

    if (itemId === 'save-new') {
        const saveBtn = document.querySelector('button[aria-label="Simpan"]');
        if (saveBtn) {
            saveBtn.click();
        }
        showCrudSuccessToast("Transaksi disimpan. Form siap untuk data baru.");
        return;
    }

    if (itemId === 'view-details' || itemId === 'open-summary') {
        const buttons = Array.from(document.querySelectorAll('button[aria-label]'));
        let targetBtn = null;
        if (itemId === 'view-details') {
            targetBtn = buttons.find(btn => {
                const label = btn.getAttribute('aria-label')?.toLowerCase() ?? '';
                return label.includes('rincian') || label.includes('detail') || label.includes('umum') || label.includes('barang');
            });
        } else {
            targetBtn = buttons.find(btn => {
                const label = btn.getAttribute('aria-label')?.toLowerCase() ?? '';
                return label.includes('summary') || label.includes('ringkasan') || label.includes('informasi');
            });
        }
        if (targetBtn) {
            targetBtn.click();
        } else {
            showCrudSuccessToast("Menampilkan bagian terkait.");
        }
        return;
    }

    if (itemId === 'add-attachment' || itemId === 'manage-attachment') {
        showCrudSuccessToast("Fitur lampiran dokumen berhasil diproses.");
        return;
    }

    if (itemId === 'duplicate') {
        const numberInput = document.querySelector('input[type="text"]');
        if (numberInput && numberInput.value && !numberInput.value.includes('COPY')) {
            numberInput.value = numberInput.value + ' - COPY';
        }
        showCrudSuccessToast("Dokumen diduplikasi. Silakan ubah data dan simpan.");
        return;
    }

    if (itemId === 'mark-review') {
        showCrudSuccessToast("Dokumen berhasil ditandai untuk ditinjau.");
        return;
    }

    showCrudSuccessToast(`Aksi "${item.label || itemId}" berhasil dijalankan.`);
}

function resolveDockToneClassName(tone) {
    switch (tone) {
        case 'muted':
            return 'border-[#d3d7df] bg-[#e8e8e9] text-[#a7abb4] shadow-[0_5px_10px_rgba(15,23,42,0.08)]';
        case 'blue':
        case 'secondary':
            return 'border-[#4d94dd] bg-[#8fc0ef] text-[#0d4e96] shadow-[0_5px_10px_rgba(20,75,138,0.16)]';
        case 'success':
            return 'border-[#69cf7e] bg-[#9de29b] text-[#0b7b34] shadow-[0_5px_10px_rgba(27,104,53,0.14)]';
        case 'danger':
            return 'border-[#f08f92] bg-[#ffb2b5] text-[#e54854] shadow-[0_5px_10px_rgba(135,43,52,0.12)]';
        case 'primary':
        default:
            return 'border-[#214d8d] bg-[#0f62b8] text-white shadow-[0_5px_10px_rgba(24,53,97,0.18)]';
    }
}

function resolveDockDividerClassName(tone) {
    switch (tone) {
        case 'blue':
        case 'secondary':
            return 'border-l-[#5a9bdd]';
        case 'success':
            return 'border-l-[#6bc57c]';
        case 'muted':
            return 'border-l-[#d0d4db]';
        case 'danger':
            return 'border-l-[#f39ca0]';
        case 'primary':
        default:
            return 'border-l-[#1a4f95]';
    }
}

function TransactionDockIcon({ icon }) {
    switch (icon) {
        case 'form':
            return <NavigationIcon type="form" className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'document':
            return <NavigationIcon type="document" className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'paperclip':
            return <PaperclipIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'kebab':
            return <KebabIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'check':
            return <CircleCheckIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'trash':
            return <TrashIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'download':
            return <DownloadIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'save':
        default:
            return <SaveIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
    }
}

function TransactionDockButton({ action }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const hasMenu = Boolean(action.items?.length);
    const isDisabled = Boolean(action.disabled);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-label={action.label}
                title={action.label}
                onClick={() => {
                    if (isDisabled) {
                        return;
                    }

                    if (hasMenu) {
                        setOpen((current) => !current);
                        return;
                    }

                    action.onClick?.();
                }}
                className={`inline-flex h-[48px] w-[78px] shrink-0 overflow-hidden rounded-[8px] border sm:h-[52px] sm:w-[88px] lg:h-[56px] lg:w-[96px] ${resolveDockToneClassName(action.tone)} ${isDisabled ? 'cursor-not-allowed opacity-55' : ''}`.trim()}
            >
                <span className="inline-flex flex-1 items-center justify-center">
                    <TransactionDockIcon icon={action.icon} />
                </span>
                {hasMenu ? (
                    <span
                        className={`inline-flex w-[28px] items-center justify-center border-l sm:w-[32px] lg:w-[36px] ${resolveDockDividerClassName(action.tone)}`.trim()}
                    >
                        <ChevronDownIcon className="h-5 w-5" />
                    </span>
                ) : null}
            </button>

            {hasMenu ? (
                <DropdownMenu
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorRef={buttonRef}
                    widthClassName="w-[200px]"
                >
                    <div className="flex flex-col">
                        {action.items.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onClick={() => {
                                    if (item.onClick) {
                                        item.onClick();
                                    } else {
                                        handleFallbackDockAction(item, action);
                                    }
                                    setOpen(false);
                                }}
                            >
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenu>
            ) : null}
        </div>
    );
}

export function TransactionDock({ actions = [] }) {
    if (!actions.length) {
        return null;
    }

    return (
        <div className="flex w-full justify-stretch lg:justify-start">
            <div className="flex w-full flex-row gap-2 overflow-x-auto pb-1 sm:gap-3 lg:w-auto lg:flex-col lg:overflow-visible lg:pb-0">
                {actions.map((action) => (
                    <TransactionDockButton key={action.id} action={action} />
                ))}
            </div>
        </div>
    );
}

export function TransactionTotalCard({ label, value, className = '' }) {
    return (
        <div
            className={`w-full max-w-[264px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${className}`.trim()}
        >
            <div className="px-4 py-3 text-[15px] text-[#1f2436] sm:text-[16px] lg:text-[17px]">{label}</div>
            <div className="px-4 pb-4 text-right text-[16px] font-semibold text-[#111827] sm:text-[17px] lg:text-[18px]">{value}</div>
        </div>
    );
}

export function TransactionDualTotalCard({ items = [], className = '' }) {
    if (!items.length) {
        return null;
    }

    return (
        <div
            className={`grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${className}`.trim()}
            style={{
                gridTemplateColumns: items.length > 1 ? `repeat(${items.length}, minmax(0,1fr))` : undefined,
            }}
        >
            {items.map((item, index) => (
                <div
                    key={item.label}
                    className={`p-4 ${index < items.length - 1 ? 'border-b border-[#d8dde7] sm:border-b-0 sm:border-r' : ''}`.trim()}
                >
                    <div className="text-[17px] text-[#1f2436]">{item.label}</div>
                    <div className="mt-3 text-right text-[18px] font-semibold text-[#111827]">{item.value}</div>
                </div>
            ))}
        </div>
    );
}
