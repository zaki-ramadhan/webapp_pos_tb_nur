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
                <div className="flex flex-col gap-y-2.5 w-full">
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.fromBank} required htmlFor="fromBank" />
                        <div className="w-full">
                            <AccountLookupField
                                id="fromBank"
                                value={values.fromBankAccounts?.[0] ?? ''}
                                placeholder={config.bankPlaceholder}
                                searchLabel="Cari kas/bank asal"
                                dialogTitle="Pilih Kas/Bank Asal"
                                queryParams={{ account_type: 'Cash/Bank', exclude_id: values.__toAccountId, leaf_only: true }}
                                showType={false}
                                onRemove={handlers.onRemoveFromBankAccount}
                                onSelectAccount={handlers.onSelectFromBankAccount}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.transferValue} required htmlFor="transferValue" />
                        <div className="max-w-[320px] w-full">
                            <TransferValueInput
                                id="transferValue"
                                prefix={values.transferPrefix}
                                value={values.transferValue}
                                maxWidthClassName="w-full"
                                onChange={(event) => {
                                    const nextVal = event.target.value;
                                    setValues((current) => ({
                                        ...current,
                                        transferValue: nextVal,
                                        blurredTransferValue: nextVal,
                                    }));
                                }}
                                onBlur={(event) => {
                                    const nextVal = event.target.value;
                                    setValues((current) => ({
                                        ...current,
                                        transferValue: nextVal,
                                        blurredTransferValue: nextVal,
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    {isDetail || values.transferWords ? (
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)] items-start gap-x-4">
                            <div />
                            <div className="text-base italic text-brand-dark">{values.transferWords}</div>
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col gap-y-2.5 w-full">
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.toBank} required htmlFor="toBank" />
                        <div className="w-full">
                            <AccountLookupField
                                id="toBank"
                                value={values.toBankAccounts?.[0] ?? ''}
                                placeholder={config.bankPlaceholder}
                                searchLabel="Cari kas/bank tujuan"
                                dialogTitle="Pilih Kas/Bank Tujuan"
                                queryParams={{ account_type: 'Cash/Bank', exclude_id: values.__fromAccountId, leaf_only: true }}
                                showType={false}
                                onRemove={handlers.onRemoveToBankAccount}
                                onSelectAccount={handlers.onSelectToBankAccount}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
