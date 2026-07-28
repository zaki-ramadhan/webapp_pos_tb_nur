import { useMemo } from 'react';
import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import {
    AccountsFieldLabel,
    AccountsFormFieldRow,
} from '../../accountsViewShared';

export function AccountsGeneralTab({ config, values, isDetail, onChange, lookupData, excludeId }) {
    const selectedParentAccount = useMemo(() => {
        if (!values.parentId) return [];
        const code = values.parentAccountCode ?? '';
        const name = values.parentAccountName ?? values.parentAccount?.[0] ?? '';
        const label = values.parentAccountLabel ?? (code ? `${code} - ${name}` : name);
        return [{ id: values.parentId, code, name, label }];
    }, [values.parentId, values.parentAccountLabel, values.parentAccountCode, values.parentAccountName, values.parentAccount]);

    const isSubAccountEdit = isDetail && Boolean(values.isSubAccount || values.parentId);

    return (
        <div className="grid grid-cols-1 gap-y-3.5 max-w-[980px]">
            <AccountsFormFieldRow label={config.labels.type}>
                {isSubAccountEdit ? (
                    <TextInput
                        value={values.type}
                        readOnly
                        className="h-[40px] rounded-[4px] border-ui-border bg-slate-100"
                        inputClassName="text-xs sm:text-sm text-brand-dark font-medium"
                    />
                ) : (
                    <SelectField
                        value={values.type}
                        onChange={(event) => onChange('type', event.target.value)}
                        className="h-[40px] rounded-[4px] border-ui-border"
                        selectClassName="text-xs sm:text-sm text-brand-dark"
                    >
                        {config.typeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                )}
            </AccountsFormFieldRow>

            <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,430px)] lg:items-start">
                <div className="pt-2 lg:pt-1.5 flex items-center">
                    <CheckboxField
                        id={`accounts-sub-account-${excludeId ?? 'new'}`}
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
                        labelClassName="text-xs sm:text-sm font-normal text-brand-dark cursor-pointer"
                        inputClassName="mt-0 h-[18px] w-[18px] cursor-pointer"
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
                            queryParams={{
                                ...(excludeId ? { exclude_id: excludeId, exclude_children: true } : {}),
                                ...(values.type ? { account_type: values.type } : {}),
                            }}
                            getOptionLabel={(option) => option ? (option.code ? `${option.code} - ${option.name}` : option.name) : ''}
                            renderOption={(option) => (
                                <div className="flex flex-col gap-0.5 w-full py-0.5 select-none">
                                    <span className="truncate text-xs sm:text-sm font-normal text-brand-dark">
                                        {option.name}
                                    </span>
                                    <div className="flex justify-end text-[11px] sm:text-xs font-normal italic text-slate-500">
                                        <span>{option.code || option.id}</span>
                                    </div>
                                </div>
                            )}
                            onSelect={(option) => {
                                onChange('parentId', option.id);
                                onChange('parentAccount', [option.name]);
                                onChange('parentAccountLabel', `${option.code} - ${option.name}`);
                                onChange('parentAccountCode', option.code);
                                onChange('parentAccountName', option.name);
                                if (option.account_type && !values.type) {
                                    onChange('type', option.account_type);
                                }
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

            <AccountsFormFieldRow label={config.labels.code}>
                <TextInput
                    id="accounts-code"
                    name="code"
                    value={values.code || '(Otomatis)'}
                    readOnly
                    className="h-[40px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs sm:text-sm text-text-light"
                />
            </AccountsFormFieldRow>

            <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,430px)] lg:items-start">
                <div className="pt-2 lg:pt-1.5">
                    <AccountsFieldLabel label={config.labels.name} required />
                </div>
                <div>
                    <TextInput
                        value={values.name}
                        onChange={(event) => onChange('name', event.target.value)}
                        className="h-[40px] rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                    {['kas dan bank', 'cash/bank'].includes(String(values.type ?? '').toLowerCase().trim()) ? (
                        <p className="mt-2.5 text-xs sm:text-sm font-normal italic text-text-light leading-relaxed">
                            {config.helperText.nameExample}
                        </p>
                    ) : null}
                </div>
            </div>

            {isDetail ? (
                <AccountsFormFieldRow label={config.labels.balance}>
                    <div className={`pt-1 text-lg font-medium ${values.negative ? 'text-red-600' : 'text-brand-dark'}`}>
                        {values.balanceLabel || 'Rp 0'}
                    </div>
                </AccountsFormFieldRow>
            ) : null}
        </div>
    );
}
