import { useEffect, useMemo, useState } from 'react';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import Tooltip from '@/components/ui/Tooltip';
import { InfoIcon, TableActionIcon } from '@/features/workspace/shared/Icons';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    createBackendResource,
    updateBackendResource,
    getBackendErrorMessage,
} from '@/features/workspace/backend/workspaceBackendApi';

function ApprovalHeading({ title }) {
    return (
        <div className="border-b border-[#d9dee8] pb-2">
            <h3 className="text-lg font-medium text-[#1564d7] sm:text-xl">{title}</h3>
        </div>
    );
}

function getApprovalFieldTooltip(label) {
    const clean = String(label || '').trim();
    if (clean.includes('Syarat min.')) return 'Syarat minimum nilai nominal transaksi yang memerlukan penyetujuan.';
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

function ThresholdField({ valueLabel, value, onChange }) {
    return (
        <div className="space-y-3">
            <TextInput
                placeholder="0"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                prefix={valueLabel}
                prefixClassName="min-w-[110px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-xs sm:text-sm text-[#9299aa]"
                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-xs sm:text-sm text-[#1f2436]"
            />
        </div>
    );
}

export default function TransactionApprovalFormView({
    pageId,
    form,
    activeLevel2Tab,
    onCloseDetail,
    onRefresh,
    backendRows = [],
}) {
    const { rows: branchRows } = useBackendIndexResource({ resource: 'branches', initialPerPage: 100 });
    const { rows: userRows } = useBackendIndexResource({ resource: 'users', initialPerPage: 100 });
    const { rows: roleRows } = useBackendIndexResource({ resource: 'roles', initialPerPage: 100 });

    const detailRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const detailRecord = useMemo(() => {
        if (!detailRecordId) return null;
        return (backendRows ?? []).find((r) => String(r.id) === String(detailRecordId)) ?? null;
    }, [backendRows, detailRecordId]);

    const initialValues = useMemo(() => {
        const firstStep = detailRecord?.steps?.[0] ?? null;
        const appType = firstStep?.approver_user_id ? 'user' : (firstStep?.approver_role_id ? 'role' : 'user');
        const appId = firstStep?.approver_user_id ?? firstStep?.approver_role_id ?? '';

        return {
            ruleName: detailRecord?.rule_name ?? '',
            transactionType: detailRecord?.transaction_type ?? form.defaults?.transactionType ?? form.transactionTypeOptions?.[0]?.value ?? '',
            branch: detailRecord?.branch_id ?? form.defaults?.branch ?? form.branchOptions?.[0]?.value ?? 'all-branches',
            thresholdAmount: detailRecord?.threshold_amount ?? 0,
            approverType: appType,
            approverId: appId,
            approvalRule: detailRecord?.approval_rule ?? form.defaults?.approvalRule ?? 'one-approved',
        };
    }, [detailRecord, form]);

    const [values, setValues] = useState(initialValues);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ tone: '', message: '' });

    useEffect(() => {
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
    }, [initialValues]);

    const isDirty = useMemo(() => (
        values.ruleName !== initialValues.ruleName ||
        values.transactionType !== initialValues.transactionType ||
        values.branch !== initialValues.branch ||
        values.thresholdAmount !== initialValues.thresholdAmount ||
        values.approverType !== initialValues.approverType ||
        values.approverId !== initialValues.approverId ||
        values.approvalRule !== initialValues.approvalRule
    ), [values, initialValues]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    const resolvedBranchOptions = useMemo(() => {
        const base = form.branchOptions ?? [];
        const fetched = (branchRows ?? []).map((b) => ({ value: String(b.id), label: b.name }));
        const merged = [...base];
        fetched.forEach((f) => {
            if (!merged.some((m) => String(m.value) === String(f.value))) {
                merged.push(f);
            }
        });
        return merged;
    }, [form.branchOptions, branchRows]);

    const approverOptions = useMemo(() => {
        if (values.approverType === 'role') {
            return (roleRows ?? []).map((r) => ({ value: String(r.id), label: r.name }));
        }
        return (userRows ?? []).map((u) => ({ value: String(u.id), label: u.name }));
    }, [values.approverType, userRows, roleRows]);

    async function handleSave() {
        if (!values.ruleName?.trim()) {
            setStatus({ tone: 'danger', message: 'Nama aturan harus diisi.' });
            return;
        }

        if (!values.approverId) {
            setStatus({ tone: 'danger', message: 'Penyetuju transaksi harus dipilih.' });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: detailRecordId ? 'Sedang memperbarui aturan persetujuan...' : 'Sedang menyimpan aturan persetujuan...',
            successMessage: detailRecordId ? 'Aturan persetujuan berhasil diperbarui.' : 'Aturan persetujuan berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute: async () => {
                const firstStep = detailRecord?.steps?.[0] ?? null;
                const payload = {
                    rule_name: values.ruleName,
                    transaction_type: values.transactionType,
                    branch_id: values.branch === 'all-branches' ? null : Number(values.branch),
                    threshold_amount: Number(values.thresholdAmount ?? 0),
                    is_active: true,
                    steps: [
                        {
                            id: firstStep?.id ?? undefined,
                            approver_user_id: values.approverType === 'user' && values.approverId ? Number(values.approverId) : null,
                            approver_role_id: values.approverType === 'role' && values.approverId ? Number(values.approverId) : null,
                            step_order: 1,
                            min_approvals: values.approvalRule === 'all-approved' ? 2 : 1,
                        }
                    ]
                };

                const response = detailRecordId
                    ? await updateBackendResource('transaction-approval-rules', detailRecordId, payload)
                    : await createBackendResource('transaction-approval-rules', payload);

                return { record: response?.data ?? null };
            },
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.();
            },
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
                        <ApprovalFieldLabel label="Nama Aturan" required />
                        <TextInput
                            value={values.ruleName}
                            onChange={(event) => setValues((prev) => ({ ...prev, ruleName: event.target.value }))}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />

                        <ApprovalFieldLabel label="Tipe Transaksi" />
                        <SelectField value={values.transactionType} onChange={set('transactionType')} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                            {form.transactionTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </SelectField>

                        <ApprovalFieldLabel label="Syarat min. Nilai" info />
                        <ThresholdField
                            valueLabel={form.valueLabel}
                            value={values.thresholdAmount}
                            onChange={(val) => setValues((prev) => ({ ...prev, thresholdAmount: val }))}
                        />

                        <ApprovalFieldLabel label="Pembuat Transaksi" info />
                        <TextInput
                            value="Semua Pengguna"
                            readOnly
                            disabled
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f3f3f4]"
                            inputClassName="text-xs sm:text-sm text-[#9299aa]"
                        />

                        <ApprovalFieldLabel label="Cabang" />
                        <SelectField value={values.branch} onChange={set('branch')} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                            {resolvedBranchOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </SelectField>
                    </div>
                </div>

                <div className="space-y-3">
                    <ApprovalHeading title="Kriteria Penyetuju" />
                    <div className="grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
                        <ApprovalFieldLabel label="Tipe Penyetuju" required />
                        <SelectField
                            value={values.approverType}
                            onChange={(event) => {
                                const newType = event.target.value;
                                setValues((prev) => ({
                                    ...prev,
                                    approverType: newType,
                                    approverId: '',
                                }));
                            }}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            <option value="user">Pengguna</option>
                            <option value="role">Peran/Jabatan</option>
                        </SelectField>

                        <ApprovalFieldLabel label="Disetujui Oleh" required />
                        <SelectField
                            value={values.approverId}
                            onChange={set('approverId')}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            <option value="">[Pilih Penyetuju]</option>
                            {approverOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </SelectField>

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
