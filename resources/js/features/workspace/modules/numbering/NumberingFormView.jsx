import { useEffect, useMemo, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import { NumberingGeneralTab, NumberingUsersTab } from './NumberingSections';
import { buildDefaultValues, buildNumberingPreview } from './numberingShared';

export default function NumberingFormView({ form }) {
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'numbering');
    const [values, setValues] = useState(() => buildDefaultValues(form));

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'numbering');
        setValues(buildDefaultValues(form));
    }, [form]);

    const preview = useMemo(() => buildNumberingPreview(form, values), [form, values]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    return (
        <div className="flex h-full min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="shrink-0">
                <PreferencesTabs tabs={form.tabs} activeTabId={activeTabId} onSelectTab={setActiveTabId} className="border-b border-[#d5d9e1] bg-transparent pr-2 pt-[6px] sm:pr-2" />
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-5 px-4 py-4 lg:flex-row lg:items-stretch overflow-hidden">
                <div className="order-2 min-w-0 flex-1 lg:order-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col">
                    <div className="flex-1 min-h-0 flex flex-col">
                        {activeTabId === 'numbering-users' ? (
                            <NumberingUsersTab form={form} values={values} onChange={handleChange} />
                        ) : (
                            <NumberingGeneralTab form={form} values={values} onChange={handleChange} preview={preview} />
                        )}
                    </div>
                </div>

                <div className="order-1 flex justify-end lg:order-2 lg:shrink-0 lg:self-start">
                    <DockSaveButton label={form.saveLabel} />
                </div>
            </div>
        </div>
    );
}
