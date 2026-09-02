import { useState, useEffect } from 'react';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { toast } from 'sonner';

function SmartlinkFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-2.5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
            <label className="text-xs sm:text-sm text-brand-dark">
                {label}
                {required ? <span className="text-tab-active-border-t"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
                accountRelation: (initialData.accountRelation || '').replace(/^\[.*?\]\s*/, ''),
                accountName: initialData.accountName || initialData.accountRelation || '',
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
    }, [initialData, activeLevel2Tab?.id]);

    const validationMessage = useMemo(() => {
        if (!formData.serviceType) {
            return 'Silakan pilih jenis internet banking';
        }
        if (!formData.accountNumber.trim()) {
            return 'Nomor rekening bank wajib diisi';
        }
        if (!formData.accountRelation.trim()) {
            return 'Relasi akun bank perkiraan wajib dipilih';
        }
        return '';
    }, [formData.serviceType, formData.accountNumber, formData.accountRelation]);

    const saveDisabled = saving || Boolean(validationMessage);

    const handleSave = () => {
        if (validationMessage) {
            toast.error(validationMessage);
            return;
        }

        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            const cleanRelation = formData.accountRelation.replace(/^\[.*?\]\s*/, '');
            const savedRecord = {
                id: initialData?.id || String(Date.now()),
                name: formData.accountNumber.trim(),
                serviceType: formData.serviceType,
                accountNumber: formData.accountNumber.trim(),
                accountId: formData.accountId,
                accountRelation: cleanRelation,
                accountName: formData.accountName || cleanRelation,
                tabLabel: formData.accountNumber.trim(),
                label: formData.accountNumber.trim(),
            };

            toast.success(isEdit ? 'Akun SmartLink e-Banking berhasil diperbarui' : 'Akun SmartLink e-Banking berhasil ditambahkan');
            onSaveSuccess?.(savedRecord, isEdit);
        }, 250);
    };

    const handleDeleteConfirm = () => {
        if (!initialData?.id) return;
        setDeleteModalOpen(false);
        toast.success('Akun SmartLink e-Banking berhasil dihapus');
        onDeleteSuccess?.(initialData.id);
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
            saveDisabled={saveDisabled}
            onSave={handleSave}
            actionsSlot={
                isEdit ? (
                    <DockActionButton
                        icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                        label="Hapus"
                        tone="danger"
                        onClick={() => setDeleteModalOpen(true)}
                    />
                ) : null
            }
        >
            <div className="space-y-4 py-3 sm:py-4">
                {/* Row 1: Jenis Internet Banking * */}
                <SmartlinkFieldRow label="Jenis Internet Banking" required>
                    <SelectField
                        value={formData.serviceType}
                        onChange={(val) => setFormData(prev => ({ ...prev, serviceType: val }))}
                        className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]"
                        selectClassName="text-xs sm:text-sm text-brand-dark"
                        placeholder="-- Pilih Internet Banking --"
                    >
                        <option value="BRI Mobile (BRIMO)">BRI Mobile (BRIMO)</option>
                    </SelectField>
                </SmartlinkFieldRow>

                {/* Row 2: No. Rekening Bank * */}
                <SmartlinkFieldRow label="No. Rekening Bank" required>
                    <TextInput
                        value={formData.accountNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder=""
                        className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                        clearable
                    />
                </SmartlinkFieldRow>

                {/* Row 3: Relasi Akun Bank * */}
                <SmartlinkFieldRow label="Relasi Akun Bank" required>
                    <AccountLookupTextInput
                        id="accountRelation"
                        value={formData.accountRelation}
                        placeholder="Cari/Pilih Akun Perkiraan..."
                        searchLabel="Cari akun kas/bank"
                        dialogTitle="Pilih Akun Kas/Bank"
                        queryParams={{ account_type: 'Cash/Bank' }}
                        className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]"
                        inputClassName="text-xs sm:text-sm text-brand-dark py-1 h-full"
                        trailingClassName="w-[36px] shrink-0 justify-center px-0 h-full"
                        onSelectAccount={(record, label) => {
                            const cleanName = record?.name || (label ? label.replace(/^\[.*?\]\s*/, '') : '') || '';
                            setFormData(prev => ({
                                ...prev,
                                accountId: record?.id ? String(record.id) : '',
                                accountRelation: cleanName,
                                accountName: cleanName,
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
                </SmartlinkFieldRow>
            </div>

            <ConfirmationModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${formData.accountNumber || 'akun ini'}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
            />
        </ModuleFormTemplate>
    );
}
