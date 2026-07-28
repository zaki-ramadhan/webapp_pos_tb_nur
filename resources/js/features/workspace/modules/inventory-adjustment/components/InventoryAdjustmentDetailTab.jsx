import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { TableActionIcon } from '@/features/workspace/shared/Icons';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';

function ModalFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[156px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className="pt-2 text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

export default function InventoryAdjustmentDetailTab({ values, setValues, modal, errors = {} }) {
    return (
        <div className="space-y-3">
            <ModalFieldRow label="Kode #">
                <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-document-code">{values.code || '—'}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Nama Barang" required>
                <TextInput
                    value={values.name}
                    readOnly
                    placeholder="Klik cari untuk pilih produk..."
                    error={errors.name}
                    trailing={
                        <button
                            type="button"
                            onClick={async () => {
                                const record = await promptSelectBackendRecord(
                                    'items-services',
                                    'produk',
                                    (p) => `[${p.code ?? ''}] ${p.name ?? ''}`,
                                );
                                if (!record) return;
                                setValues((current) => ({
                                    ...current,
                                    __productId: record.id,
                                    name: record.name ?? '',
                                    code: record.code ?? '',
                                    unitLookup: record.base_unit?.name ? [record.base_unit.name] : current.unitLookup,
                                }));
                            }}
                            className="inline-flex h-full items-center px-3 text-xs font-medium text-brand-blue hover:text-brand-blue-darker"
                        >
                            Cari
                        </button>
                    }
                    className="h-[36px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs text-brand-dark"
                    trailingClassName="px-0 border-l border-ui-border"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Tipe Penyesuaian">
                <SelectField
                    value={values.adjustmentType}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            adjustmentType: event.target.value,
                        }))
                    }
                    className="h-[34px] rounded-[4px] border-ui-border"
                    selectClassName="text-xs text-brand-dark"
                    containerClassName="max-w-[204px]"
                >
                    {(modal.adjustmentTypeOptions ?? ['Penambahan', 'Pengurangan']).map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </ModalFieldRow>

            <ModalFieldRow label="Kuantitas" required>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_116px]">
                    <TextInput
                        value={values.quantity}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                quantity: event.target.value,
                            }))
                        }
                        trailing={<TableActionIcon className="h-4 w-4 text-text-darkest" />}
                        error={errors.quantity}
                        className="h-[36px] rounded-[4px] border-ui-border"
                        inputClassName="text-right text-xs text-brand-dark"
                        trailingClassName="px-3"
                    />
                    <ChipLookupField
                        values={values.unitLookup}
                        placeholder=""
                        searchLabel="Cari satuan"
                        onRemove={(unitValue) =>
                            setValues((current) => ({
                                ...current,
                                unitLookup: current.unitLookup.filter((item) => item !== unitValue),
                            }))
                        }
                        heightClassName="h-[36px]"
                    />
                </div>
            </ModalFieldRow>

            <ModalFieldRow label="Biaya Satuan">
                <FormattedAmountInput
                    value={values.unitCost}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            unitCost: event.target.value,
                        }))
                    }
                    prefix="Rp"
                    maxLength={11}
                    trailing={<TableActionIcon className="h-4 w-4 text-text-darkest" />}
                    className="h-[34px] rounded-[4px] border-ui-border"
                    prefixClassName="min-w-[36px] justify-center bg-input-prefix-bg-compact px-0 text-text-inactive"
                    inputClassName="text-right text-xs text-brand-dark"
                    trailingClassName="px-3"
                    containerClassName="max-w-[204px]"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Total Biaya">
                <TextInput
                    value={values.totalCost}
                    readOnly
                    className="h-[34px] rounded-[4px] border-ui-border bg-bg-workspace-input-panel"
                    inputClassName="text-right text-xs text-tab-view-active-text"
                    containerClassName="max-w-[204px]"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Gudang" required>
                <ChipLookupField
                    values={values.warehouse}
                    placeholder="Cari/Pilih..."
                    searchLabel="Cari gudang"
                    onRemove={(warehouseValue) =>
                        setValues((current) => ({
                            ...current,
                            warehouse: current.warehouse.filter((item) => item !== warehouseValue),
                        }))
                    }
                    error={errors.warehouse}
                    heightClassName="h-[36px]"
                    className="max-w-[204px]"
                />
            </ModalFieldRow>
        </div>
    );
}
