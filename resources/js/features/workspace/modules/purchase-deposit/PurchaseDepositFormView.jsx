import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { createBackendResource, updateBackendResource, deleteBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import {
    buildGeneratedPurchaseDepositNumber,
    buildPurchaseDepositPayload,
    parseNumericInput,
    validatePurchaseDepositValues,
} from './purchaseDepositShared';

export default function PurchaseDepositFormView({
    pageId,
    config,
    buildRecord,
    activeLevel2Tab,
    onCloseDetail,
    onRefresh,
}) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(activeRecordId);

    const [values, setValues] = useState(() => {
        const base = config.draft || {};
        return {
            ...base,
            documentNumber: base.documentNumber || buildGeneratedPurchaseDepositNumber(),
        };
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('deposit');

    useEffect(() => {
        if (!activeRecordId) return;

        let isMounted = true;
        (async () => {
            try {
                const response = await fetch(`/backend/purchase-deposits/${activeRecordId}`, {
                    headers: { credentials: 'same-origin', Accept: 'application/json' },
                });
                if (response.ok) {
                    const result = await response.json();
                    if (isMounted && result?.data) {
                        const rec = buildRecord(result.data);
                        setValues(rec);
                    }
                } else if (isMounted) {
                    toast.error('Gagal memuat detail uang muka pembelian.');
                }
            } catch {
                if (isMounted) {
                    toast.error('Koneksi terputus saat mengambil detail uang muka.');
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [activeRecordId, buildRecord]);

    const handleChange = useCallback((key, value) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        const formatted = raw ? Number(raw).toLocaleString('id-ID') : '0';
        handleChange('depositAmount', formatted);
    };

    const validationError = useMemo(() => validatePurchaseDepositValues(values, config), [values, config]);

    const handleSave = async () => {
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsSaving(true);
        try {
            const payload = buildPurchaseDepositPayload(values);
            let res;
            if (isDetail && values.__backendRecordId) {
                res = await updateBackendResource('purchase-deposits', values.__backendRecordId, payload);
                toast.success('Uang Muka Pembelian berhasil diperbarui.');
            } else {
                res = await createBackendResource('purchase-deposits', payload);
                toast.success('Uang Muka Pembelian berhasil disimpan.');
            }

            if (onRefresh) onRefresh();
            if (onCloseDetail) onCloseDetail();
        } catch (err) {
            toast.error(err?.message || 'Gagal menyimpan Uang Muka Pembelian.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!values.__backendRecordId) return;
        if (!confirm('Apakah Anda yakin ingin menghapus data uang muka pembelian ini?')) return;

        setIsDeleting(true);
        try {
            await deleteBackendResource('purchase-deposits', values.__backendRecordId);
            toast.success('Data uang muka pembelian berhasil dihapus.');
            if (onRefresh) onRefresh();
            if (onCloseDetail) onCloseDetail();
        } catch (err) {
            toast.error(err?.message || 'Gagal menghapus data.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-tab-active-bg">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-ui-border bg-white px-4 py-2.5 shadow-xs">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm sm:text-base font-bold text-slate-800">
                        {isDetail ? `Uang Muka Pembelian #${values.documentNumber}` : 'Tambah Uang Muka Pembelian'}
                    </h2>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                        {values.status || 'Draft'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {isDetail && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting || isSaving}
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onCloseDetail}
                        disabled={isSaving}
                    >
                        Tutup
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || Boolean(validationError)}
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-ui-border bg-white px-4">
                <button
                    type="button"
                    onClick={() => setActiveTab('deposit')}
                    className={`border-b-2 px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                        activeTab === 'deposit'
                            ? 'border-brand-blue text-brand-blue'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Uang Muka
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`border-b-2 px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                        activeTab === 'info'
                            ? 'border-brand-blue text-brand-blue'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Info Lainnya
                </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    {activeTab === 'deposit' ? (
                        <div className="rounded-xl border border-ui-border bg-white p-5 shadow-xs space-y-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Pemasok <span className="text-red-500">*</span>
                                    </label>
                                    <BackendLookupField
                                        resource="suppliers"
                                        values={values.supplier}
                                        placeholder="Cari / Pilih Pemasok..."
                                        searchLabel="Cari pemasok"
                                        onSelect={(opt) => {
                                            handleChange('supplier', [opt]);
                                            handleChange('supplier_id', opt.id);
                                            if (opt.billing_address && !values.address) {
                                                handleChange('address', opt.billing_address);
                                            }
                                        }}
                                        onRemove={() => {
                                            handleChange('supplier', []);
                                            handleChange('supplier_id', null);
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Tanggal <span className="text-red-500">*</span>
                                    </label>
                                    <TextInput
                                        type="date"
                                        value={values.entryDate}
                                        onChange={(e) => handleChange('entryDate', e.target.value)}
                                        className="h-[38px] w-full rounded border-ui-border"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Nomor Bukti (UMP)
                                        </label>
                                        <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={values.autoNumber}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    handleChange('autoNumber', checked);
                                                    if (checked) {
                                                        handleChange('documentNumber', buildGeneratedPurchaseDepositNumber());
                                                    }
                                                }}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            Otomatis
                                        </label>
                                    </div>
                                    <TextInput
                                        value={values.documentNumber}
                                        onChange={(e) => handleChange('documentNumber', e.target.value)}
                                        disabled={values.autoNumber}
                                        placeholder="UMP.YYYYMMDD.XXXX"
                                        className="h-[38px] w-full rounded border-ui-border"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Jumlah Uang Muka (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">
                                            Rp
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={values.depositAmount}
                                            onChange={handleAmountChange}
                                            placeholder="0"
                                            className="h-[38px] w-full rounded border border-ui-border bg-white pl-10 pr-3 text-right text-sm font-semibold text-slate-800 focus:border-brand-blue focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Keterangan / Catatan
                                </label>
                                <TextareaField
                                    value={values.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Contoh: Uang muka pembelian material proyek semen 100 sak..."
                                    rows={3}
                                    className="w-full rounded border-ui-border"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-ui-border bg-white p-5 shadow-xs space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Alamat Pengiriman / Pemasok
                                </label>
                                <TextareaField
                                    value={values.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="Alamat lengkap pemasok..."
                                    rows={3}
                                    className="w-full rounded border-ui-border"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
