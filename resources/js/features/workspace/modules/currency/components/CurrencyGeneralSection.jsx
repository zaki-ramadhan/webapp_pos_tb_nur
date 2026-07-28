import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { currencyReferenceOptions } from '@/features/workspace/shared/referenceLookupData';
import CurrencyFieldRow from './CurrencyFieldRow';

export default function CurrencyGeneralSection({ config, values, setValues, isDetailMode }) {
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
