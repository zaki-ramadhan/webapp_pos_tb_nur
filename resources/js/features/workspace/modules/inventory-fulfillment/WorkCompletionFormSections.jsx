import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    ReadonlyDocumentTextarea,
    SearchableTableSection,
} from '@/features/workspace/modules/shared/SalesDocumentSections';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { SearchIcon } from '@/features/workspace/shared/Icons';

export function WorkCompletionHeaderActions({ label }) {
    return (
        <div className="flex justify-end">
            <button
                type="button"
                className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
            >
                {label}
            </button>
        </div>
    );
}

export function WorkCompletionDetailsSection({ config, values }) {
    return (
        <SearchableTableSection
            searchValue={values.itemSearch}
            searchPlaceholder={config.itemSearchPlaceholder}
            title={values.itemCountLabel || config.itemSectionTitle}
            columns={config.itemTable.columns}
            rows={values.items}
            emptyLabel={config.itemTable.emptyLabel}
            minWidthClassName={config.itemTable.minWidthClassName}
            showTitleSearchButton
        />
    );
}

export function WorkCompletionAdditionalInfoSection({ config, values }) {
    return (
        <div className="min-h-[620px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.branch} required />
                <ChipLookupField values={values.branches} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari cabang" heightClassName="h-[34px]" />

                <TransactionFieldLabel label={config.labels.notes} />
                <ReadonlyDocumentTextarea value={values.notes} className="min-h-[84px]" />
            </div>
        </div>
    );
}

export function WorkCompletionHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-x-10 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <TransactionDateInput value={values.entryDate} className="max-w-[282px]" />

                    <TransactionFieldLabel label={config.labels.jobOrderNumber} required />
                    <TextInput
                        value={values.jobOrderNumber}
                        readOnly
                        placeholder={config.jobOrderPlaceholder}
                        trailing={!isDetail ? <SearchIcon className="h-5 w-5 text-[#111827]" /> : null}
                        className={`h-[40px] rounded-[4px] ${isDetail ? 'border-[#97da73] bg-[#f2ffee]' : 'border-[#cfd6e2]'}`.trim()}
                        inputClassName={`text-[15px] ${isDetail ? 'text-[#54a62e]' : 'text-[#1f2436]'}`.trim()}
                        trailingClassName="px-3"
                    />

                    <TransactionFieldLabel label={config.labels.completionType} />
                    <SelectField
                        value={values.completionType}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                completionType: event.target.value,
                            }))
                        }
                        className="h-[40px] max-w-[282px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.completionTypeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </div>

                <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                    <div className="flex items-center justify-start gap-4 sm:justify-end">
                        <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                        {!isDetail ? (
                            <TransactionSwitch
                                checked={values.autoNumber}
                                onChange={(nextValue) =>
                                    setValues((current) => ({
                                        ...current,
                                        autoNumber: nextValue,
                                    }))
                                }
                            />
                        ) : null}
                    </div>

                    {!isDetail && values.autoNumber ? (
                        <SelectField
                            value={values.numberingType}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    numberingType: event.target.value,
                                }))
                            }
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.numberingOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    ) : (
                        <TextInput
                            value={values.documentNumber}
                            readOnly
                            trailing={<span className="text-[18px] font-semibold text-[#1f2436]">×</span>}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                            trailingClassName="px-3"
                        />
                    )}

                    <div />
                    <WorkCompletionHeaderActions label={config.takeButtonLabel} />
                </div>
            </div>
        </div>
    );
}
