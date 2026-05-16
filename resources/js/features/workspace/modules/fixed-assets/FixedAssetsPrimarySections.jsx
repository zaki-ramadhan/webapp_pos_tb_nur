import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    AccountLookupField,
} from '@/features/workspace/shared/AccountLookupControls';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    FixedAssetFieldRow,
    FixedAssetsProcessButton,
    InlineCheckboxField,
    SectionCard,
} from '@/features/workspace/modules/fixed-assets/fixedAssetsViewShared';

export function FixedAssetsHeader({ config, values, setValues, isDetail }) {
    return (
        <SectionCard>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] xl:items-start">
                <div className="grid gap-4 sm:max-w-[700px]">
                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.name} required />
                        <TextInput
                            value={values.name}
                            readOnly={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                            trailing={isDetail ? <span className="text-[22px] font-semibold text-[#1f2436]">×</span> : null}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                            trailingClassName="px-3"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <TransactionFieldLabel label={config.labels.purchaseDate} required />
                            <TransactionDateInput value={values.purchaseDate} className="w-full" />
                        </div>
                        <div className="grid gap-2">
                            <TransactionFieldLabel label={config.labels.usageDate} required />
                            <TransactionDateInput value={values.usageDate} className="w-full" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 xl:justify-self-end xl:min-w-[420px]">
                    <div className="flex flex-wrap items-center justify-start gap-3 xl:justify-end">
                        <TransactionFieldLabel label={config.labels.code} required />
                        {!isDetail ? (
                            <TransactionSwitch
                                checked={values.autoCode}
                                onChange={(nextValue) =>
                                    setValues((current) => ({
                                        ...current,
                                        autoCode: nextValue,
                                    }))
                                }
                            />
                        ) : null}

                        {values.autoCode && !isDetail ? (
                            <SelectField
                                value={values.codeType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        codeType: event.target.value,
                                    }))
                                }
                                containerClassName="w-full xl:w-[400px]"
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#1f2436]"
                            >
                                {config.codeTypeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <TextInput
                                value={values.code}
                                readOnly
                                trailing={isDetail ? <span className="text-[22px] font-semibold text-[#1f2436]">×</span> : null}
                                className="h-[40px] w-full rounded-[4px] border-[#cfd6e2] xl:w-[400px]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>

                    {isDetail ? (
                        <div className="flex justify-end">
                            <FixedAssetsProcessButton items={values.processItems ?? []} />
                        </div>
                    ) : null}
                </div>
            </div>
        </SectionCard>
    );
}

export function FixedAssetsGeneralSection({ config, values, setValues, isDetail }) {
    return (
        <SectionCard className="min-h-[620px]">
            <TransactionSectionHeading title="Informasi umum" icon="info" />

            <div className="mt-5 grid gap-5 xl:grid-cols-2 xl:gap-x-9">
                <div className="space-y-4">
                    <FixedAssetFieldRow label={config.labels.intangibleAsset}>
                        {isDetail ? (
                            <TextInput
                                value={values.intangibleAsset ? 'Ya' : 'Tidak'}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                                inputClassName="text-[15px] text-[#4b5565]"
                            />
                        ) : (
                            <InlineCheckboxField checked={values.intangibleAsset} />
                        )}
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.depreciationMethod}>
                        {isDetail ? (
                            <TextInput
                                value={values.depreciationMethod}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                                inputClassName="text-[15px] text-[#4b5565]"
                            />
                        ) : (
                            <SelectField
                                value={values.depreciationMethod}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        depreciationMethod: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#1f2436]"
                            >
                                {config.depreciationMethodOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        )}
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.assetAccount} required>
                        <AccountLookupField
                            values={values.assetAccount}
                            placeholder="Cari/Pilih Akun Perkiraan..."
                            searchLabel="Cari akun aset"
                            dialogTitle="Pilih Akun Aset"
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    assetAccount: label ? [label] : [],
                                }))
                            }
                        />
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.accumulatedDepreciationAccount} required>
                        <AccountLookupField
                            values={values.accumulatedDepreciationAccount}
                            placeholder="Cari/Pilih Akun Perkiraan..."
                            searchLabel="Cari akun akumulasi penyusutan"
                            dialogTitle="Pilih Akun Akumulasi Penyusutan"
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    accumulatedDepreciationAccount: label ? [label] : [],
                                }))
                            }
                        />
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.depreciationExpenseAccount} required>
                        <AccountLookupField
                            values={values.depreciationExpenseAccount}
                            placeholder="Cari/Pilih Akun Perkiraan..."
                            searchLabel="Cari akun beban penyusutan"
                            dialogTitle="Pilih Akun Beban Penyusutan"
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    depreciationExpenseAccount: label ? [label] : [],
                                }))
                            }
                        />
                    </FixedAssetFieldRow>
                </div>

                <div className="space-y-4">
                    <FixedAssetFieldRow label={config.labels.quantity} required>
                        <TextInput
                            value={values.quantity}
                            readOnly={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    quantity: event.target.value,
                                }))
                            }
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[286px]"
                            inputClassName="text-right text-[15px] text-[#1f2436]"
                        />
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.assetLife} required>
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,286px)_auto] sm:items-center">
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                <TextInput
                                    value={values.assetLifeYears}
                                    readOnly={isDetail}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            assetLifeYears: event.target.value,
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-right text-[15px] text-[#1f2436]"
                                />
                                <span className="text-[15px] text-[#1f2436]">Tahun</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                <TextInput
                                    value={values.assetLifeMonths}
                                    readOnly={isDetail}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            assetLifeMonths: event.target.value,
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-right text-[15px] text-[#1f2436]"
                                />
                                <span className="text-[15px] text-[#1f2436]">Bulan</span>
                            </div>
                        </div>
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.ratio}>
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,286px)_auto] sm:items-center">
                            <TextInput
                                value={values.ratio}
                                readOnly={isDetail}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        ratio: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-right text-[15px] text-[#1f2436]"
                            />
                            <span className="text-[15px] text-[#1f2436]">%</span>
                        </div>
                    </FixedAssetFieldRow>

                    <FixedAssetFieldRow label={config.labels.residualValue}>
                        <FormattedAmountInput
                            value={values.residualValue}
                            readOnly={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    residualValue: event.target.value,
                                }))
                            }
                            prefix="Rp"
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[286px]"
                            inputClassName="text-right text-[15px] text-[#1f2436]"
                            prefixClassName="min-w-[46px] justify-center px-0 text-[#7a8498]"
                        />
                    </FixedAssetFieldRow>
                </div>
            </div>
        </SectionCard>
    );
}
