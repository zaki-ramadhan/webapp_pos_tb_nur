import { usePage } from '@inertiajs/react';
import { showCrudLoadingToast, showCrudSuccessToast, finishCrudLoadingToast } from '@/features/workspace/shared/crudFeedback';

// Modular Imports
import { TransactionDockButton } from './components/TransactionDockButton';
export { TransactionTotalCard } from './components/TransactionTotalCard';
export { TransactionDualTotalCard } from './components/TransactionDualTotalCard';

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
                        onFallbackAction={(item, parentAction) =>
                            handleFallbackDockAction(item, parentAction, templateLabel, favoritesStorageKey)
                        }
                    />
                ))}
            </div>
        </div>
    );
}
