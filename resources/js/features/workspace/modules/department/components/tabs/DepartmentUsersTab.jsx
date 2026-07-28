import CheckboxField from '@/components/ui/CheckboxField';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';

function DepartmentFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,430px)] lg:items-start">
            <label className="pt-2 text-xs sm:text-sm leading-6 text-brand-dark">
                {label}
                {required ? <span className="text-tab-active-border-t"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function renderReferenceOptionPrimary(item, secondaryText = '') {
    return (
        <div className="min-w-0">
            <div className="truncate text-xs sm:text-sm font-medium text-text-workspace-dark">{item.label}</div>
            {secondaryText ? (
                <div className="mt-0.5 truncate text-xs text-text-placeholder">{secondaryText}</div>
            ) : null}
        </div>
    );
}

export default function DepartmentUsersTab({ form, values, onChange, branchOptions, userOptions }) {
    const filteredUserOptions = userOptions;

    return (
        <div className="space-y-4">
            <div className="border-b border-ui-border-medium pb-2.5">
                <h3 className="text-lg font-medium text-brand-dark">{form.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="department-all-users"
                label={form.userAccess.allUsersLabel}
                checked={values.allUsers}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-base"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName="w-auto"
            />

            {!values.allUsers ? (
                <div className="space-y-3">
                    <div className="pt-1">
                        <h3 className="text-lg font-medium text-brand-dark">
                            {form.userAccess.limitedTitle ?? 'Tentukan pengguna yang dapat memilih departemen ini'}
                        </h3>
                    </div>

                    <DepartmentFieldRow label={form.userAccess.userLabel ?? 'Pengguna'}>
                        <div className="space-y-2">
                            <ReferenceLookupInput
                                values={values.selectedUserLabels}
                                items={filteredUserOptions}
                                placeholder={form.userAccess.userPlaceholder ?? 'Cari/Pilih...'}
                                searchLabel="Cari pengguna"
                                className="max-w-[1220px]"
                                getOptionLabel={(option) => option.label}
                                getOptionSearchText={(option) => option.searchText}
                                renderOption={(option) => renderReferenceOptionPrimary(option, option.email || option.branchLabels.join(', '))}
                                onSelect={(option) => onChange('selectedUser', option)}
                                onRemove={(label) => onChange('removeSelectedUser', label)}
                            />
                            {!values.selectedUserLabels.length ? (
                                <p className="text-sm text-text-placeholder">
                                    Pilih pengguna yang diizinkan memakai departemen ini.
                                </p>
                            ) : null}
                        </div>
                    </DepartmentFieldRow>
                </div>
            ) : null}
        </div>
    );
}
