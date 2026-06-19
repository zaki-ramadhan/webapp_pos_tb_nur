import { useEffect, useMemo, useState } from 'react';

import { NumberingGeneralTab, NumberingUsersTab } from './NumberingSections';
import { buildDefaultValues, buildNumberingPreview } from './numberingShared';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';

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
        <ModuleFormTemplate
            form={form}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            status={null}
            saving={false}
            saveDisabled={true}
            onSave={undefined}
        >
            <div className="flex-1 min-h-0">
                {activeTabId === 'numbering-users' ? (
                    <NumberingUsersTab form={form} values={values} onChange={handleChange} />
                ) : (
                    <NumberingGeneralTab form={form} values={values} onChange={handleChange} preview={preview} />
                )}
            </div>
        </ModuleFormTemplate>
    );
}

