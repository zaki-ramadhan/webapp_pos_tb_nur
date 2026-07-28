import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
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

export default function DepartmentGeneralTab({ form, values, onChange, parentDepartmentOptions }) {
    return (
        <div className="space-y-4">
            <DepartmentFieldRow label={form.labels.name} required>
                <TextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    className="h-[40px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                />
            </DepartmentFieldRow>

            <DepartmentFieldRow label={form.labels.description}>
                <TextareaField
                    value={values.description}
                    onChange={(event) => onChange('description', event.target.value)}
                    rows={4}
                    className="rounded-[4px] border-ui-border"
                    textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                />
            </DepartmentFieldRow>

            <div className="lg:pl-[192px]">
                <CheckboxField
                    id="department-sub-department"
                    label={form.labels.subDepartment}
                    checked={values.isSubDepartment}
                    onChange={(event) => onChange('isSubDepartment', event.target.checked)}
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>

            {values.isSubDepartment ? (
                <DepartmentFieldRow label={form.labels.subDepartment}>
                    <ReferenceLookupInput
                        value={values.parentDepartmentName}
                        items={parentDepartmentOptions}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari parent departemen"
                        className="max-w-[710px]"
                        getOptionLabel={(option) => option.label}
                        getOptionSearchText={(option) => option.searchText}
                        renderOption={(option) => renderReferenceOptionPrimary(option, option.code)}
                        onSelect={(option) => onChange('parentDepartment', option)}
                        onClear={() => onChange('parentDepartment', null)}
                    />
                </DepartmentFieldRow>
            ) : null}
        </div>
    );
}
