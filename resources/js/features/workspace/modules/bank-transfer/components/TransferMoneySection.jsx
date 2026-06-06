import { useState } from 'react';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { applyBankTransferComputedValues } from '@/features/workspace/modules/bank-transfer/bankTransferShared';
import TransferValueInput from './TransferValueInput';

export default function TransferMoneySection({ config, values, setValues, handlers = {}, isDetail }) {
    const [fetchingRate, setFetchingRate] = useState(false);

    async function handleFetchRate() {
        const fromLabel = values.fromBankAccounts?.[0] || '';
        const toLabel = values.toBankAccounts?.[0] || '';

        const getCurrency = (label) => {
            if (!label) return '';
            const match = label.match(/-\s*([A-Z]{3})/i) || label.match(/\[([A-Z]{3})\]/i) || label.match(/\b([A-Z]{3})\b$/i);
            return match ? match[1].toUpperCase() : '';
        };

        const fromCurrency = getCurrency(fromLabel) || 'IDR';
        const toCurrency = getCurrency(toLabel) || 'IDR';

        if (fromCurrency === toCurrency) {
            setValues((current) => applyBankTransferComputedValues({
                ...current,
                exchangeRate: '1',
                exchangeRateLabel: `1 ${fromCurrency} = 1 ${toCurrency} (Mata Uang Sama)`,
            }));
            window.alert(`Mata uang sama (${fromCurrency}). Kurs diset ke 1.`);
            return;
        }

        setFetchingRate(true);
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            if (!response.ok) {
                throw new Error('Gagal menghubungi API kurs.');
            }
            const data = await response.json();
            const rates = data.rates;

            if (rates && rates[fromCurrency] !== undefined && rates[toCurrency] !== undefined) {
                const rate = rates[toCurrency] / rates[fromCurrency];
                
                setValues((current) => applyBankTransferComputedValues({
                    ...current,
                    exchangeRate: String(rate.toFixed(4)),
                    exchangeRateLabel: `1 ${fromCurrency} = ${rate.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${toCurrency} (API Real-time)`,
                }));
                window.alert(`Berhasil mengambil kurs: 1 ${fromCurrency} = ${rate.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${toCurrency}`);
            } else {
                throw new Error(`Data kurs tidak tersedia untuk ${fromCurrency} atau ${toCurrency}.`);
            }
        } catch (err) {
            window.alert(`Gagal mengambil kurs real-time: ${err.message}`);
        } finally {
            setFetchingRate(false);
        }
    }

    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.transferTitle} icon="document" />

            <div className="mt-4 grid gap-10 xl:grid-cols-2">
                <section className="grid gap-y-4 sm:grid-cols-[280px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.fromBank} required />
                    <ChipLookupField
                        values={values.fromBankAccounts}
                        placeholder={config.bankPlaceholder}
                        onRemove={handlers.onRemoveFromBankAccount}
                        onSearch={handlers.onSelectFromBankAccount}
                        searchLabel="Cari kas bank asal"
                    />

                    <TransactionFieldLabel label={config.labels.fromBranch} required />
                    <ChipLookupField
                        values={values.fromBranches}
                        placeholder={config.branchPlaceholder}
                        onRemove={handlers.onRemoveFromBranch}
                        onSearch={handlers.onSelectFromBranch}
                        searchLabel="Cari cabang asal"
                    />

                    <TransactionFieldLabel label={config.labels.exchangeRate} />
                    <div className="max-w-[276px]">
                        {values.exchangeRateLabel ? (
                            <div className="mb-1 text-[13px] text-slate-500 font-medium">{values.exchangeRateLabel}</div>
                        ) : null}
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <TransferValueInput
                                    prefix="Rp"
                                    value={values.exchangeRate}
                                    onChange={(event) => setValues((current) => applyBankTransferComputedValues({ ...current, exchangeRate: event.target.value }))}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleFetchRate}
                                disabled={fetchingRate}
                                className="inline-flex shrink-0 items-center justify-center h-[34px] px-3 rounded-[4px] border border-slate-200 bg-white text-[13px] font-semibold text-[#ED3969] shadow-sm transition hover:bg-slate-50 disabled:opacity-60 disabled:pointer-events-none"
                            >
                                {fetchingRate ? '...' : 'Ambil Kurs API'}
                            </button>
                        </div>
                    </div>

                    <TransactionFieldLabel label={config.labels.transferValue} required />
                    <div className="max-w-[276px]">
                        <TransferValueInput
                            prefix={values.transferPrefix}
                            value={values.transferValue}
                            maxWidthClassName=""
                            onChange={(event) => setValues((current) => ({ ...current, transferValue: event.target.value }))}
                        />
                    </div>

                    {isDetail || values.transferWords ? (
                        <>
                            <div />
                            <div className="text-[17px] italic text-[#1f2436]">{values.transferWords}</div>
                        </>
                    ) : null}
                </section>

                <section className="grid gap-y-4 sm:grid-cols-[280px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.toBank} required />
                    <ChipLookupField
                        values={values.toBankAccounts}
                        placeholder={config.bankPlaceholder}
                        onRemove={handlers.onRemoveToBankAccount}
                        onSearch={handlers.onSelectToBankAccount}
                        searchLabel="Cari kas bank tujuan"
                    />

                    <TransactionFieldLabel label={config.labels.toBranch} required />
                    <ChipLookupField
                        values={values.toBranches}
                        placeholder={config.branchPlaceholder}
                        onRemove={handlers.onRemoveToBranch}
                        onSearch={handlers.onSelectToBranch}
                        searchLabel="Cari cabang tujuan"
                    />

                    <TransactionFieldLabel label={config.labels.resultValue} required />
                    <TransferValueInput
                        prefix={values.resultPrefix}
                        value={values.resultValue}
                        readOnly
                    />

                    {isDetail || values.resultWords ? (
                        <>
                            <div />
                            <div className="text-[17px] italic text-[#1f2436]">{values.resultWords}</div>
                        </>
                    ) : null}
                </section>
            </div>
        </div>
    );
}
