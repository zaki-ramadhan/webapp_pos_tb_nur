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
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="shrink-0">
                <PreferencesTabs
                    tabs={form.tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                />
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-4 lg:flex-row overflow-hidden pt-0">
                <div className="flex flex-1 min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden px-4 py-4 -mt-px">
                    <div className="order-2 min-w-0 flex-1 lg:order-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col">
                        <div className="flex-1 min-h-0 flex flex-col">
                            {activeTabId === 'numbering-users' ? (
                                <NumberingUsersTab form={form} values={values} onChange={handleChange} />
                            ) : (
                                <NumberingGeneralTab form={form} values={values} onChange={handleChange} preview={preview} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="order-1 flex shrink-0 flex-row justify-start gap-3 lg:order-2 lg:shrink-0 lg:self-start lg:flex-col lg:w-[112px] lg:items-center pt-3 lg:pt-4">
                    <DockSaveButton label={form.saveLabel} />
                </div>
            </div>
        </div>
    );
}
