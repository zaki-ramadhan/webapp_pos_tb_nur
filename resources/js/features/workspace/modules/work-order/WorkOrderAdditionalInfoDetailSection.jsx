import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { SearchIcon } from '@/features/workspace/shared/Icons';

export default function WorkOrderAdditionalInfoDetailSection({ config, values, setValues, isDetail }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 space-y-3">
                <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.customerReference} />
                    <TextInput
                        value={values.customerReference}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                customerReference: event.target.value,
                            }))
                        }
                        readOnly={isDetail}
                        placeholder="Cari/Pilih Pelanggan..."
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.expenseAccount} />
                    {isDetail ? (
                        <TextInput
                            value={values.expenseAccountText}
                            readOnly
                            className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#5f6980]"
                        />
                    ) : (
                        <AccountLookupField
                            values={values.expenseAccounts}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari akun biaya"
                            dialogTitle="Pilih Akun Biaya"
                            onRemove={(accountValue) =>
                                setValues((current) => ({
                                    ...current,
                                    expenseAccounts: current.expenseAccounts.filter((item) => item !== accountValue),
                                }))
                            }
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    expenseAccounts: label ? [label] : [],
                                    expenseAccountText: label,
                                }))
                            }
                            heightClassName="h-[36px]"
                        />
                    )}
                </div>

                <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.varianceAccount} />
                    {isDetail ? (
                        <TextInput
                            value={values.varianceAccountText}
                            readOnly
                            className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#5f6980]"
                        />
                    ) : (
                        <AccountLookupField
                            values={values.varianceAccounts}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari akun selisih biaya"
                            dialogTitle="Pilih Akun Selisih Biaya"
                            onRemove={(accountValue) =>
                                setValues((current) => ({
                                    ...current,
                                    varianceAccounts: current.varianceAccounts.filter((item) => item !== accountValue),
                                }))
                            }
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    varianceAccounts: label ? [label] : [],
                                    varianceAccountText: label,
                                }))
                            }
                            heightClassName="h-[36px]"
                        />
                    )}
                </div>

                <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.branch} required />
                    <ChipLookupField
                        values={values.branches}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari cabang"
                        onRemove={(branchValue) =>
                            setValues((current) => ({
                                ...current,
                                branches: current.branches.filter((item) => item !== branchValue),
                            }))
                        }
                        heightClassName="h-[36px]"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.notes} />
                    <TextareaField
                        value={values.notes}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        rows={4}
                        className="rounded-[4px] border-[#cfd6e2]"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>

                {isDetail ? (
                    <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-center">
                        <TransactionFieldLabel label={config.labels.closeJob} />
                        <label className="inline-flex items-center gap-3 text-xs sm:text-sm text-[#1f2436]">
                            <input
                                type="checkbox"
                                checked={values.closeJob}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        closeJob: event.target.checked,
                                    }))
                                }
                                className="h-5 w-5 rounded border border-[#cfd6e2]"
                            />
                            <span>Ya</span>
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#7aa2d5] text-sm text-[#21539b]">
                                i
                            </span>
                        </label>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
