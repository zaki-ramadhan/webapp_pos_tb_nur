import { useMemo, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import RadioField from '@/components/ui/RadioField';
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
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

export function ItemGeneralInfoSection({ config, values, onChange, isDetail, isLoading }) {
    const [trailingQty, setTrailingQty] = useState('');

    const baseUnit = values.primaryUnit?.[0] ?? null;
    const baseUnitName = baseUnit?.name ?? (typeof baseUnit === 'string' ? baseUnit : (values.unitName ?? ''));
    const baseUnitId = values.baseUnitId ?? (typeof baseUnit === 'object' ? baseUnit?.id : null);
    const conversions = Array.isArray(values.unitConversions) ? values.unitConversions : [];

    const selectedUnitIds = useMemo(() => {
        const ids = new Set();
        if (baseUnitId) ids.add(Number(baseUnitId));
        conversions.forEach((c) => {
            const uid = c.unitId ?? c.unit?.[0]?.id;
            if (uid) ids.add(Number(uid));
        });
        return ids;
    }, [baseUnitId, conversions]);

    const handleConversionChange = (index, field, value) => {
        const nextConversions = conversions.map((conv, i) => {
            if (i !== index) return conv;
            return { ...conv, [field]: value };
        });
        onChange('unitConversions', nextConversions);
    };

    const handleConversionSelectUnit = (index, option) => {
        const nextConversions = conversions.map((conv, i) => {
            if (i !== index) return conv;
            return {
                ...conv,
                unitId: option.id,
                unitName: option.name,
                unit: [{ id: option.id, name: option.name }],
            };
        });
        onChange('unitConversions', nextConversions);
    };

    const handleConversionRemove = (index) => {
        const nextConversions = conversions.filter((_, i) => i !== index);
        onChange('unitConversions', nextConversions);
    };

    const handleTrailingUnitSelect = (option) => {
        const newConv = {
            id: 'conv-' + Date.now(),
            unitId: option.id,
            unitName: option.name,
            unit: [{ id: option.id, name: option.name }],
            quantity: trailingQty || '',
        };
        onChange('unitConversions', [...conversions, newConv]);
        setTrailingQty('');
    };

    return (
        <section className="space-y-2">
            <SectionHeading title={config.labels.generalInfo} />

            <FormRow label="Nama Barang" required>
                <ClearableTextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    maxLength={150}
                    minLength={1}
                    isLoading={isLoading}
                />
            </FormRow>

            <FormRow label="Kategori Barang" required>
                <BackendLookupField
                    resource="product-categories"
                    value={values.category?.[0]?.name ?? (typeof values.category?.[0] === 'string' ? values.category[0] : (values.categoryName ?? ''))}
                    placeholder="Cari/Pilih Kategori..."
                    searchLabel="Cari kategori barang"
                    onSelect={(option) => {
                        onChange('category', [{ id: option.id, name: option.name }]);
                        onChange('categoryId', option.id);
                    }}
                    onClear={() => {
                        onChange('category', []);
                        onChange('categoryId', null);
                    }}
                />
            </FormRow>

            <FormRow
                label="Jenis Barang"
                info="Pilih jenis barang sesuai fungsinya. Untuk barang yang menghitung stok dan nilai persediaan, pilih Persediaan. Tipe tidak dapat diubah setelah disimpan."
            >
                <SelectField
                    value={values.kind}
                    onChange={(event) => onChange('kind', event.target.value)}
                    className="h-[40px] rounded-[4px] border-ui-border"
                    selectClassName="text-xs sm:text-sm text-brand-dark"
                >
                    {config.kindOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </FormRow>

            <CodeFieldRow values={values} onChange={onChange} isDetail={isDetail} isLoading={isLoading} />

            {values.kind !== 'Non Persediaan' && (
                <FormRow
                    label="UPC/Barcode"
                    info="Kode barcode standar yang dapat dibaca oleh alat Scanner/Barcode Reader."
                >
                    <ClearableTextInput
                        value={values.barcode}
                        onChange={(event) => onChange('barcode', event.target.value)}
                        maxLength={64}
                        isLoading={isLoading}
                    />
                </FormRow>
            )}

            <FormRow label="Satuan" required>
                <div className="w-full space-y-2">
                    {/* Satuan 1 (Dasar) */}
                    <div className="w-full max-w-[220px]">
                        <BackendLookupField
                            resource="units"
                            value={baseUnitName}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari satuan"
                            filterOption={(option) => !selectedUnitIds.has(Number(option.id)) || Number(option.id) === Number(baseUnitId)}
                            onSelect={(option) => {
                                onChange('primaryUnit', [{ id: option.id, name: option.name }]);
                                onChange('baseUnitId', option.id);
                            }}
                            onClear={() => {
                                onChange('primaryUnit', []);
                                onChange('baseUnitId', null);
                                onChange('unitConversions', []);
                                setTrailingQty('');
                            }}
                        />
                    </div>

                    {/* Baris Multi Satuan (Konversi yang sudah ada) */}
                    {baseUnitId && conversions.map((conv, index) => {
                        const currentUnitId = conv.unitId ?? conv.unit?.[0]?.id;
                        const currentUnitName = conv.unitName ?? conv.unit?.[0]?.name ?? '';
                        return (
                            <div key={conv.id || `conv-${index}`} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="w-full max-w-[220px] shrink-0">
                                    <BackendLookupField
                                        resource="units"
                                        value={currentUnitName}
                                        placeholder="Cari/Pilih..."
                                        searchLabel="Cari satuan konversi"
                                        filterOption={(option) => !selectedUnitIds.has(Number(option.id)) || Number(option.id) === Number(currentUnitId)}
                                        onSelect={(option) => handleConversionSelectUnit(index, option)}
                                        onClear={() => handleConversionRemove(index)}
                                    />
                                </div>
                                <span className="text-gray-500 font-medium text-sm select-none shrink-0">=</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={conv.quantity ?? ''}
                                    onChange={(e) => handleConversionChange(index, 'quantity', e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''))}
                                    className="w-16 h-[34px] sm:h-[38px] text-center px-1 text-xs sm:text-sm border border-ui-border rounded bg-white text-brand-dark focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shrink-0"
                                    aria-label={`Rasio satuan ${currentUnitName || index + 2} terhadap ${baseUnitName}`}
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700 select-none shrink-0 max-w-[120px] truncate">
                                    {baseUnitName}
                                </span>
                            </div>
                        );
                    })}

                    {/* Baris Trailing Kosong untuk Menambah Konversi Baru */}
                    {baseUnitId && (
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <div className="w-full max-w-[220px] shrink-0">
                                <BackendLookupField
                                    resource="units"
                                    value=""
                                    placeholder="Cari/Pilih..."
                                    searchLabel="Tambah satuan multi"
                                    filterOption={(option) => !selectedUnitIds.has(Number(option.id))}
                                    onSelect={handleTrailingUnitSelect}
                                    onClear={() => {}}
                                />
                            </div>
                            <span className="text-gray-500 font-medium text-sm select-none shrink-0">=</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={trailingQty}
                                onChange={(e) => setTrailingQty(e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''))}
                                className="w-16 h-[34px] sm:h-[38px] text-center px-1 text-xs sm:text-sm border border-ui-border rounded bg-white text-brand-dark focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shrink-0"
                                aria-label={`Rasio satuan baru terhadap ${baseUnitName}`}
                            />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 select-none shrink-0 max-w-[120px] truncate">
                                {baseUnitName}
                            </span>
                        </div>
                    )}
                </div>
            </FormRow>
        </section>
    );
}
