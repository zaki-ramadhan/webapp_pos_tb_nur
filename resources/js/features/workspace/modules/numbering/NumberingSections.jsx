import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { PlusIcon } from '@/features/workspace/shared/Icons';
import { findLabelByValue } from './numberingShared';

function NumberingFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,420px)] lg:items-center">
            <label className="text-xs sm:text-sm text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function NumberingComponentsBuilder({ form, values, onChange }) {
    const selectedLabels = values.selectedComponents.map((componentId) => findLabelByValue(form.componentOptions, componentId));

    function handleAddComponent() {
        if (!values.componentPicker || values.selectedComponents.includes(values.componentPicker)) {
            return;
        }

        onChange('selectedComponents', [...values.selectedComponents, values.componentPicker]);
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1 max-w-[390px]">
                    <SelectField
                        value={values.componentPicker}
                        onChange={(event) => onChange('componentPicker', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
                    >
                        {form.componentOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                </div>

                <button
                    type="button"
                    onClick={handleAddComponent}
                    className="inline-flex h-[40px] w-[56px] items-center justify-center rounded-[6px] bg-[#66bf13] text-white transition hover:bg-[#5aad12]"
                    aria-label="Tambah komponen penomoran"
                >
                    <PlusIcon className="h-6 w-6" />
                </button>
            </div>

            {selectedLabels.length ? (
                <div className="flex flex-wrap gap-2">
                    {selectedLabels.map((label) => (
                        <span key={label} className="inline-flex items-center rounded-[5px] border border-[#b8d1f1] bg-[#eef5ff] px-2.5 py-1 text-sm text-[#295089]">
                            {label}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function NumberingGeneralTab({ form, values, onChange, preview }) {
    return (
        <div className="space-y-3">
            <NumberingFieldRow label="Nama" required>
                <TextInput value={values.name} onChange={(event) => onChange('name', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
            </NumberingFieldRow>

            <NumberingFieldRow label="Tipe Transaksi">
                <SelectField value={values.transactionType} onChange={(event) => onChange('transactionType', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                    {form.transactionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            </NumberingFieldRow>

            <NumberingFieldRow label="Tipe Penomoran">
                <SelectField value={values.numberingType} onChange={(event) => onChange('numberingType', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                    {form.numberingTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            </NumberingFieldRow>

            <NumberingFieldRow label="Jumlah Digit Counter" required>
                <TextInput
                    value={values.counterDigits}
                    onChange={(event) => onChange('counterDigits', event.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                    className="h-[40px] w-[106px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                />
            </NumberingFieldRow>

            <NumberingFieldRow label="Komponen Penomoran">
                <NumberingComponentsBuilder form={form} values={values} onChange={onChange} />
            </NumberingFieldRow>

            <NumberingFieldRow label="Contoh hasil penomoran">
                <div className="min-h-[24px] pt-1 text-base font-semibold text-[#131a28]">{preview}</div>
            </NumberingFieldRow>
        </div>
    );
}

export function NumberingUsersTab({ form, values, onChange }) {
    return (
        <div className="space-y-4">
            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-lg font-medium text-[#1f2436]">{form.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="numbering-all-users"
                label={form.userAccess.allUsersLabel}
                checked={values.userScopeAll}
                onChange={(event) => onChange('userScopeAll', event.target.checked)}
                align="center"
                labelClassName="text-base"
                inputClassName="mt-0 h-[18px] w-[18px]"
            />
        </div>
    );
}
