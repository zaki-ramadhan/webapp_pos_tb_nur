import { useEffect, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import SectionTab from '@/features/workspace/shared/SectionTab';
import { SaveIcon } from '@/features/workspace/shared/Icons';
import { PrefixedInput, PrefixedTextArea, ShippingFieldRow } from './ShippingSections';
import { buildDefaultValues } from './shippingShared';

export default function ShippingFormView({ form }) {
    const [values, setValues] = useState(() => buildDefaultValues(form));

    useEffect(() => {
        setValues(buildDefaultValues(form));
    }, [form]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    return (
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab label={form.sectionLabel} tone="accent" className="h-[34px]" />
            </div>

            <div className="flex min-h-[642px] flex-col gap-5 rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    <div className="space-y-4">
                        <ShippingFieldRow label={form.labels.name} required>
                            <TextInput
                                value={values.name}
                                onChange={(event) => handleChange('name', event.target.value)}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </ShippingFieldRow>

                        <ShippingFieldRow label={form.labels.pic}>
                            <TextInput
                                value={values.pic}
                                onChange={(event) => handleChange('pic', event.target.value)}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </ShippingFieldRow>

                        <ShippingFieldRow label={form.labels.phone}>
                            <TextInput
                                value={values.phone}
                                onChange={(event) => handleChange('phone', event.target.value)}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </ShippingFieldRow>

                        <ShippingFieldRow label={form.labels.address}>
                            <div className="space-y-3">
                                <PrefixedTextArea value={values.street} onChange={(event) => handleChange('street', event.target.value)} prefix="Jalan" />

                                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px]">
                                    <PrefixedInput value={values.city} onChange={(event) => handleChange('city', event.target.value)} prefix="Kota" />
                                    <PrefixedInput value={values.postalCode} onChange={(event) => handleChange('postalCode', event.target.value)} prefix="K.Pos" />
                                </div>

                                <PrefixedInput value={values.province} onChange={(event) => handleChange('province', event.target.value)} prefix="Provinsi" />

                                <PrefixedInput value={values.country} onChange={(event) => handleChange('country', event.target.value)} prefix="Negara" />
                            </div>
                        </ShippingFieldRow>
                    </div>
                </div>

                <div className="flex justify-end lg:shrink-0">
                    <DockActionButton label={form.saveLabel} tone="muted" icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />} />
                </div>
            </div>
        </div>
    );
}
