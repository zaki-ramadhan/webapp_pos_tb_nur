import { useEffect, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import {
    AttachmentSelectButton,
    buildEmployeeFormValues,
    validateEmployeeWebsite,
} from '@/features/workspace/modules/employee/employeeViewShared';
import {
    EmployeeAddressTab,
    EmployeeBankTab,
    EmployeeGeneralTab,
    EmployeeTaxTab,
} from './EmployeeSections';

export default function EmployeeFormView({ form }) {
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'employee-general');
    const [values, setValues] = useState(() => buildEmployeeFormValues(form));
    const [errors, setErrors] = useState(() => ({
        website: validateEmployeeWebsite(form.defaults?.website ?? ''),
    }));

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'employee-general');
        setValues(buildEmployeeFormValues(form));
        setErrors({
            website: validateEmployeeWebsite(form.defaults?.website ?? ''),
        });
    }, [form]);

    function handleChange(field, nextValue) {
        if (field === 'website') {
            setErrors((currentErrors) => ({
                ...currentErrors,
                website: validateEmployeeWebsite(nextValue),
            }));
        }

        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={form.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[740px] flex-col gap-5 px-4 py-4 xl:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-3 py-3 sm:px-4 sm:py-4">
                    {activeTabId === 'employee-address' ? (
                        <EmployeeAddressTab values={values} onChange={handleChange} />
                    ) : activeTabId === 'employee-tax' ? (
                        <EmployeeTaxTab form={form} values={values} onChange={handleChange} />
                    ) : activeTabId === 'employee-bank' ? (
                        <EmployeeBankTab form={form} values={values} onChange={handleChange} />
                    ) : (
                        <EmployeeGeneralTab form={form} values={values} errors={errors} onChange={handleChange} />
                    )}
                </div>

                <div className="flex shrink-0 flex-row justify-start gap-3 self-start xl:flex-col">
                    <DockSaveButton label={form.saveLabel} />
                    <AttachmentSelectButton label={form.attachmentLabel} />
                </div>
            </div>
        </div>
    );
}
