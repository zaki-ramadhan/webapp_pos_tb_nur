import { useMemo } from 'react';
import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { AccountsFieldLabel, AccountsFormFieldRow } from '../../accountsViewShared';

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
            <AccountsFormFieldRow label={config.labels.notes} className="lg:grid-cols-[180px_minmax(0,430px)]">
                <TextareaField
                    value={values.notes}
                    onChange={(event) => onChange('notes', event.target.value)}
                    rows={3}
                    className="rounded-[4px] border-ui-border"
                    textareaClassName="min-h-[68px] text-xs sm:text-sm text-brand-dark"
                />
            </AccountsFormFieldRow>


            <div className="border-b border-ui-border-medium pb-2.5">
                <h3 className="text-lg font-medium text-brand-dark">{config.headingLabels.userAccess}</h3>
            </div>

            <div className="space-y-3">
                <CheckboxField
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
                    labelClassName="text-xs sm:text-sm font-normal text-brand-dark"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />

                {!values.allUsers && (
                    <div className="space-y-3 pt-2">
                        <div className="text-xs sm:text-sm font-medium text-brand-dark">
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
