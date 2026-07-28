import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

function ModalFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[156px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className="pt-2 text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

export default function InventoryAdjustmentInfoTab({ values, setValues }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="space-y-3">
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

            <ModalFieldRow label="Keterangan">
                <TextareaField
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="rounded-[4px] border-ui-border"
                    textareaClassName="min-h-[92px] text-xs text-brand-dark"
                />
            </ModalFieldRow>
        </div>
    );
}
