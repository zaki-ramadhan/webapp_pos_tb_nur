import { useEffect, useMemo, useState } from 'react';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import Tooltip from '@/components/ui/Tooltip';
import { InfoIcon, SearchIcon, TableActionIcon } from '@/features/workspace/shared/Icons';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction } from '@/features/workspace/shared/crudFormActions';

function ApprovalHeading({ title }) {
    return (
        <div className="border-b border-[#d9dee8] pb-2">
            <h3 className="text-lg font-medium text-[#1564d7] sm:text-xl">{title}</h3>
        </div>
    );
}

function getApprovalFieldTooltip(label) {
    const clean = String(label || '').trim();
    if (clean.includes('Syarat min.')) return 'Syarat minimum nilai nominal transaksi atau persentase diskon yang memerlukan penyetujuan.';
    if (clean.includes('Pembuat Transaksi')) return 'Pengguna pembuat transaksi yang pengajuannya akan disaring oleh aturan ini.';
    return `Informasi tentang ${clean}`;
}

function ApprovalFieldLabel({ label, required = false, info = false }) {
    return (
        <div className="flex items-center gap-2 pt-1 text-xs sm:text-sm text-[#1f2436]">
            <span>
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </span>
            {info ? (
                <Tooltip content={getApprovalFieldTooltip(label)} portal>
                    <InfoIcon className="h-5 w-5 text-[#1f2436] cursor-help" />
                </Tooltip>
            ) : null}
        </div>
    );
}

function ThresholdField({ valueLabel }) {
    return (
        <div className="space-y-3">
            <TextInput
                placeholder=""
                prefix={valueLabel}
                prefixClassName="min-w-[110px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-xs sm:text-sm text-[#9299aa]"
                trailing={<TableActionIcon className="h-5 w-5 text-[#1f2436]" />}
                trailingClassName="px-3 text-[#1f2436]"
                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-xs sm:text-sm text-[#1f2436]"
            />
            <TextInput
                placeholder="Diskon (%)"
                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-xs sm:text-sm text-[#1f2436]"
            />
        </div>
    );
}

export default function TransactionApprovalFormView({ pageId, form, activeLevel2Tab }) {
    const initialValues = useMemo(() => ({
        transactionType: form.defaults?.transactionType ?? form.transactionTypeOptions?.[0]?.value ?? '',
        branch: form.defaults?.branch ?? form.branchOptions?.[0]?.value ?? '',
        approvalRule: form.defaults?.approvalRule ?? form.approvalRuleOptions?.[0]?.value ?? '',
    }), [form]);

    const [values, setValues] = useState(initialValues);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ tone: '', message: '' });

    useEffect(() => {
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
    }, [initialValues]);

    const isDirty = useMemo(() => (
        values.transactionType !== initialValues.transactionType ||
        values.branch !== initialValues.branch ||
        values.approvalRule !== initialValues.approvalRule
    ), [values, initialValues]);

    useWorkspaceDirtyRegistration({ pageId, tabId: activeLevel2Tab?.id, dirty: isDirty, enabled: Boolean(pageId && activeLevel2Tab?.id) });

    async function handleSave() {
        await executeCrudFormAction({
            loadingMessage: 'Menyimpan aturan persetujuan...',
            successMessage: 'Aturan persetujuan berhasil disimpan.',
            setSaving,
            setStatus,
            execute: () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 600)),
        });
    }

    const set = (key) => (event) => setValues((prev) => ({ ...prev, [key]: event.target.value }));

    return (
        <ModuleFormTemplate
            form={form}
            saving={saving}
            saveDisabled={saving || !isDirty}
            status={status}
            onSave={handleSave}
        >
            <div className="grid gap-8 lg:grid-cols-2 max-w-[980px]">
                <div className="space-y-3">
                    <ApprovalHeading title="Kriteria Pengajuan" />
                    <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
                        <ApprovalFieldLabel label="Tipe Transaksi" />
                        <SelectField value={values.transactionType} onChange={set('transactionType')} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                            {form.transactionTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </SelectField>

                        <ApprovalFieldLabel label="Syarat min. Nilai/Diskon" info />
                        <ThresholdField valueLabel={form.valueLabel} />

                        <ApprovalFieldLabel label="Pembuat Transaksi" info />
                        <TextInput placeholder="Cari/Pilih..." trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />

                        <ApprovalFieldLabel label="Cabang" />
                        <SelectField value={values.branch} onChange={set('branch')} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                            {form.branchOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </SelectField>
                    </div>
                </div>

                <div className="space-y-3">
                    <ApprovalHeading title="Kriteria Penyetuju" />
                    <div className="grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
                        <ApprovalFieldLabel label="Disetujui Oleh" required />
                        <TextInput placeholder="Cari/Pilih..." trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />

                        <ApprovalFieldLabel label="Dengan Syarat" />
                        <SelectField value={values.approvalRule} onChange={set('approvalRule')} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                            {form.approvalRuleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </SelectField>
                    </div>
                </div>
            </div>
        </ModuleFormTemplate>
    );
}
