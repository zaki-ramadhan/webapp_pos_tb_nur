import SelectField from '@/components/ui/SelectField';
import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    ClearableTextInput,
    CodeFieldRow,
    FormRow,
    LookupField,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import {
    isWorkspaceControlInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';

export function ItemGeneralInfoSection({ config, values, onChange, isDetail }) {
    return (
        <section className="space-y-4">
            <SectionHeading title={config.labels.generalInfo} />

            <FormRow label="Nama Barang" required>
                <ClearableTextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                />
            </FormRow>

            <FormRow label="Kategori Barang" required>
                <LookupField
                    values={values.category}
                    placeholder="Cari/Pilih..."
                    searchLabel="Cari kategori barang"
                    onRemove={(item) =>
                        onChange(
                            'category',
                            values.category.filter((value) => value !== item),
                        )
                    }
                />
            </FormRow>

            <FormRow label="Jenis Barang" info>
                <SelectField
                    value={values.kind}
                    onChange={(event) => onChange('kind', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-[15px] text-[#1f2436]"
                >
                    {config.kindOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </FormRow>

            <CodeFieldRow values={values} onChange={onChange} isDetail={isDetail} />

            <FormRow label="UPC/Barcode" info>
                <ClearableTextInput
                    value={values.barcode}
                    onChange={(event) => onChange('barcode', event.target.value)}
                />
            </FormRow>

            <FormRow label="Satuan" required>
                <div className="space-y-3">
                    <LookupField
                        values={values.primaryUnit}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari satuan"
                        onRemove={(item) =>
                            onChange(
                                'primaryUnit',
                                values.primaryUnit.filter((value) => value !== item),
                            )
                        }
                        className="max-w-[420px]"
                    />

                    {values.unitConversions.map((conversion, index) => (
                        <div
                            key={conversion.id}
                            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_26px_86px_auto] sm:items-center"
                        >
                            <LookupField
                                values={conversion.unit}
                                placeholder="Cari/Pilih..."
                                searchLabel={`Cari satuan konversi ${index + 1}`}
                                onRemove={(item) =>
                                    onChange(
                                        'unitConversions',
                                        values.unitConversions.map((entry) =>
                                            entry.id === conversion.id
                                                ? {
                                                      ...entry,
                                                      unit: entry.unit.filter(
                                                          (value) => value !== item,
                                                      ),
                                                  }
                                                : entry,
                                        ),
                                    )
                                }
                                className="max-w-[332px]"
                            />
                            <span className="text-center text-[18px] text-[#1f2436]">=</span>
                            <SimpleTextField
                                value={conversion.quantity}
                                onChange={(event) =>
                                    onChange(
                                        'unitConversions',
                                        values.unitConversions.map((entry) =>
                                            entry.id === conversion.id
                                                ? {
                                                      ...entry,
                                                      quantity: event.target.value,
                                                  }
                                                : entry,
                                        ),
                                    )
                                }
                                className="h-[34px]"
                                inputClassName="text-right"
                            />
                            <span className="text-[15px] text-[#1f2436]">
                                {conversion.baseUnit}
                            </span>
                        </div>
                    ))}
                </div>
            </FormRow>
        </section>
    );
}

export function ItemMoreInfoSection({ config, values, onChange }) {
    const isBrandFieldInactive = isWorkspaceControlInactive('item-brand-field');

    return (
        <section className="space-y-4">
            <SectionHeading title={config.labels.moreInfo} />

            <FormRow label="Merek Barang">
                <div className="space-y-2">
                    <LookupField
                        values={values.brand}
                        placeholder="Cari/Pilih Merek..."
                        searchLabel="Cari merek"
                        onRemove={(item) =>
                            onChange(
                                'brand',
                                values.brand.filter((value) => value !== item),
                            )
                        }
                        disabled={isBrandFieldInactive}
                    />
                    {isBrandFieldInactive ? (
                        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#9a7b35]">
                            <span className="rounded-full bg-[#f6dfab] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b6511]">
                                {WORKSPACE_INACTIVE_BADGE_LABEL}
                            </span>
                            <span>{WORKSPACE_INACTIVE_HINT}</span>
                        </div>
                    ) : null}
                </div>
            </FormRow>

            <div className="flex items-center gap-10 pt-2">
                <TransactionSwitch
                    checked={values.serialEnabled}
                    onChange={(nextValue) => onChange('serialEnabled', nextValue)}
                />
                <span className="text-[17px] text-[#1f2436]">
                    Aktifkan No. Seri/Produksi
                </span>
            </div>
        </section>
    );
}
