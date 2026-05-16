import { useEffect, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import { BranchGeneralTab, BranchUsersTab } from './BranchSections';
import { buildDefaultValues } from './branchShared';

export default function BranchFormView({ form }) {
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'branch-general');
    const [values, setValues] = useState(() => buildDefaultValues(form));

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'branch-general');
        setValues(buildDefaultValues(form));
    }, [form]);

    function handleChange(field, nextValue) {
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

            <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    {activeTabId === 'branch-users' ? (
                        <BranchUsersTab form={form} values={values} onChange={handleChange} />
                    ) : (
                        <BranchGeneralTab values={values} onChange={handleChange} />
                    )}
                </div>

                <div className="flex justify-end lg:shrink-0">
                    <DockSaveButton label={form.saveLabel} />
                </div>
            </div>
        </div>
    );
}
