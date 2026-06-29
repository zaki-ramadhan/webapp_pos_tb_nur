import { Fragment } from 'react';

import TextInput from '@/components/ui/TextInput';
import Tooltip from '@/components/ui/Tooltip';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { InfoIcon } from '@/features/workspace/shared/Icons';
import { TransactionFieldLabel, TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupField, AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

function getSalesReturnInfo(value, label) {
    const map = {
        'returned': 'Semua barang yang diretur akan masuk kembali ke persediaan gudang.',
        'not-returned': 'Barang tidak dikembalikan fisik ke gudang (misalnya barang rusak/dibuang), namun nilai piutang tetap disesuaikan.',
        'partial-returned': 'Hanya sebagian barang yang diretur masuk kembali ke gudang fisik.',
    };
    return map[value] || `Informasi tentang ${label}`;
}

export default function SalesDocumentAdditionalInfoColumn({ config, values, setValues, isDetail, handlers }) {
    const additionalInfoLeadingFields = config.additionalInfoLeadingFields ?? [];
    const additionalLookupFields = config.additionalInfoLookupFields ?? [];
    const additionalTrailingFields = config.additionalInfoTrailingFields ?? [];

    function renderAdditionalField(field, key) {
        if (field.detailOnly && !isDetail) {
            return null;
        }

        if (field.createOnly && isDetail) {
            return null;
        }

        if (field.type === 'radio-group') {
            return (
                <div key={key} className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                    <TransactionFieldLabel label={field.label} required={field.required} />
                    <div className={`space-y-3 ${field.className ?? ''}`.trim()}>
                        {(field.options ?? []).map((option) => {
                            const checked = (values[field.valueKey] ?? '') === option.value;

                            return (
                                <label key={option.value} className="flex items-center gap-3 text-xs sm:text-sm text-brand-dark cursor-pointer">
                                    <input
                                        type="radio"
                                        name={field.valueKey}
                                        value={option.value}
                                        checked={checked}
                                        onChange={(event) =>
                                            setValues?.((current) => ({
                                                ...current,
                                                [field.valueKey]: event.target.value,
                                            }))
                                        }
                                        className="h-4.5 w-4.5 text-input-brand focus:ring-2 focus:ring-input-focus/30"
                                    />
                                    <span>{option.label}</span>
                                    {option.showInfoIcon ? (
                                        <Tooltip content={getSalesReturnInfo(option.value, option.label)} portal>
                                            <InfoIcon className="h-4.5 w-4.5 text-brand-dark cursor-help" />
                                        </Tooltip>
                                    ) : null}
                                </label>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (field.type === 'lookup') {
            return (
                <div key={key} className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                    <TransactionFieldLabel label={field.label} required={field.required} />
                    <ChipLookupField
                        values={values[field.valueKey] ?? []}
                        placeholder={field.placeholder ?? 'Cari/Pilih...'}
                        onRemove={() => {}}
                        searchLabel={field.searchLabel ?? field.label}
                        heightClassName={field.heightClassName ?? 'h-[34px]'}
                    />
                </div>
            );
        }

        if (field.type === 'textarea') {
            return (
                <div key={key} className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={field.label} required={field.required} />
                    <TextareaField
                        value={values[field.valueKey] ?? ''}
                        onChange={(event) =>
                            setValues?.((current) => ({
                                ...current,
                                [field.valueKey]: event.target.value,
                            }))
                        }
                        rows={4}
                        className="border-ui-border w-full"
                        textareaClassName="min-h-[72px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            );
        }

        return (
            <div key={key} className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={field.label} required={field.required} />
                <TextInput
                    value={values[field.valueKey] ?? ''}
                    onChange={(event) =>
                        setValues?.((current) => ({
                            ...current,
                            [field.valueKey]: event.target.value,
                        }))
                    }
                    className={field.className ?? 'h-[34px] rounded-[4px] border-ui-border w-full'}
                    inputClassName={field.inputClassName ?? 'text-xs sm:text-sm text-brand-dark'}
                />
            </div>
        );
    }

    return (
        <section className="pb-6">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="document" />

            <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">

                {additionalInfoLeadingFields.map((field, index) =>
                    renderAdditionalField(field, `${field.valueKey ?? field.label}-leading-${index}`),
                )}



                {additionalLookupFields.map((field, index) => renderAdditionalField(field, `${field.valueKey ?? field.label}-${index}`))}

                {config.showPurchaseOrderNumber !== false ? (
                    <div className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.purchaseOrderNumber} />
                        <TextInput
                            value={values.purchaseOrderNumber}
                            onChange={(event) =>
                                setValues?.((current) => ({
                                    ...current,
                                    purchaseOrderNumber: event.target.value,
                                }))
                            }
                            className="h-[34px] rounded-[4px] border-ui-border w-full"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </div>
                ) : null}

                <div className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.address} />
                    <TextareaField
                        value={values.address}
                        onChange={(event) =>
                            setValues?.((current) => ({
                                ...current,
                                address: event.target.value,
                            }))
                        }
                        rows={4}
                        className="w-full border-ui-border"
                        textareaClassName="min-h-[84px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>

                <div className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.notes} />
                    <TextareaField
                        value={values.notes}
                        onChange={(event) =>
                            setValues?.((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        rows={4}
                        className="border-ui-border w-full"
                        textareaClassName="min-h-[72px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>

                {additionalTrailingFields.map((field, index) => renderAdditionalField(field, `${field.valueKey ?? field.label}-trailing-${index}`))}

                {config.showContactField ? (
                    <div className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.contact ?? 'Kontak'} />
                        <AccountLookupField
                            id="contacts"
                            resource="employees"
                            values={values.contacts || []}
                            placeholder="Cari/Pilih Kontak..."
                            searchLabel="Cari kontak"
                            onSelectAccount={(record, label) => {
                                if (record && label) {
                                    setValues?.((current) => {
                                        const contacts = Array.isArray(current.contacts) ? [...current.contacts] : [];
                                        if (!contacts.includes(label)) {
                                            contacts.push(label);
                                        }
                                        return { ...current, contacts };
                                    });
                                }
                            }}
                            onRemove={(clearedLabel) => {
                                setValues?.((current) => {
                                    const contacts = (current.contacts || []).filter((item) => item !== clearedLabel);
                                    return { ...current, contacts };
                                });
                            }}
                        />
                    </div>
                ) : null}
            </div>
        </section>
    );
}
