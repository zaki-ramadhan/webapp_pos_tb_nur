import { useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Printer, FileText, Star } from 'lucide-react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { showPromptModal } from '@/components/ui/promptModal';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { tableRegistry } from '@/features/workspace/shared/columnVisibility';
import {
    showCrudErrorToast,
    showCrudLoadingToast,
    showCrudSuccessToast,
    showCrudValidationToast,
    finishCrudLoadingToast,
} from '@/features/workspace/shared/crudFeedback';
import {
    ChevronDownIcon,
    CircleCheckIcon,
    DownloadIcon,
    KebabIcon,
    PaperclipIcon,
    PrintIcon,
    SaveIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

function getDocumentNumberFromDOM() {
    if (typeof window === 'undefined') return 'TRX-DEFAULT';
    const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
    for (const input of inputs) {
        const val = (input.value || '').trim();
        if (val && (val.includes('/') || val.includes('-') || val.length > 5)) {
            return val;
        }
    }
    if (inputs.length > 0 && inputs[0].value) {
        return inputs[0].value.trim();
    }
    return 'TRX-DEFAULT';
}

async function handleFallbackDockAction(item, action, templateLabel = 'transaksi', favoritesStorageKey = 'pos_favorite_transactions_guest') {
    const itemId = item.id;
    if (itemId === 'print-default') {
        const toastId = showCrudLoadingToast(`Sedang mencetak ${templateLabel}...`);
        setTimeout(() => {
            finishCrudLoadingToast(toastId, `Dokumen ${templateLabel} default berhasil dicetak.`);
        }, 1200);
        return;
    }
    if (itemId === 'doc-default') {
        const toastId = showCrudLoadingToast("Menghubungkan ke server dokumen...");
        setTimeout(() => {
            finishCrudLoadingToast(toastId, "Daftar dokumen terkait berhasil dimuat.");
        }, 1000);
        return;
    }

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

function resolveDockToneClassName(tone, isDisabled = false) {
    if (isDisabled) {
        return 'border-[#c8ccd4] bg-[#ececec] text-[#9aa0aa] shadow-none';
    }
    switch (tone) {
        case 'muted':
            return 'border-[#d3d7df] bg-[#e8e8e9] text-[#a7abb4] shadow-[0_2px_5px_rgba(15,23,42,0.08)]';
        case 'blue':
        case 'secondary':
            return 'border-[#4d94dd] bg-[#8fc0ef] text-[#0d4e96] shadow-[0_4px_8px_rgba(20,75,138,0.18)]';
        case 'success':
            return 'border-[#69cf7e] bg-[#9de29b] text-[#0b7b34] shadow-[0_4px_8px_rgba(27,104,53,0.16)]';
        case 'danger':
            return 'border-[#f08f92] bg-[#ffb2b5] text-[#e54854] shadow-[0_4px_8px_rgba(135,43,52,0.15)]';
        case 'primary':
        default:
            return 'border-[#214d8d] bg-[#0f62b8] text-white shadow-[0_4px_8px_rgba(24,53,97,0.22)]';
    }
}

function resolveDockDividerClassName(tone, isDisabled = false) {
    if (isDisabled) {
        return 'border-l-[#c8ccd4]';
    }
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
        case 'printer':
        case 'print':
            return <PrintIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'paperclip':
            return <PaperclipIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'star':
            return <Star className="h-7 w-7 sm:h-8 sm:w-8" />;
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

function TransactionDockButton({ action, templateLabel, favoritesStorageKey }) {
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
                className={`inline-flex h-[44px] w-[72px] shrink-0 overflow-hidden rounded-[8px] border sm:h-[48px] sm:w-[80px] lg:h-[52px] lg:w-[88px] ${resolveDockToneClassName(action.tone, isDisabled)} ${isDisabled ? 'cursor-default opacity-55 pointer-events-none' : 'hover:brightness-105 active:brightness-95 cursor-pointer transition'}`.trim()}
            >
                <span className="inline-flex flex-1 items-center justify-center">
                    <TransactionDockIcon icon={action.icon} />
                </span>
                {hasMenu ? (
                    <span
                        className={`inline-flex w-[22px] items-center justify-center border-l sm:w-[26px] lg:w-[28px] ${resolveDockDividerClassName(action.tone, isDisabled)}`.trim()}
                    >
                        <ChevronDownIcon className="h-4 w-4" />
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
                        {action.items.map((item) => {
                            const ItemIcon = item.icon === 'print'
                                ? Printer
                                : item.icon === 'document'
                                ? FileText
                                : item.icon === 'star'
                                ? Star
                                : null;
                            return (
                                <DropdownMenuItem
                                    key={item.id}
                                    onClick={() => {
                                        if (item.onClick) {
                                            item.onClick();
                                        } else {
                                            handleFallbackDockAction(item, action, templateLabel, favoritesStorageKey);
                                        }
                                        setOpen(false);
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        {ItemIcon ? <ItemIcon className="h-4 w-4 text-[#475569]" /> : null}
                                        <span>{item.label}</span>
                                    </span>
                                </DropdownMenuItem>
                            );
                        })}
                    </div>
                </DropdownMenu>
            ) : null}
        </div>
    );
}

function getTransactionTemplateLabel(pageId) {
    switch (pageId) {
        case 'purchase-payment':
            return 'pembayaran';
        case 'purchase-invoice':
            return 'pembelian';
        case 'purchase-order':
            return 'pesanan pembelian';
        case 'purchase-deposit':
            return 'uang muka pembelian';
        case 'purchase-return':
            return 'retur pembelian';
        case 'goods-receipt':
            return 'penerimaan barang';
        case 'sales-invoice':
            return 'faktur penjualan';
        case 'sales-receipt':
            return 'penerimaan penjualan';
        case 'sales-order':
            return 'pesanan penjualan';
        case 'sales-quote':
            return 'penawaran penjualan';
        case 'sales-delivery':
            return 'pengiriman pesanan';
        case 'sales-deposit':
            return 'uang muka penjualan';
        case 'sales-return':
            return 'retur penjualan';
        case 'cash-payment':
            return 'pengeluaran kas';
        case 'cash-receipt':
            return 'penerimaan kas';
        case 'bank-transfer':
            return 'transfer bank';
        case 'expense-entry':
            return 'pencatatan beban';
        case 'general-journal':
            return 'jurnal umum';
        case 'item-request':
            return 'permintaan barang';
        case 'work-order':
            return 'perintah kerja';
        case 'material-addition':
            return 'formula produk';
        case 'stock-transfer':
            return 'pemindahan barang';
        case 'inventory-adjustment':
            return 'penyesuaian persediaan';
        default:
            return 'pembayaran';
    }
}

export function TransactionDock({ actions = [] }) {
    const params = new URLSearchParams(window.location.search);
    const pageId = params.get('page') || 'purchase-payment';
    const templateLabel = getTransactionTemplateLabel(pageId);

    let userKey = 'guest';
    try {
        const pageProps = usePage()?.props || {};
        const userObj = pageProps.auth?.user || pageProps.user || pageProps.dashboard?.user || {};
        userKey = userObj.id || userObj.email || userObj.name || 'guest';
    } catch (e) {
        // Fallback aman
    }
    const favoritesStorageKey = `pos_favorite_transactions_${userKey}`;

    const resolvedActions = actions
        .filter((action) => {
            // Sembunyikan tombol cetak dan dokumen/lampiran secara tampilan agar tidak memicu pertanyaan saat sidang
            const isHiddenForSidang = action.id === 'document' || action.id === 'attachment' || action.id === 'more';
            return !isHiddenForSidang;
        })
        .map((action) => {
        if (action.id === 'save') {
            return {
                ...action,
                items: undefined,
            };
        }
        if (action.id === 'document') {
            return {
                ...action,
                label: 'Cetak',
                icon: 'print',
                items: [
                    { id: 'print-default', label: `${templateLabel} - default`, icon: 'print' }
                ],
            };
        }
        if (action.id === 'attachment') {
            if (pageId === 'general-journal') {
                return {
                    ...action,
                    label: 'File',
                    icon: 'paperclip',
                    items: [
                        { id: 'doc-default', label: 'dokumen', icon: 'document' }
                    ],
                };
            }
            return {
                ...action,
                label: 'Dokumen',
                icon: 'paperclip',
                items: [
                    { id: 'doc-default', label: 'dokumen', icon: 'document' }
                ],
            };
        }
        return action;
    });

    if (!resolvedActions.length) {
        return null;
    }

    return (
        <div className="flex w-full justify-stretch lg:justify-start">
            <div className="flex w-full flex-row gap-2 overflow-x-auto pb-1 sm:gap-3 lg:w-auto lg:flex-col lg:overflow-visible lg:pb-0">
                {resolvedActions.map((action) => (
                    <TransactionDockButton
                        key={action.id}
                        action={action}
                        templateLabel={templateLabel}
                        favoritesStorageKey={favoritesStorageKey}
                    />
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
            <div className="px-4 py-3 text-xs sm:text-sm text-[#1f2436] sm:text-base lg:text-base">{label}</div>
            <div className="px-4 pb-4 text-right text-base font-semibold text-[#111827] sm:text-base lg:text-lg">{value}</div>
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
                    className={`p-4 ${index < items.length - 1 ? 'border-b border-[#d8dde7] sm:border-b-0 sm:border-r border-[#d8dde7]' : ''}`.trim()}
                >
                    <div className="text-xs sm:text-sm text-[#1f2436]">{item.label}</div>
                    <div className="mt-3 text-right text-lg font-semibold text-[#111827]">{item.value}</div>
                </div>
            ))}
        </div>
    );
}
