import { useState, useEffect } from 'react';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { toast } from 'sonner';

export default function SmartlinkEbankingFormView({
    page,
    activeLevel2Tab,
    initialData = null,
    onSaveSuccess,
    onDeleteSuccess,
}) {
    const isEdit = activeLevel2Tab?.tabType === 'detail';
    const [activeTabId, setActiveTabId] = useState('general');
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        serviceType: 'BRI Mobile (BRIMO)',
        accountNumber: '',
        accountId: '',
        accountRelation: '',
        accountName: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                serviceType: initialData.serviceType || 'BRI Mobile (BRIMO)',
                accountNumber: initialData.accountNumber || '',
                accountId: initialData.accountId || '',
                accountRelation: initialData.accountRelation || '',
                accountName: initialData.accountName || '',
            });
        } else {
            setFormData({
                serviceType: 'BRI Mobile (BRIMO)',
                accountNumber: '',
                accountId: '',
                accountRelation: '',
                accountName: '',
            });
        }
    }, [initialData]);

    const handleSave = () => {
        if (!formData.serviceType) {
            toast.error('Silakan pilih jenis internet banking');
            return;
        }
        if (!formData.accountNumber.trim()) {
            toast.error('Nomor rekening bank wajib diisi');
            return;
        }
        if (!formData.accountRelation.trim()) {
            toast.error('Relasi akun bank perkiraan wajib dipilih');
            return;
        }

        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            const savedRecord = {
                id: initialData?.id || String(Date.now()),
                serviceType: formData.serviceType,
                accountNumber: formData.accountNumber.trim(),
                accountId: formData.accountId,
                accountRelation: formData.accountRelation,
                accountName: formData.accountName || formData.accountRelation,
                tabLabel: formData.accountNumber.trim(),
            };

            toast.success(isEdit ? 'Akun SmartLink e-Banking berhasil diperbarui' : 'Akun SmartLink e-Banking berhasil ditambahkan');
            onSaveSuccess?.(savedRecord, isEdit);
        }, 300);
    };

    const handleDelete = () => {
        if (!initialData?.id) return;
        if (window.confirm(`Hapus akun SmartLink e-Banking ${formData.accountNumber}?`)) {
            toast.success('Akun SmartLink e-Banking berhasil dihapus');
            onDeleteSuccess?.(initialData.id);
        }
    };

    const formConfig = {
        tabs: [
            { id: 'general', label: 'Internet Banking' },
        ],
        saveLabel: 'Simpan',
    };

    return (
        <ModuleFormTemplate
            form={formConfig}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            saving={saving}
            onSave={handleSave}
            actionsSlot={
                isEdit ? (
                    <DockActionButton
                        icon={<TrashIcon className="h-4 w-4" />}
                        label="Hapus"
                        tone="danger"
                        onClick={handleDelete}
                    />
                ) : null
            }
        >
            <div className="space-y-4 py-3 sm:py-4">
                {/* Row 1: Jenis Internet Banking * */}
                <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2 sm:gap-4">
                    <label className="text-xs font-medium text-slate-700">
                        Jenis Internet Banking <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full max-w-sm">
                        <select
                            value={formData.serviceType}
                            onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                            className="h-[36px] w-full rounded-[4px] border border-ui-border bg-white px-3 text-xs text-slate-900 focus:border-brand-blue focus:outline-none cursor-pointer"
                        >
                            <option value="">-- Pilih Internet Banking --</option>
                            <option value="BRI Mobile (BRIMO)">BRI Mobile (BRIMO)</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: No. Rekening Bank * */}
                <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2 sm:gap-4">
                    <label className="text-xs font-medium text-slate-700">
                        No. Rekening Bank <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full max-w-sm">
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                            placeholder=""
                            className="h-[36px] w-full rounded-[4px] border border-ui-border bg-white px-3 pr-8 text-xs text-slate-900 focus:border-brand-blue focus:outline-none"
                        />
                        {formData.accountNumber ? (
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, accountNumber: '' }))}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-sm"
                            >
                                &times;
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Row 3: Relasi Akun Bank * */}
                <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2 sm:gap-4">
                    <label className="text-xs font-medium text-slate-700">
                        Relasi Akun Bank <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full max-w-sm">
                        <AccountLookupTextInput
                            id="accountRelation"
                            value={formData.accountRelation}
                            placeholder="Cari/Pilih Akun Perkiraan..."
                            searchLabel="Cari akun kas/bank"
                            dialogTitle="Pilih Akun Kas/Bank"
                            queryParams={{ account_type: 'Cash/Bank' }}
                            className="h-[36px] rounded-[4px] border-ui-border w-full"
                            inputClassName="text-xs text-slate-900 py-1 h-full"
                            trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                            onSelectAccount={(record, label) => {
                                setFormData(prev => ({
                                    ...prev,
                                    accountId: record?.id ? String(record.id) : '',
                                    accountRelation: label || '',
                                    accountName: record?.name || '',
                                }));
                            }}
                            onClear={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    accountId: '',
                                    accountRelation: '',
                                    accountName: '',
                                }));
                            }}
                        />
                    </div>
                </div>
            </div>
        </ModuleFormTemplate>
    );
}
