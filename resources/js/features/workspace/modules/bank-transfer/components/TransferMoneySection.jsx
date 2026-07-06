import { useState, useEffect } from 'react';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import TransferValueInput from './TransferValueInput';

export default function TransferMoneySection({ config, values, setValues, handlers = {}, isDetail }) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <TransactionSectionHeading title={config.transferTitle} icon="document" />

            <div className="mt-4 grid gap-10 lg:grid-cols-2 pl-3 sm:pl-5">
                <section className="grid grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)] items-start gap-x-4 gap-y-2.5">
                    <TransactionFieldLabel label={config.labels.fromBank} required />
                    <AccountLookupField
                        id="fromBank"
                        value={values.fromBankAccounts?.[0] ?? ''}
                        placeholder={config.bankPlaceholder}
                        searchLabel="Cari kas/bank asal"
                        dialogTitle="Pilih Kas/Bank Asal"
                        queryParams={{ account_type: 'Cash/Bank', exclude_id: values.__toAccountId }}
                        showType={false}
                        onRemove={handlers.onRemoveFromBankAccount}
                        onSelectAccount={handlers.onSelectFromBankAccount}
                    />

                    <TransactionFieldLabel label={config.labels.transferValue} required />
                    <div className="max-w-[276px] w-full">
                        <TransferValueInput
                            prefix={values.transferPrefix}
                            value={values.transferValue}
                            maxWidthClassName=""
                            onChange={(event) => {
                                setValues((current) => ({
                                    ...current,
                                    transferValue: event.target.value,
                                }));
                            }}
                            onBlur={() => {
                                setValues((current) => ({
                                    ...current,
                                    blurredTransferValue: values.transferValue,
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
                        queryParams={{ account_type: 'Cash/Bank', exclude_id: values.__fromAccountId }}
                        showType={false}
                        onRemove={handlers.onRemoveToBankAccount}
                        onSelectAccount={handlers.onSelectToBankAccount}
                    />
                </section>
            </div>
        </div>
    );
}
