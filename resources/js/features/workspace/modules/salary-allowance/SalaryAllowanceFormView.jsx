import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import SectionTab from '@/features/workspace/shared/SectionTab';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { CloseIcon, SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';

export default function SalaryAllowanceFormView({ pageId, activeLevel2Tab, config, entry, actions, editableDetail = false }) {
    const fields = config.fields;
    const isDetail = Boolean(entry.name) && entry.id !== config.newEntry.id;
    const [name, setName] = useState(entry.name ?? '');
    const [type, setType] = useState(entry.type || config.typeOptions[0] || '');
    const [expenseAccount, setExpenseAccount] = useState(entry.expenseAccount ?? '');

    useEffect(() => {
        setName(entry.name ?? '');
        setType(entry.type || config.typeOptions[0] || '');
        setExpenseAccount(entry.expenseAccount ?? '');
    }, [config.typeOptions, entry.expenseAccount, entry.name, entry.type]);

    const initialComparable = useMemo(
        () => ({
            name: entry.name ?? '',
            type: entry.type || config.typeOptions[0] || '',
            expenseAccount: entry.expenseAccount ?? '',
        }),
        [config.typeOptions, entry.expenseAccount, entry.name, entry.type],
    );

    const currentComparable = useMemo(
        () => ({
            name,
            type,
            expenseAccount,
        }),
        [expenseAccount, name, type],
    );

    const validationMessage = validateRequiredChecks([
        { label: fields.nameLabel, value: name },
        { label: fields.expenseAccountLabel, value: expenseAccount },
    ]);
    const isDirty = !areComparableValuesEqual(initialComparable, currentComparable);
    const resolvedSaveDisabled = Boolean(validationMessage) || !isDirty;

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <div className="min-h-full rounded-[4px] border border-[#d3d9e5] bg-[#f4f4f5] px-3 pb-3 pt-2">
            <SectionTab label={config.sectionLabel} />

            <div className="flex min-h-[598px] items-start rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                <div className="grid w-full content-start gap-x-7 gap-y-4 lg:grid-cols-[228px_minmax(0,640px)] lg:items-start">
                    <label className="pt-2 text-[18px] text-[#1f2436]">
                        {fields.nameLabel} <span className="text-[#ED3969]">*</span>
                    </label>
                    <TextInput
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        trailing={isDetail ? <CloseIcon className="h-4.5 w-4.5" /> : null}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[17px] text-[#1f2436]"
                    />

                    <div className="pt-2 text-[18px] text-[#1f2436]">{fields.typeLabel}</div>
                    {isDetail && !editableDetail ? (
                        <TextInput
                            value={entry.type}
                            readOnly
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f3f3f4]"
                            inputClassName="text-[17px] text-[#6a7286]"
                        />
                    ) : (
                        <SelectField
                            value={type}
                            onChange={(event) => setType(event.target.value)}
                            className="h-[42px] rounded-[4px] border-[#7fb0ee] shadow-[0_0_0_3px_rgba(127,176,238,0.12)]"
                            selectClassName="text-[17px] text-[#1f2436]"
                        >
                            {config.typeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    )}

                    <div className="pt-2 text-[18px] text-[#1f2436]">{fields.payDeductLabel}</div>
                    <TextInput
                        value={entry.payDeduct}
                        readOnly
                        className="h-[40px] max-w-[390px] rounded-[4px] border-[#cfd6e2] bg-[#f3f3f4]"
                        inputClassName="text-[17px] text-[#6a7286]"
                    />

                    <label className="pt-2 text-[18px] text-[#1f2436]">
                        {fields.expenseAccountLabel} <span className="text-[#ED3969]">*</span>
                    </label>
                    <AccountLookupField
                        value={expenseAccount}
                        placeholder="Cari/Pilih Akun Perkiraan..."
                        disabled={isDetail}
                        searchLabel="Cari akun beban"
                        dialogTitle="Pilih Akun Beban"
                        heightClassName="min-h-[38px]"
                        className="rounded-[4px] border-[#cfd6e2]"
                        contentClassName="px-3 py-1.5"
                        chipClassName="text-[#24324a]"
                        onRemove={() => setExpenseAccount('')}
                        onSelectAccount={(_, label) => setExpenseAccount(label)}
                    />

                    {isDetail ? (
                        <>
                            <div className="pt-2 text-[18px] text-[#1f2436]">{fields.inactiveLabel}</div>
                            <label className="inline-flex h-[40px] items-center gap-3 text-[18px] text-[#1f2436]">
                                <input
                                    type="checkbox"
                                    defaultChecked={entry.inactive}
                                    className="h-6 w-6 rounded-[4px] border border-[#cfd6e2] text-[#2d61ab] focus:ring-[#2d61ab]"
                                />
                                <span>{fields.inactiveOptionLabel}</span>
                            </label>
                        </>
                    ) : null}
                </div>

                <div className="ml-5 flex w-[96px] shrink-0 flex-col gap-3">
                    {actions.map((action) => (
                        <DockActionButton
                            key={action.id}
                            label={action.label}
                            tone={action.tone === 'danger' ? 'danger' : 'primary'}
                            disabled={action.id === 'save' ? resolvedSaveDisabled : false}
                            icon={action.icon === 'trash' ? <TrashIcon className="h-7 w-7 sm:h-8 sm:w-8" /> : <SaveIcon className="h-7 w-7 sm:h-8 sm:w-8" />}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
