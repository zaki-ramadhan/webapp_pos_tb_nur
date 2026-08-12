import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { TableActionIcon } from '@/features/workspace/shared/Icons';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

function ModalFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[168px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className="pt-2 text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

export default function WorkOrderDetailTab({ values, setValues, errors = {} }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="space-y-3">
            <ModalFieldRow label="Kode Barang">
                <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-document-code">{values.code}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Nama Barang" required>
                <TextInput
                    value={values.name}
                    readOnly
                    error={errors.name}
                    trailing={<span className="text-xl font-semibold text-brand-dark">×</span>}
                    className="h-[36px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs text-brand-dark"
                    trailingClassName="px-3"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Kuantitas" required>
                <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
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

            <ModalFieldRow label="Gudang">
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
                    heightClassName="h-[36px]"
                />
            </ModalFieldRow>

            {!hideDepartment ? (
                <ModalFieldRow label="Departemen">
                    <ChipLookupField
                        values={values.department}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari departemen"
                        onRemove={(departmentValue) =>
                            setValues((current) => ({
                                ...current,
                                department: current.department.filter((item) => item !== departmentValue),
                            }))
                        }
                        heightClassName="h-[36px]"
                    />
                </ModalFieldRow>
            ) : null}
        </div>
    );
}
