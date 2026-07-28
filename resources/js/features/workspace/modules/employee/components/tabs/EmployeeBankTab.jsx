import { useEffect, useState } from 'react';
import axios from 'axios';
import TextInput from '@/components/ui/TextInput';
import { EmployeeFieldRow } from '@/features/workspace/modules/employee/employeeViewShared';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';

export default function EmployeeBankTab({ form, values, onChange }) {
    const [banks, setBanks] = useState([]);

    useEffect(() => {
        axios.get('/api/backend/banks')
            .then((res) => {
                setBanks(res.data || []);
            })
            .catch(() => {
                setBanks([]);
            });
    }, []);

    return (
        <div className="max-w-[980px] space-y-3.5">
            <EmployeeFieldRow label="Nama Bank">
                <ReferenceLookupInput
                    value={values.bankName}
                    items={banks}
                    onSelect={(item) => onChange('bankName', item.name)}
                    onClear={() => onChange('bankName', '')}
                    placeholder="Cari/Pilih Bank..."
                    searchLabel="Cari bank"
                    className="w-full max-w-[430px]"
                    getOptionLabel={(option) => option.name}
                    getOptionSearchText={(option) => `${option.name} ${option.code}`}
                    renderOption={(option) => (
                        <div className="min-w-0">
                            <div className="truncate text-xs sm:text-sm font-medium text-text-workspace-dark">{option.name}</div>
                            <div className="mt-0.5 truncate text-[13px] font-normal text-black">{option.code}</div>
                        </div>
                    )}
                />
            </EmployeeFieldRow>
            <EmployeeFieldRow label="No Rekening"><TextInput name="bank_accounts.0.account_number" value={values.bankAccountNumber} onChange={(event) => onChange('bankAccountNumber', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" /></EmployeeFieldRow>
            <EmployeeFieldRow label="Atas Nama Rekening"><TextInput name="bank_accounts.0.account_name" value={values.bankAccountHolder} onChange={(event) => onChange('bankAccountHolder', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" /></EmployeeFieldRow>
        </div>
    );
}
