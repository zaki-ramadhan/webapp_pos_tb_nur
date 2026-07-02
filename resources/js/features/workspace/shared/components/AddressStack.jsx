import React from 'react';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';

export default function AddressStack({ prefixValue = 'Jalan', values, readOnly = false, layout = 'grid', onChange = null }) {
    const handleSelectCity = (item) => {
        onChange?.('city', item.city);
        onChange?.('province', item.province);
        onChange?.('postalCode', item.postalCode);
        onChange?.('country', item.country);
    };

    return (
        <div className="space-y-3">
            <TextareaField
                value={values.street}
                onChange={(event) => onChange?.('street', event.target.value)}
                readOnly={readOnly}
                rows={4}
                prefix={prefixValue}
                className="rounded-[4px] border-slate-400"
                prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                textareaClassName="min-h-[112px] text-xs sm:text-sm text-brand-dark"
            />

            {layout === 'vertical' ? (
                <>
                    <CityAutocompleteInput
                        value={values.city}
                        onChange={(nextValue) => onChange?.('city', nextValue)}
                        onSelectCity={handleSelectCity}
                        prefix="Kota"
                        disabled={readOnly}
                        prefixClassName="min-w-[92px] border-slate-400 bg-input-prefix-bg px-3 text-xs sm:text-sm text-slate-600"
                        dropdownLeftOffsetClassName="left-[92px]"
                    />

                    <TextInput
                        value={values.postalCode}
                        onChange={(event) => onChange?.('postalCode', event.target.value.replace(/[^0-9]/g, ''))}
                        readOnly={readOnly}
                        prefix="Kode Pos"
                        className="h-[40px] rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                </>
            ) : (
                <div className="grid gap-3 grid-cols-[minmax(0,1fr)_190px]">
                    <CityAutocompleteInput
                        value={values.city}
                        onChange={(nextValue) => onChange?.('city', nextValue)}
                        onSelectCity={handleSelectCity}
                        prefix="Kota"
                        disabled={readOnly}
                        prefixClassName="min-w-[62px] border-slate-400 bg-input-prefix-bg px-3 text-xs sm:text-sm text-slate-600"
                        dropdownLeftOffsetClassName="left-[62px]"
                    />
                    <TextInput
                        value={values.postalCode}
                        onChange={(event) => onChange?.('postalCode', event.target.value.replace(/[^0-9]/g, ''))}
                        readOnly={readOnly}
                        prefix="K.Pos"
                        className="h-[40px] rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[50px] bg-input-prefix-bg px-2.5 text-slate-600"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            )}

            <TextInput
                value={values.province}
                onChange={(event) => onChange?.('province', event.target.value)}
                readOnly={readOnly}
                prefix="Provinsi"
                className="h-[40px] rounded-[4px] border-slate-400"
                prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                inputClassName="text-xs sm:text-sm text-brand-dark"
            />

            <TextInput
                value={values.country}
                onChange={(event) => onChange?.('country', event.target.value)}
                readOnly={readOnly}
                prefix="Negara"
                className="h-[40px] rounded-[4px] border-slate-400"
                prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                inputClassName="text-xs sm:text-sm text-brand-dark"
            />
        </div>
    );
}
