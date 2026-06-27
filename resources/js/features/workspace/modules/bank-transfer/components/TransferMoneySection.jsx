import { useState, useEffect } from 'react';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import TransferValueInput from './TransferValueInput';

export default function TransferMoneySection({ config, values, setValues, handlers = {}, isDetail }) {
    const [localValue, setLocalValue] = useState(values.transferValue);

    useEffect(() => {
        setLocalValue(values.transferValue);
    }, [values.transferValue]);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <TransactionSectionHeading title={config.transferTitle} icon="document" />

            <div className="mt-4 grid gap-10 lg:grid-cols-2">
                <section className="grid grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)] items-start gap-x-4 gap-y-2.5">
                    <TransactionFieldLabel label={config.labels.fromBank} required />
                    <AccountLookupField
                        id="fromBank"
                        value={values.fromBankAccounts?.[0] ?? ''}
                        placeholder={config.bankPlaceholder}
                        searchLabel="Cari kas/bank asal"
                        dialogTitle="Pilih Kas/Bank Asal"
                        queryParams={{ account_type: 'Cash/Bank' }}
                        showType={false}
                        onRemove={handlers.onRemoveFromBankAccount}
                        onSelectAccount={handlers.onSelectFromBankAccount}
                    />

                    <TransactionFieldLabel label={config.labels.transferValue} required />
                    <div className="max-w-[276px] w-full">
                        <TransferValueInput
                            prefix={values.transferPrefix}
                            value={localValue}
                            maxWidthClassName=""
                            onChange={(event) => setLocalValue(event.target.value)}
                            onBlur={() => {
                                setValues((current) => ({
                                    ...current,
                                    transferValue: localValue,
                                }));
                            }}
                        />
                    </div>

                    {isDetail || values.transferWords ? (
                        <>
                            <div />
                            <div className="text-base italic text-brand-dark">{values.transferWords}</div>
                        </>
                    ) : null}
                </section>

                <section className="grid grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)] items-start gap-x-4 gap-y-2.5">
                    <TransactionFieldLabel label={config.labels.toBank} required />
                    <AccountLookupField
                        id="toBank"
                        value={values.toBankAccounts?.[0] ?? ''}
                        placeholder={config.bankPlaceholder}
                        searchLabel="Cari kas/bank tujuan"
                        dialogTitle="Pilih Kas/Bank Tujuan"
                        queryParams={{ account_type: 'Cash/Bank' }}
                        showType={false}
                        onRemove={handlers.onRemoveToBankAccount}
                        onSelectAccount={handlers.onSelectToBankAccount}
                    />
                </section>
            </div>
        </div>
    );
}
