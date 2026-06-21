import { useMemo } from 'react';
import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { sanitizeNumericInput } from './accountsShared';
import {
    AccountsFieldLabel,
    AccountsFormFieldRow,
    AccountsReadonlyTrailingIcon,
} from './accountsViewShared';

export function AccountsGeneralTab({ config, values, isDetail, onChange, lookupData }) {
    const selectedParentAccount = useMemo(() => {
        if (!values.parentId) return [];
        const code = values.parentAccountCode ?? '';
        const name = values.parentAccountName ?? values.parentAccount?.[0] ?? '';
        const label = values.parentAccountLabel ?? (code ? `${code} - ${name}` : name);
        return [{ id: values.parentId, code, name, label }];
    }, [values.parentId, values.parentAccountLabel, values.parentAccountCode, values.parentAccountName, values.parentAccount]);

    return (
        <div className="grid grid-cols-1 gap-y-3.5 max-w-[980px]">
            <AccountsFormFieldRow label={config.labels.type}>
                <SelectField
                    value={values.type}
                    onChange={(event) => onChange('type', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-xs sm:text-sm text-[#1f2436]"
                >
                    {config.typeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </AccountsFormFieldRow>

            <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,430px)] lg:items-start">
                <div className="pt-2 lg:pt-1.5 flex items-center">
                    <CheckboxField
                        id="accounts-sub-account"
                        label={config.labels.isSubAccount}
                        checked={Boolean(values.isSubAccount)}
                        onChange={(event) => {
                            const isChecked = event.target.checked;
                            onChange('isSubAccount', isChecked);
                            if (isChecked) {
                                onChange('autoCode', true);
                            } else {
                                onChange('parentId', null);
                                onChange('parentAccount', []);
                                onChange('parentAccountLabel', '');
                                onChange('parentAccountCode', '');
                                onChange('parentAccountName', '');
                            }
                        }}
                        align="center"
                        labelClassName="text-xs sm:text-sm font-normal text-[#1f2436]"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                        containerClassName="w-auto"
                    />
                </div>
                <div>
                    {Boolean(values.isSubAccount) && (
                        <BackendLookupField
                            resource="accounts"
                            values={selectedParentAccount}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari akun perkiraan"
                            getOptionLabel={(option) => option ? (option.code ? `${option.code} - ${option.name}` : option.name) : ''}
                            onSelect={(option) => {
                                onChange('parentId', option.id);
                                onChange('parentAccount', [option.name]);
                                onChange('parentAccountLabel', `${option.code} - ${option.name}`);
                                onChange('parentAccountCode', option.code);
                                onChange('parentAccountName', option.name);
                            }}
                            onRemove={() => {
                                onChange('parentId', null);
                                onChange('parentAccount', []);
                                onChange('parentAccountLabel', '');
                                onChange('parentAccountCode', '');
                                onChange('parentAccountName', '');
                            }}
                        />
                    )}
                </div>
            </div>

            {(!values.isSubAccount || !values.autoCode) && (
                <AccountsFormFieldRow label={config.labels.code} required>
                    <TextInput
                        value={values.code}
                        onChange={(event) => onChange('code', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </AccountsFormFieldRow>
            )}

            {Boolean(values.isSubAccount) && (
                <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,430px)] lg:items-start">
                    <div className="lg:col-span-2 flex items-center pt-1 pb-1">
                        <CheckboxField
                            id="accounts-auto-code"
                            label="Pengkodean otomatis dengan prefix kode akun induk"
                            checked={Boolean(values.autoCode)}
                            onChange={(event) => onChange('autoCode', event.target.checked)}
                            align="center"
                            labelClassName="text-xs sm:text-sm text-[#1f2436] font-normal select-none"
                            inputClassName="mt-0 h-[18px] w-[18px]"
                            containerClassName="w-auto"
                        />
                    </div>
                </div>
            )}

            <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,430px)] lg:items-start">
                <div className="pt-2 lg:pt-1.5">
                    <AccountsFieldLabel label={config.labels.name} required />
                </div>
                <div>
                    <TextInput
                        value={values.name}
                        onChange={(event) => onChange('name', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                    <p className="mt-2.5 text-xs sm:text-sm font-normal italic text-[#8a91a8] leading-relaxed">
                        {config.helperText.nameExample}
                    </p>
                </div>
            </div>

            {isDetail ? (
                <AccountsFormFieldRow label={config.labels.balance}>
                    <div className="pt-1 text-lg text-[#1f2436]">{values.balanceLabel}</div>
                </AccountsFormFieldRow>
            ) : null}
        </div>
    );
}

export function AccountsOpeningBalanceTab({ config, values, onChange }) {
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-normal text-[#1f2436]">{config.headingLabels.openingBalance}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 max-w-[980px]">
                <AccountsFormFieldRow label={config.labels.openingBalanceValue}>
                    <FormattedAmountInput
                        value={values.openingBalanceValue}
                        onChange={(event) => onChange('openingBalanceValue', sanitizeNumericInput(event.target.value))}
                        prefix="Rp"
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        prefixClassName="min-w-[34px] bg-[#f5f6f8] px-3 text-[#9aa3b1]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </AccountsFormFieldRow>

                <AccountsFormFieldRow label={config.labels.openingBalanceDate}>
                    <TransactionDateInput
                        value={values.openingBalanceDate}
                        onChange={(nextValue) => onChange('openingBalanceDate', nextValue)}
                        className="max-w-[430px]"
                    />
                </AccountsFormFieldRow>
            </div>
        </div>
    );
}

export function AccountsOthersTab({ config, values, isDetail, onChange }) {
    const selectedBranches = useMemo(() => {
        const ids = values.branchIds ?? [];
        const names = values.branch ?? [];
        return ids.map((id, index) => ({
            id,
            name: names[index] ?? `Cabang ${id}`,
        }));
    }, [values.branchIds, values.branch]);

    const selectedUsers = useMemo(() => {
        const ids = values.userIds ?? [];
        const names = values.users ?? [];
        return ids.map((id, index) => ({
            id,
            name: names[index] ?? `User ${id}`,
        }));
    }, [values.userIds, values.users]);

    return (
        <div className="space-y-4">
            <AccountsFormFieldRow label={config.labels.notes} className="lg:grid-cols-[180px_minmax(0,570px)]">
                <TextareaField
                    value={values.notes}
                    onChange={(event) => onChange('notes', event.target.value)}
                    rows={3}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[68px] text-xs sm:text-sm text-[#1f2436]"
                />
            </AccountsFormFieldRow>

            {isDetail ? (
                <AccountsFormFieldRow label={config.labels.cashBankReference}>
                    <TextInput
                        value={values.cashBankReference}
                        readOnly
                        className="h-[40px] rounded-[4px] border-[#9ce04f] bg-[#eef8e7]"
                        inputClassName="text-xs sm:text-sm text-[#4d9b1f]"
                    />
                </AccountsFormFieldRow>
            ) : null}

            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-lg font-medium text-[#1f2436]">{config.headingLabels.userAccess}</h3>
            </div>

            <div className="space-y-3">
                <CheckboxField
                    id="accounts-all-users"
                    label={config.labels.allUsers}
                    checked={Boolean(values.allUsers)}
                    onChange={(event) => {
                        const isChecked = event.target.checked;
                        onChange('allUsers', isChecked);
                        if (isChecked) {
                            onChange('branchIds', []);
                            onChange('branch', []);
                            onChange('userIds', []);
                            onChange('users', []);
                        }
                    }}
                    align="center"
                    labelClassName="text-xs sm:text-sm font-normal text-[#1f2436]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />

                {!values.allUsers && (
                    <div className="space-y-3 pt-2">
                        <div className="text-xs sm:text-sm font-medium text-[#1f2436]">
                            Isikan pengguna-pengguna yang bisa menggunakan akun ini
                        </div>



                        <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,430px)] lg:items-start">
                            <div className="pt-2 lg:pt-1.5">
                                <AccountsFieldLabel label="Pengguna" />
                            </div>
                            <div>
                                <BackendLookupField
                                    resource="users"
                                    values={selectedUsers}
                                    placeholder="Cari/Pilih..."
                                    searchLabel="Cari pengguna"
                                    getOptionLabel={(option) => option?.name ?? ''}
                                    onSelect={(option) => {
                                        if (!(values.userIds ?? []).includes(option.id)) {
                                            onChange('userIds', [...(values.userIds ?? []), option.id]);
                                            onChange('users', [...(values.users ?? []), option.name]);
                                        }
                                    }}
                                    onRemove={(option) => {
                                        onChange('userIds', (values.userIds ?? []).filter((id) => id !== option.id));
                                        onChange('users', (values.users ?? []).filter((name) => name !== option.name));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function AccountsChildrenTab({ values }) {
    return (
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_310px]">
            <div className="space-y-1.5">
                {values.childAccounts.map((item) => (
                    <div
                        key={`${item.id}-name`}
                        className="rounded-[3px] bg-[#cbcbcb] px-4 py-2.5 text-xs sm:text-sm text-[#1f2436]"
                        style={{ paddingLeft: `${16 + item.level * 18}px` }}
                    >
                        {item.name}
                    </div>
                ))}
            </div>

            <div className="space-y-1.5">
                {values.childAccounts.map((item) => (
                    <div key={`${item.id}-code`} className="rounded-[3px] bg-[#cbcbcb] px-4 py-2.5 text-xs sm:text-sm text-[#1f2436]">
                        {item.code}
                    </div>
                ))}
            </div>
        </div>
    );
}
