import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { EmployeeFieldRow } from '@/features/workspace/modules/employee/employeeViewShared';
import { SuggestionTextInput, ToggleSwitch } from '@/features/workspace/modules/employee/employeeControls';

const POSITION_SUGGESTIONS = [
    'Kasir',
    'Kuli Muat',
    'Kuli',
    'Sopir',
    'Pemilik Toko',
];

export default function EmployeeGeneralTab({ form, values, errors, onChange }) {
    return (
        <div className="grid grid-cols-1 gap-x-12 gap-y-4 lg:grid-cols-2">
            <div className="space-y-3.5 min-w-0">
                <EmployeeFieldRow label="Nama Lengkap" required>
                    <TextInput name="full_name" value={values.fullName} onChange={(event) => onChange('fullName', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Posisi Jabatan">
                    <SuggestionTextInput
                        name="position"
                        value={values.position}
                        onChange={(nextValue) => onChange('position', nextValue)}
                        options={POSITION_SUGGESTIONS}
                        placeholder="Pilih / ketik posisi (misal: Kasir Toko, Staf Gudang & Muat...)"
                        className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Email">
                    <TextInput name="email" value={values.email} onChange={(event) => onChange('email', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="No. Handphone / WhatsApp">
                    <TextInput name="mobile_phone" value={values.mobilePhone} onChange={(event) => onChange('mobilePhone', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
            </div>

            <div className="space-y-3.5 min-w-0">
                <EmployeeFieldRow label="Tgl Masuk">
                    <TransactionDateInput name="joined_at" value={values.joinDate} onChange={(nextValue) => onChange('joinDate', nextValue)} disableAutoInit={true} className="w-full max-w-[354px]" inputClassName="text-xs sm:text-sm text-brand-dark" trailingClassName="w-[42px] shrink-0 justify-center px-0" />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="No. KTP">
                    <TextInput name="identity_number" value={values.identityNumber} onChange={(event) => onChange('identityNumber', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Catatan">
                    <TextareaField name="notes" value={values.note} onChange={(event) => onChange('note', event.target.value)} rows={4} className="rounded-[4px] border-ui-border w-full max-w-[430px]" textareaClassName="min-h-[80px] px-3 py-3 text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
            </div>
        </div>
    );
}
