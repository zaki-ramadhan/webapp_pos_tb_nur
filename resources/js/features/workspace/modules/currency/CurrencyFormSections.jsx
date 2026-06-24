import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { currencyReferenceOptions } from '@/features/workspace/shared/referenceLookupData';

function CurrencyFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[180px_1fr] lg:items-start">
            <label className="pt-2 text-xs sm:text-sm leading-6 text-brand-dark">
                {label}
                {required ? <span className="text-tab-active-border-t"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

export function CurrencyDefaultAccountsSection({ config, values, setValues }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 max-w-[1180px]">
            {config.accountFields.map((field) => (
                <CurrencyFieldRow key={field.id} label={field.label}>
                    <AccountLookupField
                        value={values.defaultAccounts[field.id] ?? ''}
                        placeholder={config.accountPlaceholder}
                        searchLabel={`Cari ${field.label}`}
                        dialogTitle={`Pilih ${field.label}`}
                        onSelectAccount={(record, label) =>
                            setValues((current) => ({
                                ...current,
                                defaultAccounts: {
                                    ...current.defaultAccounts,
                                    [field.id]: label,
                                },
                                defaultAccountIds: {
                                    ...current.defaultAccountIds,
                                    [field.id]: record?.id ?? null,
                                },
                            }))
                        }
                        onRemove={() =>
                            setValues((current) => ({
                                ...current,
                                defaultAccounts: {
                                    ...current.defaultAccounts,
                                    [field.id]: '',
                                },
                                defaultAccountIds: {
                                    ...current.defaultAccountIds,
                                    [field.id]: null,
                                },
                            }))
                        }
                    />
                </CurrencyFieldRow>
            ))}
        </div>
    );
}

export function CurrencyGeneralSection({ config, values, setValues, isDetailMode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 max-w-[1180px]">
            <CurrencyFieldRow label={config.labels.countryName} required>
                {isDetailMode ? (
                    <ChipLookupField
                        value={values.countryName}
                        placeholder={config.lookupPlaceholder}
                        searchLabel="Cari negara atau nama mata uang"
                        disabled
                    />
                ) : (
                    <ReferenceLookupInput
                        value={values.countryName}
                        placeholder={config.lookupPlaceholder}
                        searchLabel="Cari negara atau nama mata uang"
                        items={currencyReferenceOptions}
                        getOptionLabel={(option) => option.name}
                        getOptionSearchText={(option) =>
                            [option.name, option.currencyCode, option.symbol, option.countryCode].join(' ')
                        }
                        onSelect={(option) =>
                            setValues((current) => ({
                                ...current,
                                countryName: option?.name ?? '',
                                code: option?.currencyCode ?? '',
                                symbol: option?.symbol ?? '',
                                countryCode: option?.countryCode ?? '',
                            }))
                        }
                        onClear={() =>
                            setValues((current) => ({
                                ...current,
                                countryName: '',
                                code: '',
                                symbol: '',
                                countryCode: '',
                            }))
                        }
                        emptyTitle="Mata uang tidak ditemukan"
                        emptyDescription="Coba cari nama, kode, atau simbol mata uang."
                        renderOption={(option) => (
                            <div className="min-w-0">
                                <div className="truncate text-xs sm:text-sm font-medium text-text-workspace-dark">{option.name}</div>
                                <div className="mt-0.5 text-xs text-text-muted">
                                    {option.currencyCode} • {option.symbol}
                                </div>
                            </div>
                        )}
                    />
                )}
            </CurrencyFieldRow>

            {isDetailMode ? (
                <>
                    <CurrencyFieldRow label={config.labels.code}>
                        <div className="pt-2 text-base font-semibold text-text-workspace-dark">{values.code}</div>
                    </CurrencyFieldRow>

                    <CurrencyFieldRow label={config.labels.symbol}>
                        <div className="pt-2 text-base font-semibold text-text-workspace-dark">{values.symbol}</div>
                    </CurrencyFieldRow>

                    <CurrencyFieldRow label="Kurs (ke IDR)">
                        <div className="pt-2 text-base font-semibold text-text-workspace-dark">
                            {values.exchangeRate ? `Rp ${Number(values.exchangeRate).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : '1.0000'}
                        </div>
                    </CurrencyFieldRow>
                </>
            ) : null}
        </div>
    );
}
